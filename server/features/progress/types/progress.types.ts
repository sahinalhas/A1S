export interface Progress {
  id: string;
  studentId: string;
  topicId: string;
  completed: number;
  remaining: number;
  lastStudied?: string;
  notes?: string;
  completedFlag?: boolean;
  reviewCount?: number;
  nextReviewDate?: string;
  questionsSolved?: number;
  questionsCorrect?: number;
  questionsWrong?: number;
}

export interface AcademicGoal {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  targetScore?: number;
  currentScore?: number;
  examType?: string;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
}
