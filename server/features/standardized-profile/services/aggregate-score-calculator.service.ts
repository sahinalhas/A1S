interface ProfileData {
  strongSubjects?: string;
  weakSubjects?: string;
  strongSkills?: string;
  overallMotivation?: number;
  homeworkCompletionRate?: number;
  empathyLevel?: number;
  selfAwarenessLevel?: number;
  emotionRegulationLevel?: number;
  conflictResolutionLevel?: number;
  leadershipLevel?: number;
  teamworkLevel?: number;
  communicationLevel?: number;
  strongSocialSkills?: string;
  developingSocialSkills?: string;
  friendCircleSize?: string;
  friendCircleQuality?: string;
  socialRole?: string;
  bullyingStatus?: string;
  creativeTalents?: string;
  physicalTalents?: string;
  primaryInterests?: string;
  weeklyEngagementHours?: number;
  chronicDiseases?: string;
  allergies?: string;
  currentMedications?: string;
  specialNeeds?: boolean;
  physicalLimitations?: boolean;
  severity?: string;
  frequency?: string;
  interventionEffectiveness?: number;
  goalClarityLevel?: number;
  intrinsicMotivationLevel?: number;
  extrinsicMotivationLevel?: number;
  persistenceLevel?: number;
  futureOrientationLevel?: number;
  primaryMotivators?: string;
  careerAspirations?: string;
  academicGoals?: string;
  overallRiskLevel?: number;
  academicRiskLevel?: number;
  behavioralRiskLevel?: number;
  emotionalRiskLevel?: number;
  socialRiskLevel?: number;
  identifiedRiskFactors?: string;
  familySupport?: number;
  peerSupport?: number;
  schoolEngagement?: number;
  resilienceLevel?: number;
  copingSkills?: number;
  protectiveFactors?: string;
}

export interface AggregateScores {
  academicScore: number;
  socialEmotionalScore: number;
  talentsInterestsScore: number;
  healthWellnessScore: number;
  behaviorScore: number;
  motivationScore: number;
  riskScore: number;
  protectiveScore: number;
  overallScore: number;
  scoreBreakdown: {
    academic: {
      strongSubjectsCount: number;
      weakSubjectsCount: number;
      strongSkillsCount: number;
      motivationLevel: number;
      homeworkCompletionRate: number;
      score: number;
    };
    socialEmotional: {
      avgSELCompetency: number;
      strongSkillsCount: number;
      developingSkillsCount: number;
      socialContextScore: number;
      score: number;
    };
    talentsInterests: {
      creativeTalentsCount: number;
      physicalTalentsCount: number;
      interestsCount: number;
      engagementHours: number;
      score: number;
    };
    health: {
      chronicDiseasesCount: number;
      allergiesCount: number;
      medicationsCount: number;
      healthStatusScore: number;
      score: number;
    };
    behavior: {
      incidentCount: number;
      avgSeverity: number;
      avgFrequency: number;
      interventionEffectiveness: number;
      score: number;
    };
    motivation: {
      goalClarity: number;
      intrinsicMotivation: number;
      persistence: number;
      futureOrientation: number;
      score: number;
    };
    risk: {
      overallRiskLevel: number;
      riskFactorsCount: number;
      avgRiskAcrossDomains: number;
      score: number;
    };
    protective: {
      protectiveFactorsCount: number;
      avgProtectiveFactors: number;
      resilienceLevel: number;
      score: number;
    };
  };
  lastCalculated: string;
}

export class AggregateScoreCalculator {
  calculateAcademicScore(academicProfile: ProfileData | null | undefined): number {
    if (!academicProfile) return 0;

    const strongSubjects = academicProfile.strongSubjects ? JSON.parse(academicProfile.strongSubjects).length : 0;
    const weakSubjects = academicProfile.weakSubjects ? JSON.parse(academicProfile.weakSubjects).length : 0;
    const strongSkills = academicProfile.strongSkills ? JSON.parse(academicProfile.strongSkills).length : 0;
    const motivation = academicProfile.overallMotivation || 5;
    const homeworkCompletion = academicProfile.homeworkCompletionRate || 50;

    const subjectScore = Math.max(0, (strongSubjects * 10) - (weakSubjects * 5));
    const skillScore = strongSkills * 8;
    const motivationScore = motivation * 5;
    const homeworkScore = homeworkCompletion / 2;

    const totalScore = (subjectScore + skillScore + motivationScore + homeworkScore) / 4;
    return Math.min(100, Math.max(0, totalScore));
  }

