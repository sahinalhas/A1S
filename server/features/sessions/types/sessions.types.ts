export interface StudySession {
  id: string;
  studentId: string;
  topicId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  efficiency?: number;
}
