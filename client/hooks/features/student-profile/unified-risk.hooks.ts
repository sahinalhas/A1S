/**
 * Unified Risk Profile Hook
 * Tüm risk bilgilerini tek bir yerden sağlar
 * - Manual risk (Genel Bilgiler'den)
 * - Risk factors (Risk değerlendirmeden)
 * - Enhanced risk (AI tabanlı)
 * - Risk & Protective profile
 */

import { useQuery } from "@tanstack/react-query";
import { Student } from "@/lib/storage";
import { apiClient } from "@/lib/api/core/client";

export interface UnifiedRiskData {
 // Manuel risk (Genel Bilgiler'den)
 manualRisk:"Düşük" |"Orta" |"Yüksek" | null;
 
 // Risk faktörleri değerlendirmesi
 riskFactors: {
 assessmentDate: string;
 academicRiskLevel: string;
 behavioralRiskLevel: string;
 attendanceRiskLevel: string;
 socialEmotionalRiskLevel: string;
 academicFactors?: string;
 behavioralFactors?: string;
 protectiveFactors?: string;
 interventionsNeeded?: string;
 } | null;
 
 // AI tabanlı enhanced risk
 enhancedRisk: {
 overallScore: number;
 category: string;
 trend:"increasing" |"stable" |"decreasing";
 factors: Array<{
 factor: string;
 impact:"high" |"medium" |"low";
 description: string;
 }>;
 } | null;
 
 // Risk & Protective Profile
 riskProtectiveProfile: {
 riskScore: number;
 protectiveScore: number;
 recommendations: string[];
 } | null;
 
 // Birleştirilmiş risk skoru (0-100)
 unifiedRiskScore: number;
 
 // Risk kategorisi
 riskCategory:"low" |"medium" |"high" |"critical";
 
 // Öncelik durumu
 interventionPriority:"low" |"medium" |"high" |"critical";
}

export function useUnifiedRisk(studentId: string, student?: Student) {
 return useQuery<UnifiedRiskData>({
 queryKey: ['unified-risk', studentId],
 queryFn: async () => {
 // Manuel risk bilgisini al ve validate et
 const manualRisk = validateManualRisk(student?.risk);
 
 // Risk faktörlerini al (API'den)
 let riskFactors = null;
 try {
 const response = await apiClient.get(`/api/risk-assessment/${studentId}`);
 riskFactors = validateRiskFactors(response);
 } catch (error) {
 console.error('Risk factors fetch error:', error);
 }
 
 // Enhanced risk'i al (AI tabanlı)
 let enhancedRisk = null;
 try {
 const response = await apiClient.get(`/api/enhanced-risk/${studentId}`);
 enhancedRisk = validateEnhancedRisk(response);
 } catch (error) {
 console.error('Enhanced risk fetch error:', error);
 }
 
 // Risk & Protective profile'ı al
 let riskProtectiveProfile = null;
 try {
 const response = await apiClient.get(`/api/student-profile/${studentId}/risk-protective`);
 riskProtectiveProfile = validateRiskProtectiveProfile(response);
 } catch (error) {
 console.error('Risk protective profile fetch error:', error);
 }
 
 // Birleştirilmiş risk skorunu hesapla
 const unifiedRiskScore = calculateUnifiedRiskScore({
 manualRisk,
 riskFactors,
 enhancedRisk,
 riskProtectiveProfile
 });
 
 // Risk kategorisini belirle
 const riskCategory = getRiskCategory(unifiedRiskScore);
 
 // Müdahale önceliğini belirle
 const interventionPriority = getInterventionPriority(
 unifiedRiskScore,
 riskFactors,
 enhancedRisk
 );
 
 return {
 manualRisk,
 riskFactors,
 enhancedRisk,
 riskProtectiveProfile,
 unifiedRiskScore,
 riskCategory,
 interventionPriority,
 };
 },
 staleTime: 5 * 60 * 1000, // 5 dakika
 enabled: !!studentId,
 });
}

