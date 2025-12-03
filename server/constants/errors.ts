// Server error message constants for better maintainability
export const ERROR_MESSAGES = {
  // Database operations
  FAILED_TO_FETCH_STUDENTS: 'Failed to fetch students',
  FAILED_TO_SAVE_STUDENTS: 'Failed to save students',
  FAILED_TO_FETCH_SUBJECTS: 'Failed to fetch subjects',
  FAILED_TO_SAVE_SUBJECTS: 'Failed to save subjects',
  FAILED_TO_FETCH_TOPICS: 'Failed to fetch topics',
  FAILED_TO_SAVE_TOPICS: 'Failed to save topics',
  FAILED_TO_FETCH_PROGRESS: 'Failed to fetch progress',
  FAILED_TO_SAVE_PROGRESS: 'Failed to save progress',
  FAILED_TO_FETCH_ACADEMIC_GOALS: 'Failed to fetch academic goals',
  FAILED_TO_SAVE_ACADEMIC_GOALS: 'Failed to save academic goals',
  FAILED_TO_CHECK_MIGRATION_STATUS: 'Failed to check migration status',
  MIGRATION_FAILED: 'Migration failed',
  FAILED_TO_SAVE_STUDENT: 'Failed to save student',
  FAILED_TO_FETCH_ACADEMICS: 'Failed to fetch academics',
  FAILED_TO_FETCH_STUDENT_PROGRESS: 'Failed to fetch progress',

  // Validation errors
  EXPECTED_ARRAY_OF_STUDENTS: 'Expected an array of students',
  EXPECTED_ARRAY_OF_SUBJECTS: 'Expected an array of subjects',
  EXPECTED_ARRAY_OF_TOPICS: 'Expected an array of topics',
  EXPECTED_ARRAY_OF_PROGRESS: 'Expected an array of progress',
  EXPECTED_ARRAY_OF_ACADEMIC_GOALS: 'Expected an array of academic goals',

  // Database initialization
  ERROR_INITIALIZING_DATABASE: 'Error initializing database statements',
  ERROR_LOADING_STUDENTS: 'Error loading students',
  ERROR_SAVING_STUDENT: 'Error saving student',
  ERROR_LOADING_ACADEMIC_RECORDS: 'Error loading academic records',
  ERROR_LOADING_SUBJECTS: 'Error loading subjects',
  ERROR_LOADING_TOPICS: 'Error loading topics',
  ERROR_LOADING_PROGRESS: 'Error loading progress',
} as const;

export const SUCCESS_MESSAGES = {
  STUDENT_SAVED: 'Student saved successfully',
  STUDENTS_SAVED: 'students saved successfully',
  SUBJECTS_SAVED: 'subjects saved successfully', 
  TOPICS_SAVED: 'topics saved successfully',
  PROGRESS_SAVED: 'progress records saved successfully',
  ACADEMIC_GOALS_SAVED: 'academic goals saved successfully',
  MIGRATION_COMPLETED: 'Migration completed successfully',
} as const;