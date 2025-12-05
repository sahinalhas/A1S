export interface ExamResult {
  id: string;
  studentId: string;
  examType: string;
  examName: string;
  examDate: string;
  examProvider?: string;
  totalScore?: number;
  percentileRank?: number;
  turkishScore?: number;
  mathScore?: number;
  scienceScore?: number;
  socialScore?: number;
  foreignLanguageScore?: number;
  turkishNet?: number;
  mathNet?: number;
  scienceNet?: number;
  socialNet?: number;
  foreignLanguageNet?: number;
  totalNet?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  emptyAnswers?: number;
  totalQuestions?: number;
  subjectBreakdown?: Record<string, unknown>;
  topicAnalysis?: Record<string, unknown>;
  strengthAreas?: string[];
  weaknessAreas?: string[];
  improvementSuggestions?: string;
  comparedToGoal?: number;
  comparedToPrevious?: number;
  comparedToClassAverage?: number;
  schoolRank?: number;
  classRank?: number;
  isOfficial?: boolean;
  certificateUrl?: string;
  answerKeyUrl?: string;
  detailedReportUrl?: string;
  goalsMet?: boolean;
  parentNotified?: boolean;
  counselorNotes?: string;
  actionPlan?: string;
  notes?: string;
}

export interface ExamProgressData {
  examDate: string;
  examName: string;
  totalScore?: number;
  totalNet?: number;
  percentileRank?: number;
}
