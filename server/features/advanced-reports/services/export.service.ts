/**
 * Export Service
 * PDF ve Excel Export İşlemleri
 */

import * as XLSX from 'xlsx';
import type { ComprehensiveReport, ExportOptions } from '../types/advanced-reports.types.js';

export class ExportService {
  async exportToPDF(report: ComprehensiveReport, options: ExportOptions): Promise<Buffer> {
    // PDF export is currently only implemented for counseling sessions on the client-side
    // Advanced reports PDF export can be implemented using jsPDF similar to counseling sessions
    // For now, we recommend using Excel export for advanced reports
    throw new Error('PDF export for advanced reports is not yet implemented. Please use Excel export instead.');
  }
  
  exportToExcel(report: ComprehensiveReport, options: ExportOptions): string {
    const workbook = XLSX.utils.book_new();
    
    // Okul İstatistikleri Sayfası
    const schoolStatsData = this.prepareSchoolStatsSheet(report, options);
    const wsSchool = XLSX.utils.aoa_to_sheet(schoolStatsData);
    XLSX.utils.book_append_sheet(workbook, wsSchool, 'Okul İstatistikleri');
    
    // Sınıf Karşılaştırmaları Sayfası
    if (report.classComparisons.length > 0) {
      const classCompData = this.prepareClassComparisonSheet(report, options);
      const wsClass = XLSX.utils.aoa_to_sheet(classCompData);
      XLSX.utils.book_append_sheet(workbook, wsClass, 'Sınıf Karşılaştırma');
    }
    
    // Trend Analizi Sayfası
    if (report.timeSeriesAnalysis.trends.length > 0) {
      const trendData = this.prepareTrendAnalysisSheet(report, options);
      const wsTrend = XLSX.utils.aoa_to_sheet(trendData);
      XLSX.utils.book_append_sheet(workbook, wsTrend, 'Trend Analizi');
    }
    
    // AI İçgörüleri Sayfası
    if (options.includeAIAnalysis && report.aiInsights) {
      const aiData = this.prepareAIInsightsSheet(report, options);
      const wsAI = XLSX.utils.aoa_to_sheet(aiData);
      XLSX.utils.book_append_sheet(workbook, wsAI, 'AI İçgörüleri');
    }
    
    // Excel buffer to base64
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'buffer',
      bookSST: true,
      codepage: 65001
    });
    
    return excelBuffer.toString('base64');
  }
  
  private prepareSchoolStatsSheet(report: ComprehensiveReport, options: ExportOptions): unknown[][] {
    const { schoolStats } = report;
    const shouldAnonymize = options.anonymize || false;
    
    const data = [
      ['OKUL GENELİ İSTATİSTİKLER'],
      ['Rapor Tarihi:', new Date(report.generatedAt).toLocaleDateString('tr-TR')],
      [''],
      ['GENEL BİLGİLER'],
      ['Toplam Öğrenci:', schoolStats.totalStudents],
      ['Toplam Sınıf:', schoolStats.totalClasses],
      ['Rehber Öğretmen:', schoolStats.totalCounselors],
      ['Görüşme Sayısı:', schoolStats.totalSessions],
      [''],
      ['RİSK DAĞILIMI'],
      ['Düşük Risk:', schoolStats.riskDistribution.low],
      ['Orta Risk:', schoolStats.riskDistribution.medium],
      ['Yüksek Risk:', schoolStats.riskDistribution.high],
      ['Kritik Risk:', schoolStats.riskDistribution.critical],
      [''],
      ['CİNSİYET DAĞILIMI'],
      ['Erkek:', schoolStats.genderDistribution.male],
      ['Kız:', schoolStats.genderDistribution.female],
      ['Diğer:', schoolStats.genderDistribution.other],
      [''],
      ['AKADEMİK DURUM'],
      ['Ortalama GPA:', schoolStats.academicOverview.averageGPA.toFixed(2)],
      ['Başarılı Öğrenci:', schoolStats.academicOverview.topPerformers],
      ['Destek Gereken:', schoolStats.academicOverview.needsSupport],
      [''],
      ['DEVAM DURUMU'],
      ['Ortalama Devam:', (schoolStats.attendanceOverview.average * 100).toFixed(1) + '%'],
      ['Mükemmel Devam:', schoolStats.attendanceOverview.excellent],
      ['İyi Devam:', schoolStats.attendanceOverview.good],
      ['Zayıf Devam:', schoolStats.attendanceOverview.poor],
    ];
    
    // Sınıf Dağılımı
    if (schoolStats.classDistribution.length > 0) {
      data.push(['']);
      data.push(['SINIF DAĞILIMI']);
      data.push(['Sınıf', 'Öğrenci', 'Erkek', 'Kız', 'Ort. Yaş']);
      
      schoolStats.classDistribution.forEach(cd => {
        data.push([
          cd.class,
          cd.studentCount,
          cd.maleCount,
          cd.femaleCount,
          cd.averageAge ? cd.averageAge.toFixed(1) : 'N/A'
        ]);
      });
    }
    
    return data;
  }
  
  private prepareClassComparisonSheet(report: ComprehensiveReport, options: ExportOptions): unknown[][] {
    const data: unknown[][] = [
      ['SINIF KARŞILAŞTIRMALARI'],
      [''],
      ['Sınıf', 'Öğrenci', 'Ort. GPA', 'Devam %', 'Davranış', 'Görüşme', 'Düşük Risk', 'Orta Risk', 'Yüksek Risk', 'Kritik Risk']
    ];
    
    report.classComparisons.forEach(cc => {
      data.push([
        cc.class,
        cc.studentCount as unknown,
        cc.averageGPA.toFixed(2),
        (cc.attendanceRate * 100).toFixed(1),
        cc.behaviorIncidents as unknown,
        cc.counselingSessions as unknown,
        cc.riskDistribution.low as unknown,
        cc.riskDistribution.medium as unknown,
        cc.riskDistribution.high as unknown,
        cc.riskDistribution.critical as unknown
      ]);
    });
    
    // Güçlü Yönler ve Zorluklar
    data.push(['']);
    data.push(['SINIF ANALİZLERİ']);
    data.push(['Sınıf', 'Güçlü Yönler', 'Zorluklar']);
    
    report.classComparisons.forEach(cc => {
      data.push([
        cc.class,
        cc.strengths.join('; '),
        cc.challenges.join('; ')
      ]);
    });
    
    return data;
  }
  
  private prepareTrendAnalysisSheet(report: ComprehensiveReport, options: ExportOptions): unknown[][] {
    const { timeSeriesAnalysis } = report;
    
    const data: unknown[][] = [
      ['TREND ANALİZİ'],
      ['Dönem:', timeSeriesAnalysis.period],
      ['Başlangıç:', timeSeriesAnalysis.startDate],
      ['Bitiş:', timeSeriesAnalysis.endDate],
      [''],
      ['Tarih', 'Akademik Ort.', 'Devam %', 'Görüşme', 'Risk Öğr.', 'Davranış']
    ];
    
    timeSeriesAnalysis.trends.forEach(t => {
      data.push([
        t.period,
        t.academicAverage.toFixed(2),
        (t.attendanceRate * 100).toFixed(1),
        t.sessionCount as unknown,
        t.riskStudents as unknown,
        t.behaviorIncidents as unknown
      ]);
    });
    
    // İçgörüler
    data.push(['']);
    data.push(['İYİLEŞEN ALANLAR']);
    timeSeriesAnalysis.insights.improving.forEach(i => {
      data.push([i]);
    });
    
    data.push(['']);
    data.push(['KÖTÜLEŞEN ALANLAR']);
    timeSeriesAnalysis.insights.declining.forEach(i => {
      data.push([i]);
    });
    
    data.push(['']);
    data.push(['STABİL ALANLAR']);
    timeSeriesAnalysis.insights.stable.forEach(i => {
      data.push([i]);
    });
    
    // Tahminler
    data.push(['']);
    data.push(['TAHMİNLER']);
    data.push(['Sonraki Dönem:', timeSeriesAnalysis.predictions.nextPeriod]);
    data.push(['Akademik Trend:', timeSeriesAnalysis.predictions.academicTrend]);
    data.push(['Risk Trend:', timeSeriesAnalysis.predictions.riskTrend]);
    data.push(['Güven:', (timeSeriesAnalysis.predictions.confidence * 100).toFixed(0) + '%']);
    
    return data;
  }
  
  private prepareAIInsightsSheet(report: ComprehensiveReport, options: ExportOptions): unknown[][] {
    const { aiInsights } = report;
    
    if (!aiInsights) {
      return [['AI analizi mevcut değil']];
    }
    
    const data = [
      ['AI İÇGÖRÜLERİ'],
      [''],
      ['ÖZET'],
      [aiInsights.summary],
      [''],
      ['ÖNEMLİ BULGULAR']
    ];
    
    aiInsights.keyFindings.forEach(finding => {
      data.push([finding]);
    });
    
    data.push(['']);
    data.push(['ÖNERİLER']);
    aiInsights.recommendations.forEach(rec => {
      data.push([rec]);
    });
    
    data.push(['']);
    data.push(['EYLEM MADDELERİ']);
    aiInsights.actionItems.forEach(item => {
      data.push([item]);
    });
    
    return data;
  }
}

export const exportService = new ExportService();
