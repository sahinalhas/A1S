export interface MeetingNote {
  id: string;
  studentId: string;
  date: string;
  type: 'Bireysel' | 'Grup' | 'Veli';
  note: string;
  plan?: string;
}
