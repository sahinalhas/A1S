/**
 * Career Guidance Service
 * Kariyer Rehberliği Ana Servisi
 * 
 * Tüm kariyer rehberliği işlemlerini koordine eden ana servis
 */

import type { Database } from 'better-sqlite3';
import type {
  CareerProfile,
  StudentCompetencyProfile,
  CareerMatchResult,
  CareerRoadmap,
  CareerAnalysisResult
} from '../../../../shared/types/career-guidance.types';
import { CareerProfilesRepository } from '../repository/career-profiles.repository';
import { StudentCareerRepository } from '../repository/student-career.repository';
import { CareerRoadmapRepository } from '../repository/career-roadmap.repository';
import { StudentCompetenciesRepository } from '../repository/student-competencies.repository';
import { CareerMatchingService } from './career-matching.service';
import { StudentCompetencyExtractorService } from './student-competency-extractor.service';
import { CareerOptimizationService } from './career-optimization.service';

export class CareerGuidanceService {
  private careerProfilesRepo: CareerProfilesRepository;
  private studentCareerRepo: StudentCareerRepository;
  private roadmapRepo: CareerRoadmapRepository;
  private competenciesRepo: StudentCompetenciesRepository;
  private matchingService: CareerMatchingService;
  private extractorService: StudentCompetencyExtractorService;
  private optimizationService: CareerOptimizationService;

  constructor(private db: Database) {
    this.careerProfilesRepo = new CareerProfilesRepository(db);
    this.studentCareerRepo = new StudentCareerRepository(db);
    this.roadmapRepo = new CareerRoadmapRepository(db);
    this.competenciesRepo = new StudentCompetenciesRepository(db);
    this.matchingService = new CareerMatchingService();
    this.extractorService = new StudentCompetencyExtractorService(db);
    this.optimizationService = new CareerOptimizationService(db);
  }

  /**
   * Get All Career Profiles
   * Tüm Meslek Profillerini Getir
   */
  getAllCareerProfiles(): CareerProfile[] {
    return this.careerProfilesRepo.getAllCareerProfiles();
  }

  /**
   * Get Career Profile By ID
   * ID'ye Göre Meslek Profili Getir
   */
  getCareerProfileById(careerId: string): CareerProfile | null {
    return this.careerProfilesRepo.getCareerProfileById(careerId);
  }

  /**
   * Search Career Profiles
   * Meslek Profillerinde Ara
   */
  searchCareerProfiles(searchTerm: string): CareerProfile[] {
    return this.careerProfilesRepo.searchCareerProfiles(searchTerm);
  }

  /**
   * Analyze Student Career Match
   * Öğrenci Kariyer Uyumunu Analiz Et
   */
  async analyzeStudentCareerMatch(
    studentId: string,
    careerId?: string
  ): Promise<CareerAnalysisResult> {
    const studentCompetencies = await this.getOrExtractStudentCompetencies(studentId);

    let matches: CareerMatchResult[];

    if (careerId) {
      const career = this.careerProfilesRepo.getCareerProfileById(careerId);
      if (!career) {
        throw new Error('Career profile not found');
      }
      const match = this.matchingService.matchCareer(career, studentCompetencies);
      matches = [match];
    } else {
      const allCareers = this.careerProfilesRepo.getAllCareerProfiles();
      matches = this.matchingService.rankCareers(allCareers, studentCompetencies, 10);
    }

    const student = this.getStudentInfo(studentId);
    const overallCompatibility = this.matchingService.calculateOverallCompatibility(matches);
    
    const analysisResult: CareerAnalysisResult = {
      studentId,
      studentName: student?.fullName || 'Öğrenci',
      analysisDate: new Date().toISOString(),
      topMatches: matches.slice(0, 10),
      overallCompatibility,
      primaryStrengths: matches[0]?.strengths.slice(0, 5) || [],
      criticalGaps: matches[0]?.gaps.filter(g => g.importance === 'CRITICAL').slice(0, 5) || []
    };

    this.studentCareerRepo.saveCareerAnalysis(studentId, analysisResult);

    return analysisResult;
  }