  calculateSocialEmotionalScore(selProfile: ProfileData | null | undefined): number {
    if (!selProfile) return 0;

    const strongSkills = selProfile.strongSocialSkills ? JSON.parse(selProfile.strongSocialSkills).length : 0;
    const developingSkills = selProfile.developingSocialSkills ? JSON.parse(selProfile.developingSocialSkills).length : 0;

    const avgSEL = (
      (selProfile.empathyLevel || 5) +
      (selProfile.selfAwarenessLevel || 5) +
      (selProfile.emotionRegulationLevel || 5) +
      (selProfile.conflictResolutionLevel || 5) +
      (selProfile.leadershipLevel || 5) +
      (selProfile.teamworkLevel || 5) +
      (selProfile.communicationLevel || 5)
    ) / 7;

    const skillScore = (strongSkills * 5) - (developingSkills * 2);
    const selScore = avgSEL * 10;

    const socialContextScore = this.calculateSocialContextScore(selProfile);

    const totalScore = (skillScore + selScore + socialContextScore) / 3;
    return Math.min(100, Math.max(0, totalScore));
  }

  private calculateSocialContextScore(selProfile: ProfileData): number {
    let score = 50;

    const friendCircleMap: Record<string, number> = {
      'YOK': -20,
      'AZ': -10,
      'ORTA': 10,
      'GENİŞ': 20
    };

    const friendQualityMap: Record<string, number> = {
      'ZAYIF': -15,
      'ORTA': 0,
      'İYİ': 15,
      'ÇOK_İYİ': 25
    };

    const socialRoleMap: Record<string, number> = {
      'LİDER': 25,
      'AKTİF_ÜYE': 15,
      'TAKİPÇİ': 5,
      'GÖZLEMCİ': -5,
      'İZOLE': -25
    };

    const bullyingMap: Record<string, number> = {
      'YOK': 20,
      'GÖZLEMCİ': 0,
      'MAĞDUR': -25,
      'FAİL': -30,
      'HER_İKİSİ': -40
    };

    if (selProfile.friendCircleSize) score += friendCircleMap[selProfile.friendCircleSize] || 0;
    if (selProfile.friendCircleQuality) score += friendQualityMap[selProfile.friendCircleQuality] || 0;
    if (selProfile.socialRole) score += socialRoleMap[selProfile.socialRole] || 0;
    if (selProfile.bullyingStatus) score += bullyingMap[selProfile.bullyingStatus] || 0;

    return Math.min(100, Math.max(0, score));
  }

  calculateTalentsInterestsScore(talentsProfile: ProfileData | null | undefined): number {
    if (!talentsProfile) return 0;

    const creativeTalents = talentsProfile.creativeTalents ? JSON.parse(talentsProfile.creativeTalents).length : 0;
    const physicalTalents = talentsProfile.physicalTalents ? JSON.parse(talentsProfile.physicalTalents).length : 0;
    const primaryInterests = talentsProfile.primaryInterests ? JSON.parse(talentsProfile.primaryInterests).length : 0;
    const engagementHours = talentsProfile.weeklyEngagementHours || 0;

    const talentScore = (creativeTalents + physicalTalents) * 8;
    const interestScore = primaryInterests * 6;
    const engagementScore = Math.min(40, engagementHours * 2);

    const totalScore = (talentScore + interestScore + engagementScore) / 3;
    return Math.min(100, Math.max(0, totalScore));
  }

