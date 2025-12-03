export interface School {
  id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  principal?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSchool {
  userId: string;
  schoolId: string;
  role: 'owner' | 'admin' | 'counselor';
}