  /**
   * Generate Personalized Career Roadmap
   * Kişiselleştirilmiş Kariyer Yol Haritası Oluştur
   */
  async generateCareerRoadmap(
    studentId: string,
    careerId: string,
    customGoals?: string[]
  ): Promise<CareerRoadmap> {
    const student = this.getStudentInfo(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const career = this.careerProfilesRepo.getCareerProfileById(careerId);
    if (!career) {
      throw new Error('Career profile not found');
    }

    const studentCompetencies = await this.getOrExtractStudentCompetencies(studentId);

    this.roadmapRepo.archiveActiveRoadmaps(studentId);

    const roadmap = await this.optimizationService.generateCareerRoadmap(
      studentId,
      student.fullName,
      career,
      studentCompetencies,
      customGoals
    );

    this.roadmapRepo.createCareerRoadmap(roadmap);

    this.studentCareerRepo.setStudentCareerTarget(studentId, careerId);

    return roadmap;
  }

  /**
   * Get Student Active Roadmap
   * Öğrencinin Aktif Yol Haritasını Getir
   */
  getStudentActiveRoadmap(studentId: string): CareerRoadmap | null {
    return this.roadmapRepo.getActiveRoadmap(studentId);
  }

  /**
   * Get Student All Roadmaps
   * Öğrencinin Tüm Yol Haritalarını Getir
   */
  getStudentAllRoadmaps(studentId: string): CareerRoadmap[] {
    return this.roadmapRepo.getAllRoadmapsForStudent(studentId);
  }

  /**
   * Get Roadmap By ID
   * ID'ye Göre Yol Haritasını Getir
   */
  getRoadmapById(roadmapId: string): CareerRoadmap | null {
    return this.roadmapRepo.getRoadmapById(roadmapId);
  }

  /**
   * Update Roadmap Progress
   * Yol Haritası İlerlemesini Güncelle
   */
  updateRoadmapProgress(roadmapId: string, updates: Partial<CareerRoadmap>): void {
    this.roadmapRepo.updateRoadmap(roadmapId, updates);
  }

  /**
   * Delete Roadmap
   * Yol Haritasını Sil
   */
  deleteRoadmap(roadmapId: string, schoolId?: string): void {
    this.roadmapRepo.deleteRoadmap(roadmapId);
  }

  /**
   * Get Student Competencies
   * Öğrenci Yetkinliklerini Getir
   */
  async getStudentCompetencies(studentId: string): Promise<StudentCompetencyProfile[]> {
    let competencies = this.competenciesRepo.getStudentCompetencies(studentId);

    if (competencies.length === 0) {
      competencies = await this.extractorService.extractAllCompetencies(studentId);
      
      if (competencies.length > 0) {
        this.competenciesRepo.batchUpsertCompetencies(competencies);
      }
    }

    return competencies;
  }

  /**
   * Refresh Student Competencies
   * Öğrenci Yetkinliklerini Yenile
   */
  async refreshStudentCompetencies(studentId: string): Promise<StudentCompetencyProfile[]> {
    const competencies = await this.extractorService.extractAllCompetencies(studentId);
    
    if (competencies.length > 0) {
      this.competenciesRepo.deleteAllStudentCompetencies(studentId);
      this.competenciesRepo.batchUpsertCompetencies(competencies);
    }

    return competencies;
  }

  /**
   * Get Career Analysis History
   * Kariyer Analiz Geçmişini Getir
   */
  getCareerAnalysisHistory(studentId: string, limit: number = 10): CareerAnalysisResult[] {
    return this.studentCareerRepo.getCareerAnalysisHistory(studentId, limit);
  }

  /**
   * Get Latest Career Analysis
   * Son Kariyer Analizini Getir
   */
  getLatestCareerAnalysis(studentId: string): CareerAnalysisResult | null {
    return this.studentCareerRepo.getLatestCareerAnalysis(studentId);
  }

  /**
   * Compare Multiple Careers
   * Birden Fazla Mesleği Karşılaştır
   */
  async compareMultipleCareers(
    studentId: string,
    careerIds: string[]
  ): Promise<CareerMatchResult[]> {
    const studentCompetencies = await this.getOrExtractStudentCompetencies(studentId);
    const careers = this.careerProfilesRepo.getCareerProfilesByIds(careerIds);

    const matches = careers.map(career => 
      this.matchingService.matchCareer(career, studentCompetencies)
    );

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return matches;
  }

  /**
   * Get Student Competency Stats
   * Öğrenci Yetkinlik İstatistiklerini Getir
   */
  getStudentCompetencyStats(studentId: string) {
    return this.competenciesRepo.getCompetencyStats(studentId);
  }

  /**
   * Private: Get or Extract Student Competencies
   * Özel: Öğrenci Yetkinliklerini Getir veya Çıkar
   */
  private async getOrExtractStudentCompetencies(studentId: string): Promise<StudentCompetencyProfile[]> {
    let competencies = this.competenciesRepo.getStudentCompetencies(studentId);

    if (competencies.length === 0) {
      competencies = await this.extractorService.extractAllCompetencies(studentId);
      
      if (competencies.length > 0) {
        this.competenciesRepo.batchUpsertCompetencies(competencies);
      }
    }

    return competencies;
  }

  /**
   * Private: Get Student Info
   * Özel: Öğrenci Bilgilerini Getir
   */
  private getStudentInfo(studentId: string): { fullName: string } | null {
    const stmt = this.db.prepare(`
      SELECT name FROM students WHERE id = ?
    `);
    
    const row = stmt.get(studentId) as { name: string } | undefined;
    
    if (!row) return null;
    
    return {
      fullName: row.name
    };
  }
}