  calculateHealthWellnessScore(healthProfile: ProfileData | null | undefined): number {
    if (!healthProfile) return 50;

    let score = 100;

    const chronicDiseases = healthProfile.chronicDiseases ? JSON.parse(healthProfile.chronicDiseases).length : 0;
    const allergies = healthProfile.allergies ? JSON.parse(healthProfile.allergies).length : 0;
    const medications = healthProfile.currentMedications ? JSON.parse(healthProfile.currentMedications).length : 0;

    score -= chronicDiseases * 8;
    score -= allergies * 3;
    score -= medications * 5;

    if (healthProfile.specialNeeds) score -= 10;
    if (healthProfile.physicalLimitations) score -= 10;

    return Math.min(100, Math.max(0, score));
  }

  calculateBehaviorScore(behaviorIncidents: ProfileData[]): number {
    if (!behaviorIncidents || behaviorIncidents.length === 0) return 100;

    let score = 100;

    const incidentCount = behaviorIncidents.length;
    score -= incidentCount * 5;

    const severityMap: Record<string, number> = {
      'DÜŞÜK': 2,
      'ORTA': 5,
      'YÜKSEK': 10,
      'ÇOK_YÜKSEK': 15
    };

    const frequencyMap: Record<string, number> = {
      'TEK_OLAY': 1,
      'NADİR': 3,
      'HAFTALIK': 6,
      'GÜNLÜK': 10,
      'SÜREKLİ': 15
    };

    let totalSeverity = 0;
    let totalFrequency = 0;
    let totalEffectiveness = 0;
    let effectivenessCount = 0;

    behaviorIncidents.forEach(incident => {
      totalSeverity += (incident.severity ? severityMap[incident.severity] : 0) || 0;
      totalFrequency += (incident.frequency ? frequencyMap[incident.frequency] : 0) || 0;
      
      if (incident.interventionEffectiveness) {
        totalEffectiveness += incident.interventionEffectiveness;
        effectivenessCount++;
      }
    });

    const avgSeverity = totalSeverity / incidentCount;
    const avgFrequency = totalFrequency / incidentCount;
    const avgEffectiveness = effectivenessCount > 0 ? totalEffectiveness / effectivenessCount : 5;

    score -= avgSeverity * 2;
    score -= avgFrequency * 2;
    score += (avgEffectiveness - 5) * 2;

    return Math.min(100, Math.max(0, score));
  }

  calculateMotivationScore(motivationProfile: ProfileData | null | undefined): number {
    if (!motivationProfile) return 50;

    const goalClarity = motivationProfile.goalClarityLevel || 5;
    const intrinsic = motivationProfile.intrinsicMotivationLevel || 5;
    const extrinsic = motivationProfile.extrinsicMotivationLevel || 5;
    const persistence = motivationProfile.persistenceLevel || 5;
    const futureOrientation = motivationProfile.futureOrientationLevel || 5;

    const primaryMotivators = motivationProfile.primaryMotivators ? JSON.parse(motivationProfile.primaryMotivators).length : 0;
    const careerAspirations = motivationProfile.careerAspirations ? JSON.parse(motivationProfile.careerAspirations).length : 0;
    const academicGoals = motivationProfile.academicGoals ? JSON.parse(motivationProfile.academicGoals).length : 0;

    const avgMotivation = (goalClarity + intrinsic + extrinsic + persistence + futureOrientation) / 5;
    const motivationScore = avgMotivation * 10;
    
    const goalsScore = (primaryMotivators + careerAspirations + academicGoals) * 3;

    const totalScore = (motivationScore + goalsScore) / 2;
    return Math.min(100, Math.max(0, totalScore));
  }

  calculateRiskScore(riskProfile: ProfileData | null | undefined): number {
    if (!riskProfile) return 50;

    const overallRisk = riskProfile.overallRiskLevel || 5;
    const academicRisk = riskProfile.academicRiskLevel || 5;
    const behavioralRisk = riskProfile.behavioralRiskLevel || 5;
    const emotionalRisk = riskProfile.emotionalRiskLevel || 5;
    const socialRisk = riskProfile.socialRiskLevel || 5;

    const avgRisk = (overallRisk + academicRisk + behavioralRisk + emotionalRisk + socialRisk) / 5;

    const riskFactors = riskProfile.identifiedRiskFactors ? JSON.parse(riskProfile.identifiedRiskFactors).length : 0;

    const riskScore = 100 - (avgRisk * 10);
    const factorScore = 100 - (riskFactors * 5);

    const totalScore = (riskScore + factorScore) / 2;
    return Math.min(100, Math.max(0, totalScore));
  }

