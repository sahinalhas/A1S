import { getDatabase } from '../lib/database/connection';

export interface SocialNetworkAnalysis {
  studentId: string;
  studentName: string;
  class: string;
  analysisDate: string;
  networkMetrics: {
    centralityScore: number;
    betweennessScore: number;
    degreeCount: number;
    isolationRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    socialRole: 'LEADER' | 'BRIDGE' | 'FOLLOWER' | 'ISOLATE' | 'PERIPHERAL';
    influenceScore: number;
  };
  relationships: {
    totalConnections: number;
    closeFriends: number;
    acquaintances: number;
    studyPartners: number;
    conflicts: number;
  };
  peerGroups: Array<{
    groupId: string;
    groupName: string;
    role: string;
    memberCount: number;
  }>;
  socialInsights: Array<{
    type: 'strength' | 'concern' | 'opportunity';
    title: string;
    description: string;
    recommendation: string;
  }>;
  classPositioning: {
    popularityPercentile: number;
    integrationLevel: string;
    peerAcceptance: number;
  };
}

export interface ClassSocialNetwork {
  class: string;
  analysisDate: string;
  totalStudents: number;
  networkDensity: number;
  clusters: Array<{
    clusterId: string;
    size: number;
    members: string[];
    cohesion: number;
  }>;
  isolatedStudents: Array<{
    studentId: string;
    studentName: string;
    isolationRisk: string;
  }>;
  centralFigures: Array<{
    studentId: string;
    studentName: string;
    role: string;
    influence: number;
  }>;
  conflictPairs: Array<{
    student1: string;
    student2: string;
    severity: number;
  }>;
}

export class SocialNetworkAnalysisService {
  private db: ReturnType<typeof getDatabase>;

  constructor() {
    this.db = getDatabase();
  }

  async analyzeStudentNetwork(studentId: string): Promise<SocialNetworkAnalysis> {
    const student = this.db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as any;
    if (!student) {
      throw new Error('Öğrenci bulunamadı');
    }

    const relationships = await this.getStudentRelationships(studentId);
    const metrics = await this.calculateNetworkMetrics(studentId, student.class);
    const peerGroups = await this.getStudentGroups(studentId);
    const insights = await this.generateSocialInsights(studentId, relationships, metrics);
    const classPositioning = await this.calculateClassPositioning(studentId, student.class);

    return {
      studentId,
      studentName: student.name,
      class: student.class,
      analysisDate: new Date().toISOString(),
      networkMetrics: metrics,
      relationships,
      peerGroups,
      socialInsights: insights as Array<{ type: 'strength' | 'concern' | 'opportunity'; title: string; description: string; recommendation: string }>,
      classPositioning
    };
  }

  async analyzeClassNetwork(className: string): Promise<ClassSocialNetwork> {
    const students = this.db.prepare('SELECT * FROM students WHERE class = ?').all(className) as any[];
    
    const networkDensity = await this.calculateNetworkDensity(className);
    const clusters = await this.identifyClusters(className);
    const isolatedStudents = await this.identifyIsolatedStudents(className);
    const centralFigures = await this.identifyCentralFigures(className);
    const conflictPairs = await this.identifyConflicts(className);

    return {
      class: className,
      analysisDate: new Date().toISOString(),
      totalStudents: students.length,
      networkDensity,
      clusters,
      isolatedStudents,
      centralFigures,
      conflictPairs
    };
  }

  private async getStudentRelationships(studentId: string) {
    const relationships = this.db.prepare(`
      SELECT relationshipType, COUNT(*) as count
      FROM peer_relationships
      WHERE studentId = ?
      GROUP BY relationshipType
    `).all(studentId) as any[];

    const relationshipMap = relationships.reduce((acc, r) => {
      acc[r.relationshipType.toLowerCase()] = r.count;
      return acc;
    }, {} as any);

    return {
      totalConnections: relationships.reduce((sum, r) => sum + r.count, 0),
      closeFriends: relationshipMap.close_friend || 0,
      acquaintances: relationshipMap.acquaintance || 0,
      studyPartners: relationshipMap.study_partner || 0,
      conflicts: relationshipMap.conflict || 0
    };
  }

