export interface StudyAssignment {
  id: string;
  studentId: string;
  topicId: string;
  dueDate: string;
  status: string;
  notes?: string | null;
}

export interface WeeklySlot {
  id: string;
  studentId: string;
  day: number;
  startTime: string;
  endTime: string;
  subjectId: string;
}

export interface WeeklySlotResponse {
  id: string;
  studentId: string;
  day: number;
  start: string;
  end: string;
  subjectId: string;
}

export interface PlannedTopic {
  id: string;
  studentId: string;
  weekStartDate: string;
  date: string;
  start: string;
  end: string;
  subjectId: string;
  topicId: string;
  allocated: number;
  remainingAfter: number;
}
