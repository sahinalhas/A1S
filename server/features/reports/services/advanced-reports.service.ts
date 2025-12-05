/**
 * Advanced Reports Service
 * Gelişmiş Raporlama İş Mantığı Katmanı
 */

import * as schoolStatsRepo from '../repository/school-stats.repository.js';
import * as classComparisonRepo from '../repository/class-comparison.repository.js';
import * as trendAnalysisRepo from '../repository/trend-analysis.repository.js';
import { AIProviderService } from '../../../services/ai-provider.service.js';
import type { 
  SchoolStatistics, 
  ClassComparison, 
  TimeSeriesAnalysis, 
  ComprehensiveReport,
  ExportOptions
} from '../types/advanced-reports.types.js';

export class AdvancedReportsService {
  private aiProvider: AIProviderService;
  
  constructor() {
    this.aiProvider = AIProviderService.getInstance();
  }
  
  async getSchoolStatistics(schoolId: string): Promise<SchoolStatistics> {
    return schoolStatsRepo.getSchoolStatistics(schoolId);
  }
  
  async getClassComparisons(schoolId: string, classNames?: string[]): Promise<ClassComparison[]> {
    return classComparisonRepo.getClassComparisons(schoolId, classNames);
  }
  
  async compareClasses(schoolId: string, className1: string, className2: string) {
    return classComparisonRepo.compareClasses(schoolId, className1, className2);
  }
  
