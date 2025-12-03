import getDatabase from '../../../lib/database.js';

export interface SearchResults {
  students: Array<{
    id: number;
    name: string;
    class?: string;
    type: 'student';
  }>;
  counselingSessions: Array<{
    id: number;
    title: string;
    date: string;
    studentNames?: string;
    type: 'counseling';
  }>;
  surveys: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
    type: 'survey';
  }>;
  pages: Array<{
    label: string;
    path: string;
    type: 'page';
  }>;
}

export async function performGlobalSearch(query: string): Promise<SearchResults> {
  const db = getDatabase();
  const lowerQuery = query.toLowerCase();
  
  // Search students
  const students = db.prepare(`
    SELECT id, name || ' ' || surname as name, class
    FROM students
    WHERE LOWER(name) LIKE ? 
       OR LOWER(surname) LIKE ?
       OR LOWER(name || ' ' || surname) LIKE ?
       OR LOWER(class) LIKE ?
       OR CAST(id AS TEXT) LIKE ?
    LIMIT 10
  `).all(`%${lowerQuery}%`, `%${lowerQuery}%`, `%${lowerQuery}%`, `%${lowerQuery}%`, `%${lowerQuery}%`) as any[];
  
  // Search counseling sessions
  const counselingSessions = db.prepare(`
    SELECT 
      cs.id,
      cs.topic as title,
      cs.sessionDate as date,
      GROUP_CONCAT(s.name || ' ' || s.surname, ', ') as studentNames
    FROM counseling_sessions cs
    LEFT JOIN counseling_session_students css ON cs.id = css.sessionId
    LEFT JOIN students s ON css.studentId = s.id
    WHERE LOWER(cs.topic) LIKE ?
       OR LOWER(cs.detailedNotes) LIKE ?
    GROUP BY cs.id
    ORDER BY cs.sessionDate DESC
    LIMIT 10
  `).all(`%${lowerQuery}%`, `%${lowerQuery}%`) as any[];

  // Search surveys
  const surveyTemplates = db.prepare(`
    SELECT id, title, 'template' as status, created_at as createdAt
    FROM survey_templates
    WHERE LOWER(title) LIKE ?
       OR LOWER(description) LIKE ?
    ORDER BY created_at DESC
    LIMIT 5
  `).all(`%${lowerQuery}%`, `%${lowerQuery}%`) as any[];

  const surveyDistributions = db.prepare(`
    SELECT id, title, status, created_at as createdAt
    FROM survey_distributions
    WHERE LOWER(title) LIKE ?
       OR LOWER(description) LIKE ?
    ORDER BY created_at DESC
    LIMIT 5
  `).all(`%${lowerQuery}%`, `%${lowerQuery}%`) as any[];

  const surveys = [...surveyTemplates, ...surveyDistributions];

  // Static pages
  const allPages = [
    { label: "Ana Sayfa", path: "/" },
    { label: "Öğrenciler", path: "/ogrenci" },
    { label: "Görüşmeler", path: "/gorusmeler" },
    { label: "Anket ve Envanterler", path: "/anketler" },
    { label: "Raporlama", path: "/raporlar" },
    { label: "Risk Takip", path: "/risk" },
    { label: "AI Asistan", path: "/ai-asistan" },
    { label: "Günlük AI Raporları", path: "/ai-insights" },
    { label: "Derinlemesine Analiz", path: "/gelismis-analiz" },
    { label: "Günlük Plan", path: "/gunluk-plan" },
    { label: "Ayarlar", path: "/ayarlar" },
  ];

  const pages = allPages.filter(page => 
    page.label.toLowerCase().includes(lowerQuery)
  );

  return {
    students: students.map(s => ({ ...s, type: 'student' as const })),
    counselingSessions: counselingSessions.map(cs => ({ ...cs, type: 'counseling' as const })),
    surveys: surveys.map(s => ({ ...s, type: 'survey' as const })),
    pages: pages.map(p => ({ ...p, type: 'page' as const }))
  };
}

