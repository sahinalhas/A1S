export interface Student {
  id: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  class?: string;
  studentNumber?: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
  avatar?: string;
  parentContact?: string;
  notes?: string;
  gender?: 'K' | 'E';
  risk?: 'Düşük' | 'Orta' | 'Yüksek';
  schoolId?: string;
}

export interface ExamSummary {
  examId?: string;
  examName?: string;
  score?: number;
  date?: string;
}

export interface AcademicRecord {
  id?: number;
  studentId: string;
  semester: string;
  gpa?: number;
  year: number;
  exams?: ExamSummary[];
  notes?: string;
}

export interface Progress {
  id: string;
  studentId: string;
  topicId: string;
  completed: number;
  remaining: number;
  lastStudied?: string;
  notes?: string;
}
