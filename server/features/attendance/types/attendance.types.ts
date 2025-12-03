export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'Devamsız' | 'Geç' | 'Var';
  notes?: string;
  reason?: string;
}
