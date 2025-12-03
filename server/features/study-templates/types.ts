export type TemplateCustomization = {
  dailyRepetition?: {
    enabled: boolean;
    durationMinutes?: number;
    weekdaysOnly?: boolean;
  };
  weeklyRepetition?: {
    enabled: boolean;
    durationMinutes?: number;
    day?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  };
  bookReading?: {
    enabled: boolean;
    daysPerWeek?: number;
    durationMinutes?: number;
  };
  questionSolving?: {
    enabled: boolean;
    askTeacher?: boolean;
  };
  mockExam?: {
    enabled: boolean;
    durationMinutes?: number;
    day?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  };
};