  private async calculateNetworkMetrics(studentId: string, className: string) {
    const connections = this.db.prepare(`
      SELECT COUNT(DISTINCT peerId) as count
      FROM peer_relationships
      WHERE studentId = ? AND relationshipType != 'CONFLICT'
    `).get(studentId) as any;

    const degreeCount = connections?.count || 0;

    const classSize = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM students
      WHERE class = ?
    `).get(className) as any;

    const centralityScore = classSize.count > 1 
      ? degreeCount / (classSize.count - 1) 
      : 0;

    const isolationRisk = this.determineIsolationRisk(degreeCount, classSize.count);
    const socialRole = this.determineSocialRole(degreeCount, centralityScore);
    const influenceScore = centralityScore * 100;

    const betweennessScore = await this.calculateBetweenness(studentId, className);

    try {
      this.db.prepare(`
        INSERT OR REPLACE INTO social_network_metrics (
          id, studentId, className, assessmentDate,
          centralityScore, betweennessScore, degreeCount,
          isolationRisk, socialRole, influenceScore
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `snm_${Date.now()}_${studentId}`,
        studentId,
        className,
        new Date().toISOString(),
        centralityScore,
        betweennessScore,
        degreeCount,
        isolationRisk,
        socialRole,
        influenceScore
      );
    } catch (error) {
      console.error('Error saving network metrics:', error);
    }

