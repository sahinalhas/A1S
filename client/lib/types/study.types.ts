export type StudySubject = {
 id: string;
 name: string;
 code?: string;
 description?: string;
 color?: string;
 category?:"School" |"LGS" |"YKS" |"TYT" |"AYT" |"YDT";
};

export type StudyTopic = {
 id: string;
 subjectId: string;
 name: string;
 avgMinutes: number;
 order?: number;
 difficultyScore?: number;
 priority?: number;
 deadline?: string;
 prerequisites?: string[];
 energyLevel?: 'high' | 'medium' | 'low';
};

export type StudyAssignment = {
 id: string;
 studentId: string;
 topicId: string;
 dueDate: string;
 status: string;
 notes?: string | null;
 targetPerWeek?: number;
};

export type StudySession = {
 id: string;
 studentId: string;
 topicId: string;
 date: string;
 minutes: number;
};

export type WeeklySlot = {
 id: string;
 studentId: string;
 day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
 start: string;
 end: string;
 subjectId: string;
 energyType?: 'high' | 'medium' | 'low';
};

export type TopicProgress = {
 id: string;
 studentId: string;
 topicId: string;
 completed: number;
 remaining: number;
 completedFlag?: boolean;
 lastStudied?: string;
 reviewCount?: number;
 nextReviewDate?: string;
 questionsSolved?: number;
 questionsCorrect?: number;
 questionsWrong?: number;
};

export type ScheduleTemplate = {
 id: string;
 name: string;
 description: string;
 category: 'LGS' | 'TYT' | 'AYT' | 'YDT' | 'YKS' | 'Özel';
 slots: Omit<WeeklySlot, 'id' | 'studentId'>[];
 subjects: {
 id: string;
 name: string;
 category: string;
 }[];
 estimatedWeeklyHours: number;
 difficulty: 'Kolay' | 'Orta' | 'Yoğun' | 'Çok Yoğun';
 tags: string[];
};

export type PlannedEntry = {
 date: string;
 start: string;
 end: string;
 subjectId: string;
 topicId: string;
 allocated: number;
 remainingAfter: number;
};