export async function performGlobalSearchBySchool(query: string, schoolId: string): Promise<SearchResults> {
  const db = getDatabase();
  const lowerQuery = query.toLowerCase();
  
  // Search students in school
  const students = db.prepare(`
    SELECT id, name || ' ' || surname as name, class
    FROM students
    WHERE schoolId = ?
      AND (LOWER(name) LIKE ? 
       OR LOWER(surname) LIKE ?
       OR LOWER(name || ' ' || surname) LIKE ?
       OR LOWER(class) LIKE ?
       OR CAST(id AS TEXT) LIKE ?)
    LIMIT 10
  `).all(schoolId, `%${lowerQuery}%`, `%${lowerQuery}%`, `%${lowerQuery}%`, `%${lowerQuery}%`, `%${lowerQuery}%`) as any[];

  // Search counseling sessions in school
  const counselingSessions = db.prepare(`
    SELECT 
      cs.id,
      cs.topic as title,
      cs.sessionDate as date,
      GROUP_CONCAT(s.name || ' ' || s.surname, ', ') as studentNames
    FROM counseling_sessions cs
    LEFT JOIN counseling_session_students css ON cs.id = css.sessionId
    LEFT JOIN students s ON css.studentId = s.id
    WHERE cs.schoolId = ?
      AND (LOWER(cs.topic) LIKE ?
       OR LOWER(cs.detailedNotes) LIKE ?)
    GROUP BY cs.id
    ORDER BY cs.sessionDate DESC
    LIMIT 10
  `).all(schoolId, `%${lowerQuery}%`, `%${lowerQuery}%`) as any[];

  // Search surveys in school (using survey_templates and survey_distributions)
  const surveyTemplates = db.prepare(`
    SELECT id, title, 'template' as status, created_at as createdAt
    FROM survey_templates
    WHERE schoolId = ?
      AND (LOWER(title) LIKE ?
       OR LOWER(description) LIKE ?)
    ORDER BY created_at DESC
    LIMIT 5
  `).all(schoolId, `%${lowerQuery}%`, `%${lowerQuery}%`) as any[];

  const surveyDistributions = db.prepare(`
    SELECT id, title, status, created_at as createdAt
    FROM survey_distributions
    WHERE schoolId = ?
      AND (LOWER(title) LIKE ?
       OR LOWER(description) LIKE ?)
    ORDER BY created_at DESC
    LIMIT 5
  `).all(schoolId, `%${lowerQuery}%`, `%${lowerQuery}%`) as any[];

  const surveys = [...surveyTemplates, ...surveyDistributions];

  // Static pages that match the query
  const allPages = [
    { label: "Ana Sayfa", path: "/" },
    { label: "Öğrenciler", path: "/ogrenci" },
    { label: "Görüşmeler", path: "/gorusmeler" },
    { label: "Anket ve Envanterler", path: "/anketler" },
    { label: "Raporlama", path: "/raporlar" },
    { label: "Risk Takip", path: "/risk" },
    { label: "AI Asistan", path: "/ai-asistan" },
    { label: "Günlük AI Raporları", path: "/ai-insights" },
    { label: "Derinlemesine Analiz", path: "/gelismis-analiz" },
    { label: "Günlük Plan", path: "/gunluk-plan" },
    { label: "Ayarlar", path: "/ayarlar" },
  ];

  const pages = allPages.filter(page => 
    page.label.toLowerCase().includes(lowerQuery)
  );

  return {
    students: students.map(s => ({ ...s, type: 'student' as const })),
    counselingSessions: counselingSessions.map(cs => ({ ...cs, type: 'counseling' as const })),
    surveys: surveys.map(s => ({ ...s, type: 'survey' as const })),
    pages: pages.map(p => ({ ...p, type: 'page' as const }))
  };
}