    return {
      centralityScore,
      betweennessScore,
      degreeCount,
      isolationRisk,
      socialRole,
      influenceScore
    };
  }

  private async calculateBetweenness(studentId: string, className: string): Promise<number> {
    const allPaths = this.db.prepare(`
      SELECT DISTINCT r1.studentId as source, r2.peerId as target
      FROM peer_relationships r1
      JOIN peer_relationships r2 ON r1.peerId = r2.studentId
      JOIN students s1 ON r1.studentId = s1.id
      JOIN students s2 ON r2.peerId = s2.id
      WHERE s1.class = ? AND s2.class = ?
      AND r1.relationshipType != 'CONFLICT'
      AND r2.relationshipType != 'CONFLICT'
      AND r1.studentId != ?
      AND r2.peerId != ?
    `).all(className, className, studentId, studentId) as any[];

    const pathsThroughStudent = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM peer_relationships r1
      JOIN peer_relationships r2 ON r1.peerId = r2.studentId
      WHERE r1.peerId = ?
      AND r1.relationshipType != 'CONFLICT'
      AND r2.relationshipType != 'CONFLICT'
    `).get(studentId) as any;

    return allPaths.length > 0 ? (pathsThroughStudent.count / allPaths.length) : 0;
  }

  private determineIsolationRisk(connections: number, classSize: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const ratio = connections / Math.max(1, classSize - 1);
    
    if (connections === 0) return 'CRITICAL';
    if (ratio < 0.1) return 'HIGH';
    if (ratio < 0.25) return 'MEDIUM';
    return 'LOW';
  }

  private determineSocialRole(connections: number, centrality: number): 'LEADER' | 'BRIDGE' | 'FOLLOWER' | 'ISOLATE' | 'PERIPHERAL' {
    if (connections === 0) return 'ISOLATE';
    if (centrality > 0.5) return 'LEADER';
    if (centrality > 0.3) return 'BRIDGE';
    if (centrality > 0.15) return 'FOLLOWER';
    return 'PERIPHERAL';
  }

  private async getStudentGroups(studentId: string) {
    const groups = this.db.prepare(`
      SELECT 
        g.id as groupId,
        g.groupName,
        m.role,
        (SELECT COUNT(*) FROM social_group_members WHERE groupId = g.id) as memberCount
      FROM social_group_members m
      JOIN social_groups g ON m.groupId = g.id
      WHERE m.studentId = ? AND g.isActive = TRUE
    `).all(studentId) as any[];

    return groups;
  }

  private async generateSocialInsights(studentId: string, relationships: any, metrics: any): Promise<Array<{ type: 'strength' | 'concern' | 'opportunity'; title: string; description: string; recommendation: string }>> {
    const insights: Array<{ type: 'strength' | 'concern' | 'opportunity'; title: string; description: string; recommendation: string }> = [];

    if (metrics.isolationRisk === 'CRITICAL' || metrics.isolationRisk === 'HIGH') {
      insights.push({
        type: 'concern',
        title: 'Sosyal İzolasyon Riski',
        description: `Öğrenci sınıf içinde ${relationships.totalConnections} bağlantıya sahip, bu kritik seviyede düşük`,
        recommendation: 'Acil sosyal entegrasyon desteği sağlayın. Grup aktivitelerine dahil edin, akran desteği programı başlatın.'
      });
    }

    if (metrics.socialRole === 'LEADER') {
      insights.push({
        type: 'strength',
        title: 'Liderlik Pozisyonu',
        description: 'Öğrenci sınıfta lider konumunda, yüksek sosyal etki gücüne sahip',
        recommendation: 'Liderlik becerilerini pozitif yönde kullanması için rehberlik edin. Akran mentörlüğü fırsatı verin.'
      });
    }

    if (relationships.conflicts > 2) {
      insights.push({
        type: 'concern',
        title: 'Çatışma Durumu',
        description: `${relationships.conflicts} çatışma ilişkisi tespit edildi`,
        recommendation: 'Çatışma çözme becerileri üzerine çalışın. Mediasyon desteği sağlayın.'
      });
    }

    if (relationships.closeFriends >= 3) {
      insights.push({
        type: 'strength',
        title: 'Güçlü Arkadaşlık Ağı',
        description: `${relationships.closeFriends} yakın arkadaşlık bağı mevcut`,
        recommendation: 'Bu güçlü sosyal desteği korumaya devam edin. Grup aktivitelerinde bu arkadaşlarla işbirliği teşvik edin.'
      });
    }

    if (relationships.totalConnections > 0 && relationships.totalConnections < 3) {
      insights.push({
        type: 'opportunity',
        title: 'Sosyal Ağ Genişletme Fırsatı',
        description: 'Sınırlı sosyal bağlantılar mevcut, genişleme potansiyeli var',
        recommendation: 'Farklı grup aktivitelerine katılımı teşvik edin. Ortak ilgi alanlarına sahip arkadaşlarla tanıştırın.'
      });
    }

    return insights;
  }

  private async calculateClassPositioning(studentId: string, className: string) {
    const allStudentMetrics = this.db.prepare(`
      SELECT studentId, degreeCount
      FROM social_network_metrics
      WHERE className = ?
      ORDER BY degreeCount DESC
    `).all(className) as any[];

    const studentIndex = allStudentMetrics.findIndex(m => m.studentId === studentId);
    const popularityPercentile = allStudentMetrics.length > 0
      ? ((allStudentMetrics.length - studentIndex) / allStudentMetrics.length) * 100
      : 50;

    const studentMetric = allStudentMetrics.find(m => m.studentId === studentId);
    const connections = studentMetric?.degreeCount || 0;

    let integrationLevel = 'Orta';
    if (connections === 0) integrationLevel = 'Çok Düşük';
    else if (connections < 2) integrationLevel = 'Düşük';
    else if (connections >= 5) integrationLevel = 'Yüksek';

    const peerAcceptance = Math.min(10, connections);

    return {
      popularityPercentile,
      integrationLevel,
      peerAcceptance
    };
  }

  private async calculateNetworkDensity(className: string): Promise<number> {
    const students = this.db.prepare(
      'SELECT COUNT(*) as count FROM students WHERE class = ?'
    ).get(className) as any;

    const relationships = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM peer_relationships pr
      JOIN students s ON pr.studentId = s.id
      WHERE s.class = ? AND pr.relationshipType != 'CONFLICT'
    `).get(className) as any;

    const possibleConnections = students.count * (students.count - 1);
    return possibleConnections > 0 ? (relationships.count / possibleConnections) : 0;
  }

  private async identifyClusters(className: string) {
    const relationships = this.db.prepare(`
      SELECT pr.studentId, pr.peerId, s1.name as studentName, s2.name as peerName
      FROM peer_relationships pr
      JOIN students s1 ON pr.studentId = s1.id
      JOIN students s2 ON pr.peerId = s2.id
      WHERE s1.class = ? 
      AND pr.relationshipType IN ('FRIEND', 'CLOSE_FRIEND')
      AND pr.relationshipStrength >= 5
    `).all(className) as Array<{ studentId: string; peerId: string; studentName: string; peerName: string }>;

    // ✅ OPTIMIZATION: Build adjacency map for O(1) lookups instead of O(n) searches
    const adjacencyMap = new Map<string, Set<string>>();
    relationships.forEach(rel => {
      if (!adjacencyMap.has(rel.studentId)) {
        adjacencyMap.set(rel.studentId, new Set());
      }
      adjacencyMap.get(rel.studentId)!.add(rel.peerId);
    });

    const clusters: Array<{ clusterId: string; size: number; members: string[]; cohesion: number }> = [];
    const processed = new Set<string>();

    relationships.forEach(rel => {
      if (!processed.has(rel.studentId)) {
        const cluster = this.findClusterOptimized(rel.studentId, adjacencyMap, processed);
        if (cluster.size > 1) {
          const memberArray = Array.from(cluster);
          clusters.push({
            clusterId: `cluster_${clusters.length + 1}`,
            size: cluster.size,
            members: memberArray,
            cohesion: this.calculateClusterCohesionOptimized(memberArray, adjacencyMap)
          });
        }
      }
    });

    return clusters;
  }

  private findClusterOptimized(startId: string, adjacencyMap: Map<string, Set<string>>, processed: Set<string>): Set<string> {
    const cluster = new Set<string>([startId]);
    const toProcess = [startId];
    processed.add(startId);

    while (toProcess.length > 0) {
      const current = toProcess.pop();
      if (!current) break;
      
      // ✅ OPTIMIZATION: O(1) lookup using adjacency map instead of O(n) filter
      const neighbors = adjacencyMap.get(current) || new Set();
      neighbors.forEach(peerId => {
        if (!processed.has(peerId)) {
          cluster.add(peerId);
          toProcess.push(peerId);
          processed.add(peerId);
        }
      });
    }

    return cluster;
  }

  private calculateClusterCohesionOptimized(members: string[], adjacencyMap: Map<string, Set<string>>): number {
    // Guard against empty or single-member clusters
    if (members.length <= 1) {
      return 0;
    }
    
    const memberSet = new Set(members);
    const possibleConnections = members.length * (members.length - 1);
    
    // ✅ OPTIMIZATION: Use adjacency map for O(n) instead of O(n²)
    let actualConnections = 0;
    members.forEach(memberId => {
      const neighbors = adjacencyMap.get(memberId) || new Set();
      neighbors.forEach(peerId => {
        if (memberSet.has(peerId)) {
          actualConnections++;
        }
      });
    });

    return possibleConnections > 0 ? actualConnections / possibleConnections : 0;
  }

  private async identifyIsolatedStudents(className: string) {
    const isolated = this.db.prepare(`
      SELECT s.id as studentId, s.name as studentName, snm.isolationRisk
      FROM students s
      LEFT JOIN social_network_metrics snm ON s.id = snm.studentId
      WHERE s.class = ?
      AND (snm.degreeCount = 0 OR snm.degreeCount IS NULL OR snm.isolationRisk IN ('HIGH', 'CRITICAL'))
    `).all(className) as any[];

    return isolated;
  }

  private async identifyCentralFigures(className: string) {
    const central = this.db.prepare(`
      SELECT s.id as studentId, s.name as studentName, 
             snm.socialRole as role, snm.influenceScore as influence
      FROM students s
      JOIN social_network_metrics snm ON s.id = snm.studentId
      WHERE s.class = ?
      AND snm.socialRole IN ('LEADER', 'BRIDGE')
      ORDER BY snm.influenceScore DESC
      LIMIT 5
    `).all(className) as any[];

    return central;
  }

  private async identifyConflicts(className: string) {
    const conflicts = this.db.prepare(`
      SELECT 
        s1.name as student1,
        s2.name as student2,
        pr.relationshipStrength as severity
      FROM peer_relationships pr
      JOIN students s1 ON pr.studentId = s1.id
      JOIN students s2 ON pr.peerId = s2.id
      WHERE s1.class = ?
      AND pr.relationshipType = 'CONFLICT'
      ORDER BY pr.relationshipStrength DESC
    `).all(className) as any[];

    return conflicts;
  }
}
