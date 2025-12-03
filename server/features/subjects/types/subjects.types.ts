export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  color?: string;
  category?: "School" | "LGS" | "YKS" | "TYT" | "AYT" | "YDT";
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedHours?: number;
  avgMinutes?: number;
  order?: number;
  energyLevel?: 'low' | 'medium' | 'high';
  difficultyScore?: number;
  priority?: number;
  deadline?: string;
}
