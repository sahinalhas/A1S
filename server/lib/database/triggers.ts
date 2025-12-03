import type Database from 'better-sqlite3';

export function setupDatabaseTriggers(db: Database.Database): void {
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_students_timestamp 
    AFTER UPDATE ON students 
    BEGIN 
      UPDATE students SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_progress_timestamp 
    AFTER UPDATE ON progress 
    BEGIN 
      UPDATE progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_academic_goals_timestamp 
    AFTER UPDATE ON academic_goals 
    BEGIN 
      UPDATE academic_goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_notes_timestamp 
    AFTER UPDATE ON notes 
    BEGIN 
      UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_surveys_timestamp 
    AFTER UPDATE ON surveys 
    BEGIN 
      UPDATE surveys SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_meeting_notes_timestamp 
    AFTER UPDATE ON meeting_notes 
    BEGIN 
      UPDATE meeting_notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_app_settings_timestamp 
    AFTER UPDATE ON app_settings 
    BEGIN 
      UPDATE app_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_user_sessions_timestamp 
    AFTER UPDATE ON user_sessions 
    BEGIN 
      UPDATE user_sessions SET updated_at = CURRENT_TIMESTAMP WHERE userId = NEW.userId; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_smart_goals_timestamp 
    AFTER UPDATE ON smart_goals 
    BEGIN 
      UPDATE smart_goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_coaching_recommendations_timestamp 
    AFTER UPDATE ON coaching_recommendations 
    BEGIN 
      UPDATE coaching_recommendations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_parent_meetings_timestamp 
    AFTER UPDATE ON parent_meetings 
    BEGIN 
      UPDATE parent_meetings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_home_visits_timestamp 
    AFTER UPDATE ON home_visits 
    BEGIN 
      UPDATE home_visits SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_family_participation_timestamp 
    AFTER UPDATE ON family_participation 
    BEGIN 
      UPDATE family_participation SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_special_education_timestamp 
    AFTER UPDATE ON special_education 
    BEGIN 
      UPDATE special_education SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_exam_results_timestamp 
    AFTER UPDATE ON exam_results 
    BEGIN 
      UPDATE exam_results SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_counseling_sessions_timestamp 
    AFTER UPDATE ON counseling_sessions 
    BEGIN 
      UPDATE counseling_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  // Holistic Profile Triggers
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_student_future_vision_timestamp 
    AFTER UPDATE ON student_future_vision 
    BEGIN 
      UPDATE student_future_vision SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_student_strengths_timestamp 
    AFTER UPDATE ON student_strengths 
    BEGIN 
      UPDATE student_strengths SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_student_interests_timestamp 
    AFTER UPDATE ON student_interests 
    BEGIN 
      UPDATE student_interests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_student_sel_competencies_timestamp 
    AFTER UPDATE ON student_sel_competencies 
    BEGIN 
      UPDATE student_sel_competencies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_student_socioeconomic_timestamp 
    AFTER UPDATE ON student_socioeconomic 
    BEGIN 
      UPDATE student_socioeconomic SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  // Career Guidance Triggers
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_career_profiles_timestamp 
    AFTER UPDATE ON career_profiles 
    BEGIN 
      UPDATE career_profiles SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_student_career_targets_timestamp 
    AFTER UPDATE ON student_career_targets 
    BEGIN 
      UPDATE student_career_targets SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_career_roadmaps_timestamp 
    AFTER UPDATE ON career_roadmaps 
    BEGIN 
      UPDATE career_roadmaps SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_student_competencies_timestamp 
    AFTER UPDATE ON student_competencies 
    BEGIN 
      UPDATE student_competencies SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);
}
