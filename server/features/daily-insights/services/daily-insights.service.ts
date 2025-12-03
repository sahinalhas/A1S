import * as repository from '../repository/daily-insights.repository.js';
import * as studentsRepo from '../../students/repository/students.repository.js';
import { PatternAnalysisService } from '../../../services/pattern-analysis.service.js';
import { StudentContextService } from '../../../services/student-context.service.js';
import { AIProviderService } from '../../../services/ai-provider.service.js';
import AIPromptBuilder from '../../../services/ai-prompt-builder.service.js';
import type { DailyInsight, StudentDailyStatus, ProactiveAlert, DailyInsightsSummary } from '../../../../shared/types/daily-insights.types.js';

const patternAnalysis = new PatternAnalysisService();
const contextService = new StudentContextService();
const aiProvider = AIProviderService.getInstance();

/**
 * Günlük insight oluştur - Ana fonksiyon
 * Her gün otomatik çalışmalı
 * @param schoolId - Okul ID (zorunlu - okul bazlı insight için)
 * @param date - Tarih (opsiyonel, default: bugün)
 */
export async function generateDailyInsight(schoolId: string, date?: string): Promise<DailyInsight> {
  if (!schoolId) {
    throw new Error('schoolId is required for generateDailyInsight');
  }
  
  const insightDate = date || new Date().toISOString().split('T')[0];
  
  // Bu okula ait öğrencileri al
  const allStudents = studentsRepo.loadStudentsBySchool(schoolId);
  
  // Her öğrenci için günlük durum oluştur
  const studentStatuses: StudentDailyStatus[] = [];
  const proactiveAlerts: ProactiveAlert[] = [];
  
  for (const student of allStudents) {
    const status = await analyzeStudentDaily(student.id, insightDate);
    studentStatuses.push(status);
    
    // Pattern analizi yap ve uyarı oluştur
    const alerts = await detectProactiveAlerts(student.id, insightDate);
    proactiveAlerts.push(...alerts);
  }
  
  // İstatistikler hesapla
  const highRiskCount = studentStatuses.filter(s => s.overallStatus === 'ACİL').length;
  const mediumRiskCount = studentStatuses.filter(s => s.overallStatus === 'DİKKAT').length;
  const criticalAlertsCount = proactiveAlerts.filter(a => a.severity === 'KRİTİK').length;
  
  // AI ile özet oluştur
  const aiSummary = await generateAISummary(studentStatuses, proactiveAlerts);
  
  // Öneriler oluştur
  const priorityActions = generatePriorityActions(studentStatuses, proactiveAlerts);
  const suggestedMeetings = generateMeetingSuggestions(studentStatuses);
  
  // Daily insight kaydet (okul bazlı)
  const insight: Omit<DailyInsight, 'id' | 'generatedAt'> & { schoolId: string } = {
    schoolId,
    insightDate,
    reportType: 'GÜNLÜK',
    summary: aiSummary.summary,
    totalStudents: allStudents.length,
    highRiskCount,
    mediumRiskCount,
    criticalAlertsCount,
    newAlertsCount: proactiveAlerts.length,
    keyFindings: aiSummary.keyFindings,
    priorityActions: JSON.stringify(priorityActions),
    suggestedMeetings: JSON.stringify(suggestedMeetings),
    aiInsights: aiSummary.insights,
    trendAnalysis: aiSummary.trends,
    generatedBy: 'system'
  };
  
  const id = repository.createDailyInsight(insight);
  
  return {
    ...insight,
    id,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Öğrenci için günlük durum analizi
 */
async function analyzeStudentDaily(studentId: string, date: string): Promise<StudentDailyStatus> {
  // Pattern analizi
  const patterns = await patternAnalysis.analyzeStudentPatterns(studentId);
  
  // Kritik pattern var mı?
  const hasCritical = patterns.some(p => p.severity === 'CRITICAL');
  const hasWarning = patterns.some(p => p.severity === 'WARNING');
  
  // Genel durum belirle
  let overallStatus: 'İYİ' | 'DİKKAT' | 'ACİL' = 'İYİ';
  if (hasCritical) {
    overallStatus = 'ACİL';
  } else if (hasWarning) {
    overallStatus = 'DİKKAT';
  }
  
  const status: Omit<StudentDailyStatus, 'id' | 'created_at'> = {
    studentId,
    statusDate: date,
    overallStatus,
    statusNotes: patterns.length > 0 ? patterns[0].description : undefined,
    needsAttention: hasCritical || hasWarning ? 1 : 0,
    hasNewAlert: patterns.length > 0 ? 1 : 0,
    hasCriticalAlert: hasCritical ? 1 : 0,
    detectedPatterns: JSON.stringify(patterns.map(p => p.title))
  };
  
  const id = repository.createStudentDailyStatus(status);
  
  return {
    ...status,
    id,
    created_at: new Date().toISOString()
  };
}

/**
 * Proaktif uyarılar tespit et
 */
async function detectProactiveAlerts(studentId: string, date: string): Promise<ProactiveAlert[]> {
  const alerts: Omit<ProactiveAlert, 'id' | 'detectedAt'>[] = [];
  const patterns = await patternAnalysis.analyzeStudentPatterns(studentId);
  
  for (const pattern of patterns) {
    // Pattern'i alert'e çevir
    let alertCategory: ProactiveAlert['alertCategory'];
    
    if (pattern.category === 'TREND' && pattern.title.includes('Düşüş')) {
      alertCategory = 'AKADEMİK_DÜŞÜŞ';
    } else if (pattern.category === 'PATTERN' && pattern.title.includes('Davranış')) {
      alertCategory = 'DAVRANIŞSAL_PATTERN';
    } else if (pattern.title.includes('Devamsızlık')) {
      alertCategory = 'DEVAMSIZLIK_ARTIŞI';
    } else if (pattern.title.includes('Performans Yükselişi')) {
      alertCategory = 'POZİTİF_GELİŞİM';
    } else if (pattern.severity === 'CRITICAL') {
      alertCategory = 'RİSK_ARTIŞI';
    } else {
      continue;
    }
    
    const severity = pattern.severity === 'CRITICAL' ? 'KRİTİK' : 
                     pattern.severity === 'WARNING' ? 'YÜKSEK' : 'BİLGİ';
    
    alerts.push({
      studentId,
      alertCategory,
      severity: severity as ProactiveAlert['severity'],
      title: pattern.title,
      description: pattern.description,
      evidence: JSON.stringify(pattern.evidence),
      recommendation: pattern.recommendation,
      status: 'YENİ'
    });
  }
  
  // Alert'leri kaydet
  const savedAlerts: ProactiveAlert[] = [];
  for (const alert of alerts) {
    const id = repository.createProactiveAlert(alert);
    savedAlerts.push({
      ...alert,
      id,
      detectedAt: new Date().toISOString()
    });
  }
  
  return savedAlerts;
}

/**
 * AI ile günlük özet oluştur
 */
async function generateAISummary(
  statuses: StudentDailyStatus[], 
  alerts: ProactiveAlert[]
): Promise<{
  summary: string;
  keyFindings: string;
  insights: string;
  trends: string;
}> {
  const isAvailable = await aiProvider.isAvailable();
  
  if (!isAvailable) {
    return generateFallbackSummary(statuses, alerts);
  }
  
  const prompt = `Günlük rehberlik raporu oluştur:

ÖĞRENCİ DURUMLARI:
- Toplam: ${statuses.length}
- Acil Durum: ${statuses.filter(s => s.overallStatus === 'ACİL').length}
- Dikkat Gerekli: ${statuses.filter(s => s.overallStatus === 'DİKKAT').length}

UYARILAR:
- Toplam Uyarı: ${alerts.length}
- Kritik: ${alerts.filter(a => a.severity === 'KRİTİK').length}
- Yüksek: ${alerts.filter(a => a.severity === 'YÜKSEK').length}
- Pozitif Gelişim: ${alerts.filter(a => a.alertCategory === 'POZİTİF_GELİŞİM').length}

Lütfen şu formatta özet oluştur:

## GÜNLÜK ÖZET
[Genel durum ve öne çıkan bulgular]

## ANA BULGULAR
[3-5 madde halinde kritik tespitler]

## AI ANALİZİ
[Derin çıkarımlar ve öneriler]

## TRENDLER
[Genel eğilimler ve dikkat edilmesi gerekenler]`;

  try {
    const response = await aiProvider.chat({
      messages: [
        { role: 'system', content: AIPromptBuilder.buildCounselorSystemPrompt() },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });
    
    // Yanıtı parse et
    const sections = response.split('##').filter(s => s.trim());
    
    return {
      summary: sections[0]?.trim() || 'Özet oluşturulamadı',
      keyFindings: sections[1]?.trim() || '',
      insights: sections[2]?.trim() || '',
      trends: sections[3]?.trim() || ''
    };
  } catch (error) {
    console.error('AI summary error:', error);
    return generateFallbackSummary(statuses, alerts);
  }
}

/**
 * Fallback özet (AI yoksa)
 */
function generateFallbackSummary(
  statuses: StudentDailyStatus[], 
  alerts: ProactiveAlert[]
): {
  summary: string;
  keyFindings: string;
  insights: string;
  trends: string;
} {
  const critical = statuses.filter(s => s.overallStatus === 'ACİL').length;
  const attention = statuses.filter(s => s.overallStatus === 'DİKKAT').length;
  
  return {
    summary: `Bugün ${statuses.length} öğrenci analiz edildi. ${critical} öğrenci acil müdahale, ${attention} öğrenci dikkat gerektiriyor.`,
    keyFindings: `${alerts.filter(a => a.severity === 'KRİTİK').length} kritik uyarı tespit edildi.`,
    insights: 'Detaylı AI analizi için OpenAI API key gereklidir.',
    trends: 'Trend analizi mevcut değil.'
  };
}

/**
 * Öncelikli aksiyonlar oluştur
 */
function generatePriorityActions(
  statuses: StudentDailyStatus[], 
  alerts: ProactiveAlert[]
): string[] {
  const actions: string[] = [];
  
  // Kritik öğrenciler
  const critical = statuses.filter(s => s.overallStatus === 'ACİL');
  if (critical.length > 0) {
    actions.push(`${critical.length} öğrenci için acil müdahale planı hazırla`);
  }
  
  // Kritik uyarılar
  const criticalAlerts = alerts.filter(a => a.severity === 'KRİTİK');
  if (criticalAlerts.length > 0) {
    actions.push(`${criticalAlerts.length} kritik uyarıyı incele ve aksiyona al`);
  }
  
  // Davranışsal patternler
  const behaviorAlerts = alerts.filter(a => a.alertCategory === 'DAVRANIŞSAL_PATTERN');
  if (behaviorAlerts.length >= 3) {
    actions.push('Davranışsal patternleri gösteren öğrencilerle bireysel görüşme yap');
  }
  
  // Pozitif gelişimler
  const positive = alerts.filter(a => a.alertCategory === 'POZİTİF_GELİŞİM');
  if (positive.length > 0) {
    actions.push(`${positive.length} öğrencinin başarısını takdir et ve motivasyonu yüksek tut`);
  }
  
  return actions;
}

/**
 * Toplantı önerileri oluştur
 */
function generateMeetingSuggestions(statuses: StudentDailyStatus[]): string[] {
  const suggestions: string[] = [];
  
  const critical = statuses.filter(s => s.overallStatus === 'ACİL');
  
  if (critical.length > 0) {
    critical.slice(0, 3).forEach(status => {
      suggestions.push(`Acil veli görüşmesi - Öğrenci ID: ${status.studentId}`);
    });
  }
  
  return suggestions;
}

// ==================== API HELPERS ====================

export async function getTodayInsights(schoolId: string): Promise<DailyInsightsSummary | null> {
  if (!schoolId) {
    throw new Error('schoolId is required for getTodayInsights');
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  // Okul bazlı insight al
  let insight = repository.getDailyInsightByDate(today, 'GÜNLÜK', schoolId);
  
  // Eğer bu okul için bugünkü yoksa oluştur
  if (!insight) {
    insight = await generateDailyInsight(schoolId, today);
  }
  
  // Get school-scoped student IDs for filtering
  const schoolStudents = studentsRepo.loadStudentsBySchool(schoolId);
  const schoolStudentIds = schoolStudents.map(s => s.id);
  
  const priorityStudents = repository.getStudentsNeedingAttention(today, schoolStudentIds);
  const criticalAlerts = repository.getProactiveAlerts({ 
    severity: 'KRİTİK', 
    status: 'YENİ',
    studentIds: schoolStudentIds,
    limit: 10 
  });
  const positiveUpdates = repository.getProactiveAlerts({
    status: 'YENİ',
    studentIds: schoolStudentIds,
    limit: 5
  }).filter(a => a.alertCategory === 'POZİTİF_GELİŞİM');
  
  return {
    date: today,
    insight,
    priorityStudents,
    criticalAlerts,
    positiveUpdates,
    recommendedActions: JSON.parse(insight.priorityActions || '[]')
  };
}

/**
 * Get student insights with school-scoped access validation
 * @param studentId - The student ID
 * @param studentIds - Optional array of allowed student IDs for school isolation
 */
export function getStudentInsights(studentId: string, studentIds?: string[]) {
  if (studentIds && !studentIds.includes(studentId)) {
    console.warn(`[SECURITY] Attempted to access student ${studentId} alerts without permission`);
    return [];
  }
  return repository.getProactiveAlerts({ studentId, limit: 10 });
}

export function updateAlertStatus(
  alertId: string, 
  status: ProactiveAlert['status'],
  actionTaken?: string
) {
  repository.updateProactiveAlertStatus(alertId, status, actionTaken);
}
