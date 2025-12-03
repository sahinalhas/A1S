import type Database from 'better-sqlite3';

function safeExec(db: Database.Database, sql: string): void {
  try {
    db.exec(sql);
  } catch (error) {
    // Silently skip index creation if column doesn't exist
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('no such column')) {
      console.warn(`[Database] Index creation warning: ${errorMessage}`);
    }
  }
}

export function setupDatabaseIndexes(db: Database.Database): void {
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_students_class ON students(class)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_students_gender ON students(gender)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_students_class_gender ON students(class, gender)');
  
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_meeting_notes_studentId ON meeting_notes(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_attendance_studentId ON attendance(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_academic_records_studentId ON academic_records(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_interventions_studentId ON interventions(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_student_documents_studentId ON student_documents(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_progress_studentId ON progress(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_academic_goals_studentId ON academic_goals(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_study_sessions_studentId ON study_sessions(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_notes_studentId ON notes(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_multiple_intelligence_studentId ON multiple_intelligence(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_learning_styles_studentId ON learning_styles(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_smart_goals_studentId ON smart_goals(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_coaching_recommendations_studentId ON coaching_recommendations(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_evaluations_360_studentId ON evaluations_360(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_achievements_studentId ON achievements(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_self_assessments_studentId ON self_assessments(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_parent_meetings_studentId ON parent_meetings(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_home_visits_studentId ON home_visits(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_family_participation_studentId ON family_participation(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_study_assignments_studentId ON study_assignments(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_weekly_slots_studentId ON weekly_slots(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_surveys_studentId ON surveys(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_survey_responses_studentId ON survey_responses(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_special_education_studentId ON special_education(studentId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_exam_results_studentId ON exam_results(studentId)');
  
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_counseling_sessions_counselorId ON counseling_sessions(counselorId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_counseling_sessions_sessionDate ON counseling_sessions(sessionDate)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_counseling_sessions_completed ON counseling_sessions(completed)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_counseling_sessions_sessionType ON counseling_sessions(sessionType)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_counseling_session_students_sessionId ON counseling_session_students(sessionId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_counseling_session_students_studentId ON counseling_session_students(studentId)');
  
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_survey_questions_templateId ON survey_questions(templateId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_survey_distributions_templateId ON survey_distributions(templateId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_survey_responses_distributionId ON survey_responses(distributionId)');
  
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_topics_subjectId ON topics(subjectId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_progress_topicId ON progress(topicId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_study_sessions_topicId ON study_sessions(topicId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_study_assignments_topicId ON study_assignments(topicId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_weekly_slots_subjectId ON weekly_slots(subjectId)');
  
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_meeting_notes_date ON meeting_notes(date)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_interventions_date ON interventions(date)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_exam_results_examDate ON exam_results(examDate)');
  
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_progress_student_topic ON progress(studentId, topicId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(studentId, date)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_exam_results_student_date ON exam_results(studentId, examDate)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_exam_results_type ON exam_results(examType)');
  
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_meeting_notes_student_date ON meeting_notes(studentId, date)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_interventions_student_date ON interventions(studentId, date)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_parent_meetings_student_date ON parent_meetings(studentId, meetingDate)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_home_visits_student_date ON home_visits(studentId, date)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_study_assignments_student_due ON study_assignments(studentId, dueDate)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_study_sessions_student_date ON study_sessions(studentId, startTime)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_coaching_recommendations_student_date ON coaching_recommendations(studentId, created_at)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_family_participation_student_date ON family_participation(studentId, eventDate)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_self_assessments_student_date ON self_assessments(studentId, assessmentDate)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_evaluations_360_student_date ON evaluations_360(studentId, evaluationDate)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_multiple_intelligence_student_date ON multiple_intelligence(studentId, assessmentDate)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_learning_styles_student_date ON learning_styles(studentId, assessmentDate)');
  
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_parent_meetings_date ON parent_meetings(meetingDate)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_home_visits_date ON home_visits(date)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_academic_goals_deadline ON academic_goals(deadline)');
  
  // School-based isolation indexes for multi-school performance
  // Note: These may fail if schoolId column doesn't exist in older schemas
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_students_schoolId ON students(schoolId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_students_school_class ON students(schoolId, class)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_counseling_sessions_schoolId ON counseling_sessions(schoolId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_exam_sessions_school_id ON exam_sessions(school_id)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_survey_templates_schoolId ON survey_templates(schoolId)');
  safeExec(db, 'CREATE INDEX IF NOT EXISTS idx_survey_distributions_schoolId ON survey_distributions(schoolId)');
  // Note: notification_logs and guidance_categories/guidance_items tables
  // do not have schoolId columns, so no school-based indexes are needed for them
}