  async getTrendAnalysis(
    schoolId: string,
    period: 'daily' | 'weekly' | 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<TimeSeriesAnalysis> {
    return trendAnalysisRepo.analyzeTimeSeries(schoolId, period, startDate, endDate);
  }
  
  async generateComprehensiveReport(
    schoolId: string,
    generatedBy: string,
    options?: {
      includeAIAnalysis?: boolean;
      classNames?: string[];
      period?: 'daily' | 'weekly' | 'monthly';
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ComprehensiveReport> {
    const schoolStats = await this.getSchoolStatistics(schoolId);
    const classComparisons = await this.getClassComparisons(schoolId, options?.classNames);
    const timeSeriesAnalysis = await this.getTrendAnalysis(
      schoolId,
      options?.period || 'monthly',
      options?.startDate,
      options?.endDate
    );
    
    let aiInsights;
    if (options?.includeAIAnalysis) {
      aiInsights = await this.generateAIInsights(schoolStats, classComparisons, timeSeriesAnalysis);
    }
    
    return {
      reportId: `RPT-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      generatedBy,
      reportType: 'school',
      schoolStats,
      classComparisons,
      timeSeriesAnalysis,
      aiInsights,
    };
  }
  
  private async generateAIInsights(
    schoolStats: SchoolStatistics,
    classComparisons: ClassComparison[],
    timeSeriesAnalysis: TimeSeriesAnalysis
  ) {
    const isAvailable = await this.aiProvider.isAvailable();
    
    if (!isAvailable) {
      return {
        summary: 'AI analizi şu anda kullanılamıyor',
        keyFindings: ['AI servisi çevrimdışı'],
        recommendations: [],
        actionItems: [],
      };
    }
    
    const prompt = this.buildAIAnalysisPrompt(schoolStats, classComparisons, timeSeriesAnalysis);
    
    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen bir eğitim danışmanı ve veri analistisin. Okul verilerini analiz edip içgörüler ve öneriler sunuyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      });
      
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        summary: 'AI analizi sırasında hata oluştu',
        keyFindings: [],
        recommendations: [],
        actionItems: [],
      };
    }
  }
  
  private buildAIAnalysisPrompt(
    schoolStats: SchoolStatistics,
    classComparisons: ClassComparison[],
    timeSeriesAnalysis: TimeSeriesAnalysis
  ): string {
    return `
# Okul Raporu Analizi

## Okul İstatistikleri
- Toplam Öğrenci: ${schoolStats.totalStudents}
- Toplam Sınıf: ${schoolStats.totalClasses}
- Rehber Öğretmen: ${schoolStats.totalCounselors}
- Görüşme Sayısı: ${schoolStats.totalSessions}

### Risk Dağılımı
- Düşük Risk: ${schoolStats.riskDistribution.low}
- Orta Risk: ${schoolStats.riskDistribution.medium}
- Yüksek Risk: ${schoolStats.riskDistribution.high}
- Kritik Risk: ${schoolStats.riskDistribution.critical}

### Akademik Durum
- Ortalama GPA: ${schoolStats.academicOverview.averageGPA.toFixed(2)}
- Başarılı Öğrenci: ${schoolStats.academicOverview.topPerformers}
- Destek Gereken: ${schoolStats.academicOverview.needsSupport}

### Devam Durumu
- Ortalama Devam: %${(schoolStats.attendanceOverview.average * 100).toFixed(1)}
- Mükemmel Devam: ${schoolStats.attendanceOverview.excellent} öğrenci
- Zayıf Devam: ${schoolStats.attendanceOverview.poor} öğrenci

## Sınıf Karşılaştırmaları
${classComparisons.slice(0, 5).map(cc => `
### ${cc.class}
- Öğrenci Sayısı: ${cc.studentCount}
- Ortalama GPA: ${cc.averageGPA.toFixed(2)}
- Devam Oranı: %${(cc.attendanceRate * 100).toFixed(1)}
- Güçlü Yönler: ${cc.strengths.join(', ') || 'Yok'}
- Zorluklar: ${cc.challenges.join(', ') || 'Yok'}
`).join('\n')}

## Trend Analizi (${timeSeriesAnalysis.period})
### İyileşen Alanlar
${timeSeriesAnalysis.insights.improving.map(i => `- ${i}`).join('\n') || '- Yok'}

### Kötüleşen Alanlar
${timeSeriesAnalysis.insights.declining.map(i => `- ${i}`).join('\n') || '- Yok'}

### Tahminler
- Akademik Trend: ${timeSeriesAnalysis.predictions.academicTrend}
- Risk Trend: ${timeSeriesAnalysis.predictions.riskTrend}
- Güven: %${(timeSeriesAnalysis.predictions.confidence * 100).toFixed(0)}

---

Lütfen bu verileri analiz ederek şu formatta yanıt ver:

**ÖZET:**
[Okul performansının genel bir özeti (2-3 cümle)]

**ÖNEMLİ BULGULAR:**
- [Bulgu 1]
- [Bulgu 2]
- [Bulgu 3]

**ÖNERİLER:**
- [Öneri 1]
- [Öneri 2]
- [Öneri 3]

**EYLEM MADDELERİ:**
- [Öncelikli eylem 1]
- [Öncelikli eylem 2]
- [Öncelikli eylem 3]
`;
  }
  
  private parseAIResponse(response: string) {
    const summary = this.extractSection(response, 'ÖZET:');
    const keyFindings = this.extractListItems(response, 'ÖNEMLİ BULGULAR:');
    const recommendations = this.extractListItems(response, 'ÖNERİLER:');
    const actionItems = this.extractListItems(response, 'EYLEM MADDELERİ:');
    
    return {
      summary: summary || 'Analiz tamamlandı',
      keyFindings,
      recommendations,
      actionItems,
    };
  }
  
  private extractSection(text: string, marker: string): string {
    const lines = text.split('\n');
    const startIdx = lines.findIndex(line => line.includes(marker));
    
    if (startIdx === -1) return '';
    
    let content = '';
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('**') || line === '') continue;
      if (line.startsWith('-')) break;
      content += line + ' ';
    }
    
    return content.trim();
  }
  
  private extractListItems(text: string, marker: string): string[] {
    const lines = text.split('\n');
    const startIdx = lines.findIndex(line => line.includes(marker));
    
    if (startIdx === -1) return [];
    
    const items: string[] = [];
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('**')) break;
      if (line.startsWith('-')) {
        items.push(line.substring(1).trim());
      }
    }
    
    return items;
  }
  
  getAvailableClasses(schoolId: string): string[] {
    return schoolStatsRepo.getClassList(schoolId);
  }
}

export const advancedReportsService = new AdvancedReportsService();
