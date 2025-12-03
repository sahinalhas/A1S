export type AcademicGoal = {
 id: string;
 studentId: string;
 examType:"YKS" |"LGS" |"TYT" |"AYT" |"YDT" |"OKUL";
 targetScore?: number;
 currentScore?: number;
 targetRank?: number;
 currentRank?: number;
 targetUniversity?: string;
 targetDepartment?: string;
 deadline: string;
 notes?: string;
 createdAt: string;
};

export type MultipleIntelligence = {
 id: string;
 studentId: string;
 linguistic: number;
 logicalMathematical: number;
 spatial: number;
 musicalRhythmic: number;
 bodilyKinesthetic: number;
 interpersonal: number;
 intrapersonal: number;
 naturalistic: number;
 existential: number;
 assessmentDate: string;
 notes?: string;
};

export type LearningStyle = {
 id: string;
 studentId: string;
 visual: number;
 auditory: number;
 kinesthetic: number;
 readingWriting: number;
 preferredStudyTime:"sabah" |"öğlen" |"akşam" |"gece";
 studyEnvironment:"sessiz" |"hafifMüzik" |"grupla" |"yalnız";
 assessmentDate: string;
 notes?: string;
};

export type SmartGoal = {
 id: string;
 studentId: string;
 title: string;
 description: string;
 specific: string;
 measurable: string;
 achievable: string;
 relevant: string;
 timeBound: string;
 priority:"Düşük" |"Orta" |"Yüksek" |"Kritik";
 status:"Planlandı" |"Başladı" |"Devam" |"Tamamlandı" |"Ertelendi";
 progress: number;
 startDate: string;
 targetDate: string;
 completedDate?: string;
 milestones?: { title: string; completed: boolean; date?: string }[];
 notes?: string;
 createdAt: string;
};

export type CoachingRecommendation = {
 id: string;
 studentId: string;
 type:"AKADEMIK" |"KISISEL" |"SOSYAL" |"MOTIVASYON" |"ÇALIŞMA_TEKNİĞİ";
 title: string;
 description: string;
 priority:"Düşük" |"Orta" |"Yüksek";
 automated: boolean;
 implementationSteps?: string[];
 resources?: { title: string; url?: string; type:"video" |"makale" |"kitap" |"uygulama" }[];
 targetCompletionDate?: string;
 status:"Öneri" |"Kabul" |"Uygulama" |"Tamamlandı" |"İptal";
 createdAt: string;
 implementedAt?: string;
 completedAt?: string;
 feedback?: string;
};

export type Evaluation360 = {
 id: string;
 studentId: string;
 evaluatorType:"ÖĞRENCI" |"VELI" |"ÖĞRETMEN" |"AKRAN";
 evaluatorName?: string;
 academicPerformance: number;
 socialSkills: number;
 communication: number;
 leadership: number;
 teamwork: number;
 selfConfidence: number;
 motivation: number;
 timeManagement: number;
 problemSolving: number;
 creativity: number;
 overallRating: number;
 strengths?: string[];
 improvementAreas?: string[];
 comments?: string;
 evaluationDate: string;
};

export type Achievement = {
 id: string;
 studentId: string;
 type:"ROZETLeR" |"İLERLEME" |"MILESTONE" |"ÖZEL";
 title: string;
 description: string;
 icon: string;
 color: string;
 points?: number;
 earnedAt: string;
 category:"AKADEMİK" |"SOSYAL" |"KİŞİSEL" |"ÇALIŞMA" |"HEDEFLeR";
 criteria?: string;
};

export type SelfAssessment = {
 id: string;
 studentId: string;
 moodRating: number;
 motivationLevel: number;
 stressLevel: number;
 confidenceLevel: number;
 studyDifficulty: number;
 socialInteraction: number;
 sleepQuality: number;
 physicalActivity: number;
 dailyGoalsAchieved: number;
 todayHighlight?: string;
 todayChallenge?: string;
 tomorrowGoal?: string;
 notes?: string;
 assessmentDate: string;
};