  calculateProtectiveScore(riskProfile: ProfileData | null | undefined): number {
    if (!riskProfile) return 50;

    const familySupport = riskProfile.familySupport || 5;
    const peerSupport = riskProfile.peerSupport || 5;
    const schoolEngagement = riskProfile.schoolEngagement || 5;
    const resilience = riskProfile.resilienceLevel || 5;
    const copingSkills = riskProfile.copingSkills || 5;

    const avgProtective = (familySupport + peerSupport + schoolEngagement + resilience + copingSkills) / 5;

    const protectiveFactors = riskProfile.protectiveFactors ? JSON.parse(riskProfile.protectiveFactors).length : 0;

    const protectiveScore = avgProtective * 10;
    const factorScore = protectiveFactors * 5;

    const totalScore = (protectiveScore + factorScore) / 2;
    return Math.min(100, Math.max(0, totalScore));
  }

  calculateAggregateScores(profileData: {
    academic?: ProfileData | null;
    socialEmotional?: ProfileData | null;
    talentsInterests?: ProfileData | null;
    health?: ProfileData | null;
    behaviorIncidents?: ProfileData[];
    motivation?: ProfileData | null;
    riskProtective?: ProfileData | null;
  }): AggregateScores {
    const academicScore = this.calculateAcademicScore(profileData.academic);
    const socialEmotionalScore = this.calculateSocialEmotionalScore(profileData.socialEmotional);
    const talentsInterestsScore = this.calculateTalentsInterestsScore(profileData.talentsInterests);
    const healthWellnessScore = this.calculateHealthWellnessScore(profileData.health);
    const behaviorScore = this.calculateBehaviorScore(profileData.behaviorIncidents || []);
    const motivationScore = this.calculateMotivationScore(profileData.motivation);
    const riskScore = this.calculateRiskScore(profileData.riskProtective);
    const protectiveScore = this.calculateProtectiveScore(profileData.riskProtective);

    const overallScore = (
      academicScore * 0.20 +
      socialEmotionalScore * 0.20 +
      talentsInterestsScore * 0.10 +
      healthWellnessScore * 0.10 +
      behaviorScore * 0.15 +
      motivationScore * 0.10 +
      riskScore * 0.075 +
      protectiveScore * 0.075
    );

    return {
      academicScore: Math.round(academicScore),
      socialEmotionalScore: Math.round(socialEmotionalScore),
      talentsInterestsScore: Math.round(talentsInterestsScore),
      healthWellnessScore: Math.round(healthWellnessScore),
      behaviorScore: Math.round(behaviorScore),
      motivationScore: Math.round(motivationScore),
      riskScore: Math.round(riskScore),
      protectiveScore: Math.round(protectiveScore),
      overallScore: Math.round(overallScore),
      scoreBreakdown: {
        academic: {
          strongSubjectsCount: profileData.academic?.strongSubjects ? JSON.parse(profileData.academic.strongSubjects).length : 0,
          weakSubjectsCount: profileData.academic?.weakSubjects ? JSON.parse(profileData.academic.weakSubjects).length : 0,
          strongSkillsCount: profileData.academic?.strongSkills ? JSON.parse(profileData.academic.strongSkills).length : 0,
          motivationLevel: profileData.academic?.overallMotivation || 0,
          homeworkCompletionRate: profileData.academic?.homeworkCompletionRate || 0,
          score: Math.round(academicScore)
        },
        socialEmotional: {
          avgSELCompetency: profileData.socialEmotional ? (
            ((profileData.socialEmotional.empathyLevel || 0) +
            (profileData.socialEmotional.selfAwarenessLevel || 0) +
            (profileData.socialEmotional.emotionRegulationLevel || 0) +
            (profileData.socialEmotional.conflictResolutionLevel || 0) +
            (profileData.socialEmotional.leadershipLevel || 0) +
            (profileData.socialEmotional.teamworkLevel || 0) +
            (profileData.socialEmotional.communicationLevel || 0)) / 7
          ) : 0,
          strongSkillsCount: profileData.socialEmotional?.strongSocialSkills ? JSON.parse(profileData.socialEmotional.strongSocialSkills).length : 0,
          developingSkillsCount: profileData.socialEmotional?.developingSocialSkills ? JSON.parse(profileData.socialEmotional.developingSocialSkills).length : 0,
          socialContextScore: profileData.socialEmotional ? this.calculateSocialContextScore(profileData.socialEmotional) : 0,
          score: Math.round(socialEmotionalScore)
        },
        talentsInterests: {
          creativeTalentsCount: profileData.talentsInterests?.creativeTalents ? JSON.parse(profileData.talentsInterests.creativeTalents).length : 0,
          physicalTalentsCount: profileData.talentsInterests?.physicalTalents ? JSON.parse(profileData.talentsInterests.physicalTalents).length : 0,
          interestsCount: profileData.talentsInterests?.primaryInterests ? JSON.parse(profileData.talentsInterests.primaryInterests).length : 0,
          engagementHours: profileData.talentsInterests?.weeklyEngagementHours || 0,
          score: Math.round(talentsInterestsScore)
        },
        health: {
          chronicDiseasesCount: profileData.health?.chronicDiseases ? JSON.parse(profileData.health.chronicDiseases).length : 0,
          allergiesCount: profileData.health?.allergies ? JSON.parse(profileData.health.allergies).length : 0,
          medicationsCount: profileData.health?.currentMedications ? JSON.parse(profileData.health.currentMedications).length : 0,
          healthStatusScore: Math.round(healthWellnessScore),
          score: Math.round(healthWellnessScore)
        },
        behavior: {
          incidentCount: profileData.behaviorIncidents?.length || 0,
          avgSeverity: 0,
          avgFrequency: 0,
          interventionEffectiveness: 0,
          score: Math.round(behaviorScore)
        },
        motivation: {
          goalClarity: profileData.motivation?.goalClarityLevel || 0,
          intrinsicMotivation: profileData.motivation?.intrinsicMotivationLevel || 0,
          persistence: profileData.motivation?.persistenceLevel || 0,
          futureOrientation: profileData.motivation?.futureOrientationLevel || 0,
          score: Math.round(motivationScore)
        },
        risk: {
          overallRiskLevel: profileData.riskProtective?.overallRiskLevel || 0,
          riskFactorsCount: profileData.riskProtective?.identifiedRiskFactors ? JSON.parse(profileData.riskProtective.identifiedRiskFactors).length : 0,
          avgRiskAcrossDomains: profileData.riskProtective ? (
            ((profileData.riskProtective.academicRiskLevel || 0) +
            (profileData.riskProtective.behavioralRiskLevel || 0) +
            (profileData.riskProtective.emotionalRiskLevel || 0) +
            (profileData.riskProtective.socialRiskLevel || 0)) / 4
          ) : 0,
          score: Math.round(riskScore)
        },
        protective: {
          protectiveFactorsCount: profileData.riskProtective?.protectiveFactors ? JSON.parse(profileData.riskProtective.protectiveFactors).length : 0,
          avgProtectiveFactors: profileData.riskProtective ? (
            ((profileData.riskProtective.familySupport || 0) +
            (profileData.riskProtective.peerSupport || 0) +
            (profileData.riskProtective.schoolEngagement || 0) +
            (profileData.riskProtective.resilienceLevel || 0) +
            (profileData.riskProtective.copingSkills || 0)) / 5
          ) : 0,
          resilienceLevel: profileData.riskProtective?.resilienceLevel || 0,
          score: Math.round(protectiveScore)
        }
      },
      lastCalculated: new Date().toISOString()
    };
  }
}