// Birleştirilmiş risk skorunu hesapla
function calculateUnifiedRiskScore(data: {
 manualRisk: string | null;
 riskFactors: any;
 enhancedRisk: any;
 riskProtectiveProfile: any;
}): number {
 const scores: number[] = [];
 
 // Manuel risk'i skora çevir
 if (data.manualRisk) {
 const manualScore = {
"Düşük": 20,
"Orta": 50,
"Yüksek": 80
 }[data.manualRisk] || 0;
 scores.push(manualScore);
 }
 
 // Risk faktörlerinden skor hesapla
 if (data.riskFactors) {
 // Case-insensitive level mapping
 const getLevelScore = (level: string): number => {
 const normalized = level.toUpperCase().replace(/\s+/g, '_');
 const scoreMap: Record<string, number> = {
"DÜŞÜK": 20,
"ORTA": 50,
"YÜKSEK": 75,
"ÇOK_YÜKSEK": 95
 };
 return scoreMap[normalized] || 0;
 };
 
 const factorScores = [
 getLevelScore(data.riskFactors.academicRiskLevel),
 getLevelScore(data.riskFactors.behavioralRiskLevel),
 getLevelScore(data.riskFactors.attendanceRiskLevel),
 getLevelScore(data.riskFactors.socialEmotionalRiskLevel),
 ];
 
 const avgFactorScore = factorScores.reduce((a, b) => a + b, 0) / factorScores.length;
 scores.push(avgFactorScore);
 }
 
 // Enhanced risk skorunu ekle
 if (data.enhancedRisk?.overallScore) {
 scores.push(data.enhancedRisk.overallScore);
 }
 
 // Risk protective profile'dan risk skorunu ekle
 if (data.riskProtectiveProfile?.riskScore) {
 scores.push(data.riskProtectiveProfile.riskScore);
 }
 
 // Ortalama hesapla
 if (scores.length === 0) return 0;
 
 return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// Risk kategorisini belirle
function getRiskCategory(score: number):"low" |"medium" |"high" |"critical" {
 if (score >= 80) return"critical";
 if (score >= 60) return"high";
 if (score >= 35) return"medium";
 return"low";
}

// Müdahale önceliğini belirle
function getInterventionPriority(
 score: number,
 riskFactors: UnifiedRiskData['riskFactors'],
 enhancedRisk: UnifiedRiskData['enhancedRisk']
):"low" |"medium" |"high" |"critical" {
 // Case-insensitive comparison helper
 const isLevel = (value: string | undefined, target: string): boolean => {
 if (!value) return false;
 return value.toUpperCase().replace(/\s+/g, '_') === target;
 };
 
 // Çok yüksek risk faktörleri varsa kritik
 if (isLevel(riskFactors?.behavioralRiskLevel,"ÇOK_YÜKSEK") ||
 isLevel(riskFactors?.academicRiskLevel,"ÇOK_YÜKSEK")) {
 return"critical";
 }
 
 // Enhanced risk trend'i artıyorsa öncelik yükselir
 if (enhancedRisk?.trend ==="increasing" && score >= 50) {
 return score >= 70 ?"critical" :"high";
 }
 
 // Normal kategori
 return getRiskCategory(score);
}

// Veri Validasyon Fonksiyonları

function validateManualRisk(risk: string | undefined | null):"Düşük" |"Orta" |"Yüksek" | null {
 const validRisks = ["Düşük","Orta","Yüksek"] as const;
 if (risk && validRisks.includes(risk as typeof validRisks[number])) {
 return risk as"Düşük" |"Orta" |"Yüksek";
 }
 return null;
}

function validateRiskFactors(data: unknown): UnifiedRiskData['riskFactors'] {
 if (!data || typeof data !== 'object') return null;
 
 const riskData = data as Record<string, unknown>;
 
 // Hem uppercase hem title-case değerleri kabul et (geriye dönük uyumluluk için)
 const validLevels = [
"DÜŞÜK","ORTA","YÜKSEK","ÇOK_YÜKSEK", // Uppercase
"Düşük","Orta","Yüksek","Çok Yüksek" // Title-case
 ];
 
 // Zorunlu alanlar kontrolü
 if (!riskData.academicRiskLevel || !riskData.behavioralRiskLevel || 
 !riskData.attendanceRiskLevel || !riskData.socialEmotionalRiskLevel) {
 return null;
 }
 
 // Level validasyonu - case insensitive
 const normalizeLevel = (level: string) => level.toUpperCase().replace(/\s+/g, '_');
 
 if (!validLevels.some(valid => normalizeLevel(valid) === normalizeLevel(String(riskData.academicRiskLevel))) ||
 !validLevels.some(valid => normalizeLevel(valid) === normalizeLevel(String(riskData.behavioralRiskLevel))) ||
 !validLevels.some(valid => normalizeLevel(valid) === normalizeLevel(String(riskData.attendanceRiskLevel))) ||
 !validLevels.some(valid => normalizeLevel(valid) === normalizeLevel(String(riskData.socialEmotionalRiskLevel)))) {
 console.warn('Invalid risk level in risk factors:', data);
 return null;
 }
 
 return {
   assessmentDate: String(riskData.assessmentDate || ''),
   academicRiskLevel: String(riskData.academicRiskLevel),
   behavioralRiskLevel: String(riskData.behavioralRiskLevel),
   attendanceRiskLevel: String(riskData.attendanceRiskLevel),
   socialEmotionalRiskLevel: String(riskData.socialEmotionalRiskLevel),
   academicFactors: riskData.academicFactors as string | undefined,
   behavioralFactors: riskData.behavioralFactors as string | undefined,
   protectiveFactors: riskData.protectiveFactors as string | undefined,
   interventionsNeeded: riskData.interventionsNeeded as string | undefined,
 };
}

function validateEnhancedRisk(data: unknown): UnifiedRiskData['enhancedRisk'] {
 if (!data || typeof data !== 'object') return null;
 
 const riskData = data as Record<string, unknown>;
 
 // Zorunlu alanlar kontrolü
 if (typeof riskData.overallScore !== 'number' || 
 !riskData.category || 
 !riskData.trend) {
 return null;
 }
 
 // Score validasyonu
 if (riskData.overallScore < 0 || riskData.overallScore > 100) {
 console.warn('Invalid enhanced risk score:', riskData.overallScore);
 return null;
 }
 
 // Trend validasyonu
 const validTrends = ["increasing","stable","decreasing"] as const;
 if (!validTrends.includes(riskData.trend as typeof validTrends[number])) {
 console.warn('Invalid enhanced risk trend:', riskData.trend);
 return null;
 }
 
 return {
   overallScore: riskData.overallScore,
   category: String(riskData.category),
   trend: riskData.trend as "increasing" | "stable" | "decreasing",
   factors: Array.isArray(riskData.factors) ? riskData.factors.map((f: Record<string, unknown>) => ({
     factor: String(f.factor || ''),
     impact: (f.impact as "high" | "medium" | "low") || 'low',
     description: String(f.description || ''),
   })) : [],
 };
}

function validateRiskProtectiveProfile(data: unknown): UnifiedRiskData['riskProtectiveProfile'] {
 if (!data || typeof data !== 'object') return null;
 
 const profileData = data as Record<string, unknown>;
 
 // Score validasyonu
 if (typeof profileData.riskScore !== 'number' || typeof profileData.protectiveScore !== 'number') {
 return null;
 }
 
 if (profileData.riskScore < 0 || profileData.riskScore > 100 ||
 profileData.protectiveScore < 0 || profileData.protectiveScore > 100) {
 console.warn('Invalid risk/protective scores:', data);
 return null;
 }
 
 return {
   riskScore: profileData.riskScore,
   protectiveScore: profileData.protectiveScore,
   recommendations: Array.isArray(profileData.recommendations) 
     ? profileData.recommendations.map(String) 
     : [],
 };
}
