import type Database from 'better-sqlite3';

/**
 * Exam Management Schema
 * Sınav sistemi için veritabanı tabloları
 */
export function createExamManagementTables(db: Database.Database): void {
  // Sınav Türleri (TYT, AYT, LGS, YDT)
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      penalty_divisor INTEGER DEFAULT 4,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Sınav Dersleri (Her sınav türü için)
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_subjects (
      id TEXT PRIMARY KEY,
      exam_type_id TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      question_count INTEGER NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exam_type_id) REFERENCES exam_types (id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_exam_subjects_type ON exam_subjects(exam_type_id);
    CREATE INDEX IF NOT EXISTS idx_exam_subjects_order ON exam_subjects(exam_type_id, order_index);
  `);

  // Deneme Sınavları (1. Deneme, 2. Deneme vb.)
  // Not: Yeni tablolar için school_id dahil
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_sessions (
      id TEXT PRIMARY KEY,
      exam_type_id TEXT NOT NULL,
      name TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      description TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exam_type_id) REFERENCES exam_types (id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_exam_sessions_type ON exam_sessions(exam_type_id);
    CREATE INDEX IF NOT EXISTS idx_exam_sessions_date ON exam_sessions(exam_date);
  `);

  // Migration: Add school_id column to exam_sessions if it doesn't exist
  try {
    const columnCheck = db.prepare(`PRAGMA table_info(exam_sessions)`).all() as Array<{ name: string }>;
    const hasSchoolId = columnCheck.some(col => col.name === 'school_id');
    
    if (!hasSchoolId) {
      db.exec(`ALTER TABLE exam_sessions ADD COLUMN school_id TEXT DEFAULT 'school-default-001';`);
      console.log('✅ Added school_id column to exam_sessions');
    }
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) {
      console.warn('Warning adding school_id column to exam_sessions:', err.message);
    }
  }

  // Update existing exam sessions with default school_id
  try {
    db.exec(`UPDATE exam_sessions SET school_id = 'school-default-001' WHERE school_id IS NULL OR school_id = '';`);
  } catch (err: any) {
    console.warn('Warning updating exam_sessions school_id:', err.message);
  }

  // Create index for school_id (after column exists)
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_exam_sessions_school ON exam_sessions(school_id);`);
  } catch (err: any) {
    if (!err.message?.includes('already exists')) {
      console.warn('Warning creating exam_sessions school_id index:', err.message);
    }
  }

  // Sınav Sonuçları (Öğrenci bazında, ders bazında D/Y/B)
  // Not: 'exam_session_results' adını kullanıyoruz çünkü 'exam_results' zaten academic.schema.ts'de var
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_session_results (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      correct_count INTEGER DEFAULT 0,
      wrong_count INTEGER DEFAULT 0,
      empty_count INTEGER DEFAULT 0,
      net_score REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES exam_sessions (id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES exam_subjects (id) ON DELETE CASCADE,
      UNIQUE(session_id, student_id, subject_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_exam_session_results_session ON exam_session_results(session_id);
    CREATE INDEX IF NOT EXISTS idx_exam_session_results_student ON exam_session_results(student_id);
    CREATE INDEX IF NOT EXISTS idx_exam_session_results_subject ON exam_session_results(subject_id);
  `);

  // Okul Sınavları (Dönem sonu, yazılılar vb.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS school_exam_results (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      exam_type TEXT NOT NULL,
      score REAL NOT NULL,
      max_score REAL NOT NULL DEFAULT 100,
      exam_date TEXT NOT NULL,
      semester TEXT,
      year INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_school_exam_results_student ON school_exam_results(student_id);
    CREATE INDEX IF NOT EXISTS idx_school_exam_results_date ON school_exam_results(exam_date);
    CREATE INDEX IF NOT EXISTS idx_school_exam_results_semester ON school_exam_results(semester, year);
  `);
}

/**
 * Seed data for exam types and subjects
 * Sınav türleri ve dersler için başlangıç verisi
 */
export function seedExamData(db: Database.Database): void {
  const checkData = db.prepare('SELECT COUNT(*) as count FROM exam_types').get() as { count: number };
  
  // Eğer veri varsa seed etme
  if (checkData.count > 0) {
    return;
  }

  // TYT (Temel Yeterlilik Testi)
  db.prepare(`
    INSERT INTO exam_types (id, name, description, penalty_divisor, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).run('tyt', 'TYT', 'Temel Yeterlilik Testi', 4, 1);

  const tytSubjects = [
    { id: 'tyt_turk', name: 'Türkçe', count: 40, order: 1 },
    { id: 'tyt_mat', name: 'Matematik', count: 40, order: 2 },
    { id: 'tyt_sos', name: 'Sosyal Bilimler', count: 20, order: 3 },
    { id: 'tyt_fen', name: 'Fen Bilimleri', count: 20, order: 4 }
  ];

  for (const subject of tytSubjects) {
    db.prepare(`
      INSERT INTO exam_subjects (id, exam_type_id, subject_name, question_count, order_index)
      VALUES (?, ?, ?, ?, ?)
    `).run(subject.id, 'tyt', subject.name, subject.count, subject.order);
  }

  // AYT (Alan Yeterlilik Testi)
  db.prepare(`
    INSERT INTO exam_types (id, name, description, penalty_divisor, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).run('ayt', 'AYT', 'Alan Yeterlilik Testi', 4, 1);

  const aytSubjects = [
    { id: 'ayt_mat', name: 'Matematik', count: 40, order: 1 },
    { id: 'ayt_fiz', name: 'Fizik', count: 14, order: 2 },
    { id: 'ayt_kim', name: 'Kimya', count: 13, order: 3 },
    { id: 'ayt_bio', name: 'Biyoloji', count: 13, order: 4 },
    { id: 'ayt_edb', name: 'Edebiyat', count: 24, order: 5 },
    { id: 'ayt_tar1', name: 'Tarih-1', count: 10, order: 6 },
    { id: 'ayt_cog', name: 'Coğrafya-1', count: 6, order: 7 },
    { id: 'ayt_tar2', name: 'Tarih-2', count: 11, order: 8 },
    { id: 'ayt_cog2', name: 'Coğrafya-2', count: 11, order: 9 },
    { id: 'ayt_fel', name: 'Felsefe', count: 12, order: 10 },
    { id: 'ayt_din', name: 'Din Kültürü', count: 6, order: 11 }
  ];

  for (const subject of aytSubjects) {
    db.prepare(`
      INSERT INTO exam_subjects (id, exam_type_id, subject_name, question_count, order_index)
      VALUES (?, ?, ?, ?, ?)
    `).run(subject.id, 'ayt', subject.name, subject.count, subject.order);
  }

  // LGS (Liselere Geçiş Sınavı)
  db.prepare(`
    INSERT INTO exam_types (id, name, description, penalty_divisor, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).run('lgs', 'LGS', 'Liselere Geçiş Sınavı', 3, 1);

  const lgsSubjects = [
    { id: 'lgs_turk', name: 'Türkçe', count: 20, order: 1 },
    { id: 'lgs_ink', name: 'T.C. İnkılap Tarihi ve Atatürkçülük', count: 10, order: 2 },
    { id: 'lgs_din', name: 'Din Kültürü ve Ahlak Bilgisi', count: 10, order: 3 },
    { id: 'lgs_ing', name: 'Yabancı Dil (İngilizce)', count: 10, order: 4 },
    { id: 'lgs_mat', name: 'Matematik', count: 20, order: 5 },
    { id: 'lgs_fen', name: 'Fen Bilimleri', count: 20, order: 6 }
  ];

  for (const subject of lgsSubjects) {
    db.prepare(`
      INSERT INTO exam_subjects (id, exam_type_id, subject_name, question_count, order_index)
      VALUES (?, ?, ?, ?, ?)
    `).run(subject.id, 'lgs', subject.name, subject.count, subject.order);
  }

  // YDT (Yabancı Dil Testi)
  db.prepare(`
    INSERT INTO exam_types (id, name, description, penalty_divisor, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).run('ydt', 'YDT', 'Yabancı Dil Testi', 4, 1);

  const ydtSubjects = [
    { id: 'ydt_ing', name: 'İngilizce', count: 80, order: 1 }
  ];

  for (const subject of ydtSubjects) {
    db.prepare(`
      INSERT INTO exam_subjects (id, exam_type_id, subject_name, question_count, order_index)
      VALUES (?, ?, ?, ?, ?)
    `).run(subject.id, 'ydt', subject.name, subject.count, subject.order);
  }

  console.log('✅ Exam types and subjects seeded successfully');
}

/**
 * Extended Exam Management Tables for Advanced Features
 * Gelişmiş özellikler için ek tablolar
 */
export function createAdvancedExamTables(db: Database.Database): void {
  // Öğrenci Hedefleri (Student Exam Goals)
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_exam_goals (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      exam_type_id TEXT NOT NULL,
      subject_id TEXT,
      target_net REAL NOT NULL,
      current_net REAL DEFAULT 0,
      deadline TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'cancelled')),
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (exam_type_id) REFERENCES exam_types (id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES exam_subjects (id) ON DELETE SET NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_exam_goals_student ON student_exam_goals(student_id);
    CREATE INDEX IF NOT EXISTS idx_exam_goals_status ON student_exam_goals(status);
  `);

  // Soru Analizi (Question Level Analysis)
  db.exec(`
    CREATE TABLE IF NOT EXISTS question_analysis (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      question_number INTEGER NOT NULL,
      correct_count INTEGER DEFAULT 0,
      wrong_count INTEGER DEFAULT 0,
      empty_count INTEGER DEFAULT 0,
      difficulty_score REAL DEFAULT 0,
      discrimination_index REAL DEFAULT 0,
      avg_response_time INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES exam_sessions (id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES exam_subjects (id) ON DELETE CASCADE,
      UNIQUE(session_id, subject_id, question_number)
    );
    
    CREATE INDEX IF NOT EXISTS idx_question_analysis_session ON question_analysis(session_id);
    CREATE INDEX IF NOT EXISTS idx_question_analysis_difficulty ON question_analysis(difficulty_score);
  `);

  // Konu Performans Isı Haritası (Subject Performance Heatmap)
  db.exec(`
    CREATE TABLE IF NOT EXISTS subject_performance_heatmap (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      exam_type_id TEXT NOT NULL,
      performance_score REAL DEFAULT 0,
      trend TEXT DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'declining')),
      last_6_avg REAL DEFAULT 0,
      last_12_avg REAL DEFAULT 0,
      total_sessions INTEGER DEFAULT 0,
      strength_level TEXT DEFAULT 'moderate' CHECK (strength_level IN ('weak', 'moderate', 'strong')),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES exam_subjects (id) ON DELETE CASCADE,
      FOREIGN KEY (exam_type_id) REFERENCES exam_types (id) ON DELETE CASCADE,
      UNIQUE(student_id, subject_id, exam_type_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_heatmap_student ON subject_performance_heatmap(student_id);
    CREATE INDEX IF NOT EXISTS idx_heatmap_strength ON subject_performance_heatmap(strength_level);
  `);

  // Benchmark Verileri (Benchmarking Data)
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_benchmarks (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      total_net REAL DEFAULT 0,
      class_avg REAL DEFAULT 0,
      school_avg REAL DEFAULT 0,
      percentile REAL DEFAULT 0,
      rank INTEGER,
      total_participants INTEGER,
      deviation_from_avg REAL DEFAULT 0,
      performance_category TEXT CHECK (performance_category IN ('excellent', 'good', 'average', 'needs_improvement')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES exam_sessions (id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      UNIQUE(session_id, student_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_benchmarks_session ON exam_benchmarks(session_id);
    CREATE INDEX IF NOT EXISTS idx_benchmarks_student ON exam_benchmarks(student_id);
    CREATE INDEX IF NOT EXISTS idx_benchmarks_percentile ON exam_benchmarks(percentile);
  `);

  // Zaman Analizi (Time Analysis)
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_time_analysis (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      exam_type_id TEXT NOT NULL,
      total_exams INTEGER DEFAULT 0,
      avg_days_between_exams REAL DEFAULT 0,
      study_frequency TEXT CHECK (study_frequency IN ('high', 'medium', 'low')),
      optimal_interval_days INTEGER,
      last_exam_date TEXT,
      performance_time_correlation REAL DEFAULT 0,
      improvement_velocity REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (exam_type_id) REFERENCES exam_types (id) ON DELETE CASCADE,
      UNIQUE(student_id, exam_type_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_time_analysis_student ON exam_time_analysis(student_id);
  `);

  // Tahminsel Analitik (Predictive Analytics)
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_predictions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      exam_type_id TEXT NOT NULL,
      predicted_net REAL DEFAULT 0,
      confidence_level REAL DEFAULT 0,
      prediction_date TEXT NOT NULL,
      target_exam_date TEXT,
      risk_level TEXT CHECK (risk_level IN ('high', 'medium', 'low')),
      success_probability REAL DEFAULT 0,
      improvement_needed REAL DEFAULT 0,
      ai_insights TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (exam_type_id) REFERENCES exam_types (id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_predictions_student ON exam_predictions(student_id);
    CREATE INDEX IF NOT EXISTS idx_predictions_risk ON exam_predictions(risk_level);
  `);

  // Otomatik Uyarılar (Automated Alerts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_alerts (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      alert_type TEXT NOT NULL CHECK (alert_type IN ('performance_drop', 'goal_achieved', 'at_risk', 'improvement_needed', 'milestone')),
      severity TEXT DEFAULT 'medium' CHECK (severity IN ('high', 'medium', 'low')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      action_taken BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_alerts_student ON exam_alerts(student_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_type ON exam_alerts(alert_type);
    CREATE INDEX IF NOT EXISTS idx_alerts_read ON exam_alerts(is_read);
  `);

  // Gelişim Planları (Development Plans)
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_development_plans (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      exam_type_id TEXT NOT NULL,
      weak_subjects TEXT NOT NULL,
      strong_subjects TEXT NOT NULL,
      priority_topics TEXT,
      recommended_study_hours INTEGER DEFAULT 0,
      improvement_suggestions TEXT,
      action_items TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (exam_type_id) REFERENCES exam_types (id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_dev_plans_student ON student_development_plans(student_id);
    CREATE INDEX IF NOT EXISTS idx_dev_plans_status ON student_development_plans(status);
  `);

  console.log('✅ Advanced exam management tables created successfully');
}
