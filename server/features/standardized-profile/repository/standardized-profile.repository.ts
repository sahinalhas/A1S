import type Database from 'better-sqlite3';
import type { 
  AcademicProfile,
  SocialEmotionalProfile,
  TalentsInterestsProfile,
  StandardizedHealthProfile,
  StandardizedIntervention,
  StandardizedBehaviorIncident,
  MotivationProfile,
  RiskProtectiveProfile
} from '../../../../shared/types/standardized-profile.types.js';

export class StandardizedProfileRepository {
  constructor(private db: Database.Database) {}

  getAcademicProfile(studentId: string): AcademicProfile | null {
    const stmt = this.db.prepare(`
      SELECT * FROM academic_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `);
    return stmt.get(studentId) as AcademicProfile | null;
  }

  upsertAcademicProfile(profile: AcademicProfile): void {
    const stmt = this.db.prepare(`
      INSERT INTO academic_profiles (
        id, studentId, assessmentDate, strongSubjects, weakSubjects,
        strongSkills, weakSkills, primaryLearningStyle, secondaryLearningStyle,
        overallMotivation, studyHoursPerWeek, homeworkCompletionRate,
        additionalNotes, assessedBy, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        assessmentDate = excluded.assessmentDate,
        strongSubjects = excluded.strongSubjects,
        weakSubjects = excluded.weakSubjects,
        strongSkills = excluded.strongSkills,
        weakSkills = excluded.weakSkills,
        primaryLearningStyle = excluded.primaryLearningStyle,
        secondaryLearningStyle = excluded.secondaryLearningStyle,
        overallMotivation = excluded.overallMotivation,
        studyHoursPerWeek = excluded.studyHoursPerWeek,
        homeworkCompletionRate = excluded.homeworkCompletionRate,
        additionalNotes = excluded.additionalNotes,
        assessedBy = excluded.assessedBy,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      profile.id,
      profile.studentId,
      profile.assessmentDate,
      JSON.stringify(profile.strongSubjects),
      JSON.stringify(profile.weakSubjects),
      JSON.stringify(profile.strongSkills),
      JSON.stringify(profile.weakSkills),
      profile.primaryLearningStyle,
      profile.secondaryLearningStyle,
      profile.overallMotivation,
      profile.studyHoursPerWeek,
      profile.homeworkCompletionRate,
      profile.additionalNotes,
      profile.assessedBy
    );
  }

  getSocialEmotionalProfile(studentId: string): SocialEmotionalProfile | null {
    const stmt = this.db.prepare(`
      SELECT * FROM social_emotional_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `);
    return stmt.get(studentId) as SocialEmotionalProfile | null;
  }

  upsertSocialEmotionalProfile(profile: SocialEmotionalProfile): void {
    const stmt = this.db.prepare(`
      INSERT INTO social_emotional_profiles (
        id, studentId, assessmentDate, strongSocialSkills, developingSocialSkills,
        empathyLevel, selfAwarenessLevel, emotionRegulationLevel, conflictResolutionLevel,
        leadershipLevel, teamworkLevel, communicationLevel,
        friendCircleSize, friendCircleQuality, socialRole, bullyingStatus,
        identifiedRiskFactors, protectiveFactors, recommendedInterventions,
        additionalNotes, assessedBy, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        assessmentDate = excluded.assessmentDate,
        strongSocialSkills = excluded.strongSocialSkills,
        developingSocialSkills = excluded.developingSocialSkills,
        empathyLevel = excluded.empathyLevel,
        selfAwarenessLevel = excluded.selfAwarenessLevel,
        emotionRegulationLevel = excluded.emotionRegulationLevel,
        conflictResolutionLevel = excluded.conflictResolutionLevel,
        leadershipLevel = excluded.leadershipLevel,
        teamworkLevel = excluded.teamworkLevel,
        communicationLevel = excluded.communicationLevel,
        friendCircleSize = excluded.friendCircleSize,
        friendCircleQuality = excluded.friendCircleQuality,
        socialRole = excluded.socialRole,
        bullyingStatus = excluded.bullyingStatus,
        identifiedRiskFactors = excluded.identifiedRiskFactors,
        protectiveFactors = excluded.protectiveFactors,
        recommendedInterventions = excluded.recommendedInterventions,
        additionalNotes = excluded.additionalNotes,
        assessedBy = excluded.assessedBy,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      profile.id,
      profile.studentId,
      profile.assessmentDate,
      JSON.stringify(profile.strongSocialSkills),
      JSON.stringify(profile.developingSocialSkills),
      profile.empathyLevel,
      profile.selfAwarenessLevel,
      profile.emotionRegulationLevel,
      profile.conflictResolutionLevel,
      profile.leadershipLevel,
      profile.teamworkLevel,
      profile.communicationLevel,
      profile.friendCircleSize,
      profile.friendCircleQuality,
      profile.socialRole,
      profile.bullyingStatus,
      profile.identifiedRiskFactors ? JSON.stringify(profile.identifiedRiskFactors) : '[]',
      profile.protectiveFactors ? JSON.stringify(profile.protectiveFactors) : '[]',
      profile.recommendedInterventions ? JSON.stringify(profile.recommendedInterventions) : '[]',
      profile.additionalNotes,
      profile.assessedBy
    );
  }

  getTalentsInterestsProfile(studentId: string): TalentsInterestsProfile | null {
    const stmt = this.db.prepare(`
      SELECT * FROM talents_interests_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `);
    return stmt.get(studentId) as TalentsInterestsProfile | null;
  }

  upsertTalentsInterestsProfile(profile: TalentsInterestsProfile): void {
    const stmt = this.db.prepare(`
      INSERT INTO talents_interests_profiles (
        id, studentId, assessmentDate, creativeTalents, physicalTalents,
        primaryInterests, exploratoryInterests, talentProficiency,
        weeklyEngagementHours, clubMemberships, competitionsParticipated,
        additionalNotes, assessedBy, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        assessmentDate = excluded.assessmentDate,
        creativeTalents = excluded.creativeTalents,
        physicalTalents = excluded.physicalTalents,
        primaryInterests = excluded.primaryInterests,
        exploratoryInterests = excluded.exploratoryInterests,
        talentProficiency = excluded.talentProficiency,
        weeklyEngagementHours = excluded.weeklyEngagementHours,
        clubMemberships = excluded.clubMemberships,
        competitionsParticipated = excluded.competitionsParticipated,
        additionalNotes = excluded.additionalNotes,
        assessedBy = excluded.assessedBy,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      profile.id,
      profile.studentId,
      profile.assessmentDate,
      JSON.stringify(profile.creativeTalents),
      JSON.stringify(profile.physicalTalents),
      JSON.stringify(profile.primaryInterests),
      JSON.stringify(profile.exploratoryInterests),
      profile.talentProficiency ? JSON.stringify(profile.talentProficiency) : null,
      profile.weeklyEngagementHours,
      JSON.stringify(profile.clubMemberships),
      JSON.stringify(profile.competitionsParticipated),
      profile.additionalNotes,
      profile.assessedBy
    );
  }

  getStandardizedHealthProfile(studentId: string): StandardizedHealthProfile | null {
    const stmt = this.db.prepare(`
      SELECT * FROM standardized_health_profiles 
      WHERE studentId = ?
    `);
    return stmt.get(studentId) as StandardizedHealthProfile | null;
  }

  upsertStandardizedHealthProfile(profile: StandardizedHealthProfile): void {
    const stmt = this.db.prepare(`
      INSERT INTO standardized_health_profiles (
        id, studentId, bloodType, chronicDiseases, allergies, currentMedications,
        medicalHistory, specialNeeds, physicalLimitations,
        emergencyContact1Name, emergencyContact1Phone, emergencyContact1Relation,
        emergencyContact2Name, emergencyContact2Phone, emergencyContact2Relation,
        physicianName, physicianPhone, lastHealthCheckup, additionalNotes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(studentId) DO UPDATE SET
        bloodType = excluded.bloodType,
        chronicDiseases = excluded.chronicDiseases,
        allergies = excluded.allergies,
        currentMedications = excluded.currentMedications,
        medicalHistory = excluded.medicalHistory,
        specialNeeds = excluded.specialNeeds,
        physicalLimitations = excluded.physicalLimitations,
        emergencyContact1Name = excluded.emergencyContact1Name,
        emergencyContact1Phone = excluded.emergencyContact1Phone,
        emergencyContact1Relation = excluded.emergencyContact1Relation,
        emergencyContact2Name = excluded.emergencyContact2Name,
        emergencyContact2Phone = excluded.emergencyContact2Phone,
        emergencyContact2Relation = excluded.emergencyContact2Relation,
        physicianName = excluded.physicianName,
        physicianPhone = excluded.physicianPhone,
        lastHealthCheckup = excluded.lastHealthCheckup,
        additionalNotes = excluded.additionalNotes,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      profile.id,
      profile.studentId,
      profile.bloodType,
      JSON.stringify(profile.chronicDiseases),
      JSON.stringify(profile.allergies),
      JSON.stringify(profile.currentMedications),
      profile.medicalHistory,
      profile.specialNeeds,
      profile.physicalLimitations,
      profile.emergencyContact1Name,
      profile.emergencyContact1Phone,
      profile.emergencyContact1Relation,
      profile.emergencyContact2Name,
      profile.emergencyContact2Phone,
      profile.emergencyContact2Relation,
      profile.physicianName,
      profile.physicianPhone,
      profile.lastHealthCheckup,
      profile.additionalNotes
    );
  }

  getStandardizedInterventions(studentId: string): StandardizedIntervention[] {
    const stmt = this.db.prepare(`
      SELECT * FROM standardized_interventions 
      WHERE studentId = ? 
      ORDER BY startDate DESC
    `);
    return stmt.all(studentId) as StandardizedIntervention[];
  }

  insertStandardizedIntervention(intervention: StandardizedIntervention): void {
    const stmt = this.db.prepare(`
      INSERT INTO standardized_interventions (
        id, studentId, interventionType, interventionCategory,
        targetIssues, targetSkills, startDate, endDate, sessionFrequency,
        totalSessions, completedSessions, initialAssessment, currentAssessment,
        effectiveness, status, assignedCounselor, otherStaff,
        description, progressNotes, outcomeNotes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      intervention.id,
      intervention.studentId,
      intervention.interventionType,
      intervention.interventionCategory,
      JSON.stringify(intervention.targetIssues),
      JSON.stringify(intervention.targetSkills),
      intervention.startDate,
      intervention.endDate,
      intervention.sessionFrequency,
      intervention.totalSessions,
      intervention.completedSessions,
      intervention.initialAssessment,
      intervention.currentAssessment,
      intervention.effectiveness,
      intervention.status,
      intervention.assignedCounselor,
      intervention.otherStaff ? JSON.stringify(intervention.otherStaff) : null,
      intervention.description,
      intervention.progressNotes,
      intervention.outcomeNotes
    );
  }

  getStandardizedBehaviorIncidents(studentId: string): StandardizedBehaviorIncident[] {
    const stmt = this.db.prepare(`
      SELECT * FROM standardized_behavior_incidents 
      WHERE studentId = ? 
      ORDER BY incidentDate DESC, incidentTime DESC
      LIMIT 50
    `);
    return stmt.all(studentId) as StandardizedBehaviorIncident[];
  }

  insertStandardizedBehaviorIncident(incident: StandardizedBehaviorIncident): void {
    const stmt = this.db.prepare(`
      INSERT INTO standardized_behavior_incidents (
        id, studentId, incidentDate, incidentTime, location,
        behaviorCategory, behaviorType, antecedent, description, consequence,
        interventionsUsed, interventionEffectiveness,
        parentNotified, adminNotified, followUpNeeded, status,
        reportedBy, witnessedBy, additionalNotes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      incident.id,
      incident.studentId,
      incident.incidentDate,
      incident.incidentTime,
      incident.location,
      incident.behaviorCategory,
      incident.behaviorType,
      incident.antecedent,
      incident.description,
      incident.consequence,
      JSON.stringify(incident.interventionsUsed),
      incident.interventionEffectiveness,
      incident.parentNotified ? 1 : 0,
      incident.adminNotified ? 1 : 0,
      incident.followUpNeeded ? 1 : 0,
      incident.status,
      incident.reportedBy,
      incident.witnessedBy ? JSON.stringify(incident.witnessedBy) : null,
      incident.additionalNotes
    );
  }

  getMotivationProfile(studentId: string): MotivationProfile | null {
    const stmt = this.db.prepare(`
      SELECT * FROM motivation_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC, updated_at DESC 
      LIMIT 1
    `);
    return stmt.get(studentId) as MotivationProfile | null;
  }

  upsertMotivationProfile(profile: MotivationProfile): void {
    const stmt = this.db.prepare(`
      INSERT INTO motivation_profiles (
        id, studentId, assessmentDate, primaryMotivationSources, careerAspirations,
        academicGoals, goalClarityLevel, intrinsicMotivation, extrinsicMotivation,
        persistenceLevel, futureOrientationLevel, shortTermGoals, longTermGoals,
        obstacles, supportNeeds, additionalNotes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        assessmentDate = excluded.assessmentDate,
        primaryMotivationSources = excluded.primaryMotivationSources,
        careerAspirations = excluded.careerAspirations,
        academicGoals = excluded.academicGoals,
        goalClarityLevel = excluded.goalClarityLevel,
        intrinsicMotivation = excluded.intrinsicMotivation,
        extrinsicMotivation = excluded.extrinsicMotivation,
        persistenceLevel = excluded.persistenceLevel,
        futureOrientationLevel = excluded.futureOrientationLevel,
        shortTermGoals = excluded.shortTermGoals,
        longTermGoals = excluded.longTermGoals,
        obstacles = excluded.obstacles,
        supportNeeds = excluded.supportNeeds,
        additionalNotes = excluded.additionalNotes,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      profile.id,
      profile.studentId,
      profile.assessmentDate,
      JSON.stringify(profile.primaryMotivationSources || []),
      JSON.stringify(profile.careerAspirations || []),
      JSON.stringify(profile.academicGoals || []),
      profile.goalClarityLevel,
      profile.intrinsicMotivation,
      profile.extrinsicMotivation,
      profile.persistenceLevel,
      profile.futureOrientationLevel,
      profile.shortTermGoals,
      profile.longTermGoals,
      profile.obstacles,
      profile.supportNeeds,
      profile.additionalNotes
    );
  }

  getRiskProtectiveProfile(studentId: string): RiskProtectiveProfile | null {
    const stmt = this.db.prepare(`
      SELECT * FROM risk_protective_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC, updated_at DESC 
      LIMIT 1
    `);
    return stmt.get(studentId) as RiskProtectiveProfile | null;
  }

  upsertRiskProtectiveProfile(profile: RiskProtectiveProfile): void {
    const stmt = this.db.prepare(`
      INSERT INTO risk_protective_profiles (
        id, studentId, assessmentDate, academicRiskLevel, behavioralRiskLevel,
        socialEmotionalRiskLevel, attendanceRiskLevel, dropoutRisk,
        activeProtectiveFactors, academicRiskFactors, behavioralRiskFactors,
        socialRiskFactors, familyRiskFactors, overallRiskScore,
        recommendedInterventions, assignedCounselor, parentNotified,
        nextAssessmentDate, additionalNotes, assessedBy, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        assessmentDate = excluded.assessmentDate,
        academicRiskLevel = excluded.academicRiskLevel,
        behavioralRiskLevel = excluded.behavioralRiskLevel,
        socialEmotionalRiskLevel = excluded.socialEmotionalRiskLevel,
        attendanceRiskLevel = excluded.attendanceRiskLevel,
        dropoutRisk = excluded.dropoutRisk,
        activeProtectiveFactors = excluded.activeProtectiveFactors,
        academicRiskFactors = excluded.academicRiskFactors,
        behavioralRiskFactors = excluded.behavioralRiskFactors,
        socialRiskFactors = excluded.socialRiskFactors,
        familyRiskFactors = excluded.familyRiskFactors,
        overallRiskScore = excluded.overallRiskScore,
        recommendedInterventions = excluded.recommendedInterventions,
        assignedCounselor = excluded.assignedCounselor,
        parentNotified = excluded.parentNotified,
        nextAssessmentDate = excluded.nextAssessmentDate,
        additionalNotes = excluded.additionalNotes,
        assessedBy = excluded.assessedBy,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      profile.id,
      profile.studentId,
      profile.assessmentDate,
      profile.academicRiskLevel || null,
      profile.behavioralRiskLevel || null,
      profile.socialEmotionalRiskLevel || null,
      profile.attendanceRiskLevel || null,
      profile.dropoutRisk || null,
      JSON.stringify(profile.activeProtectiveFactors || []),
      profile.academicRiskFactors || null,
      profile.behavioralRiskFactors || null,
      profile.socialRiskFactors || null,
      profile.familyRiskFactors || null,
      profile.overallRiskScore || null,
      JSON.stringify(profile.recommendedInterventions || []),
      profile.assignedCounselor || null,
      profile.parentNotified ? 1 : 0,
      profile.nextAssessmentDate || null,
      profile.additionalNotes || null,
      profile.assessedBy || null
    );
  }
}
