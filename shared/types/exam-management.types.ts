/**
 * Exam Management Types
 * Sınav sistemi için type tanımları
 */

// ============================================================================
// Exam Type (Sınav Türü)
// ============================================================================

export interface ExamType {
  id: string;
  name: string;
  description?: string;
  penalty_divisor: number;
  is_active: boolean;
  created_at: string;
}

export type ExamTypeId = 'tyt' | 'ayt' | 'lgs' | 'ydt';

// ============================================================================
// Exam Subject (Sınav Dersi)
// ============================================================================

export interface ExamSubject {
  id: string;
  exam_type_id: string;
  subject_name: string;
  question_count: number;
  order_index: number;
  created_at: string;
}

// ============================================================================
// Exam Session (Deneme Sınavı)
// ============================================================================

export interface ExamSession {
  id: string;
  exam_type_id: string;
  name: string;
  exam_date: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExamSessionInput {
  exam_type_id: string;
  name: string;
  exam_date: string;
  description?: string;
  created_by?: string;
}

export interface UpdateExamSessionInput {
  name?: string;
  exam_date?: string;
  description?: string;
}

// ============================================================================
// Exam Result (Sınav Sonucu)
// ============================================================================

export interface ExamResult {
  id: string;
  session_id: string;
  student_id: string;
  subject_id: string;
  correct_count: number;
  wrong_count: number;
  empty_count: number;
  net_score: number;
  created_at: string;
  updated_at: string;
}

export interface ExamResultWithDetails extends ExamResult {
  student_name?: string;
  subject_name?: string;
  session_name?: string;
  exam_type_id?: string;
  exam_date?: string;
  penalty_divisor?: number;
}

export interface CreateExamResultInput {
  session_id: string;
  student_id: string;
  subject_id: string;
  correct_count: number;
  wrong_count: number;
  empty_count: number;
}

export interface UpdateExamResultInput {
  correct_count?: number;
  wrong_count?: number;
  empty_count?: number;
}

// ============================================================================
// Batch Result Entry (Toplu Sonuç Girişi)
// ============================================================================

export interface BatchExamResultInput {
  session_id: string;
  results: StudentExamResults[];
}

export interface StudentExamResults {
  student_id: string;
  subjects: SubjectResults[];
}

export interface SubjectResults {
  subject_id: string;
  correct_count: number;
  wrong_count: number;
  empty_count: number;
}

// ============================================================================
// School Exam Result (Okul Sınav Sonucu)
// ============================================================================

export interface SchoolExamResult {
  id: string;
  student_id: string;
  subject_name: string;
  exam_type: string;
  score: number;
  max_score: number;
  exam_date: string;
  semester?: string;
  year?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolExamResultInput {
  student_id: string;
  subject_name: string;
  exam_type: string;
  score: number;
  max_score?: number;
  exam_date: string;
  semester?: string;
  year?: number;
  notes?: string;
}

export interface UpdateSchoolExamResultInput {
  subject_name?: string;
  exam_type?: string;
  score?: number;
  max_score?: number;
  exam_date?: string;
  semester?: string;
  year?: number;
  notes?: string;
}

// ============================================================================
// Statistics and Analytics
// ============================================================================

export interface ExamStatistics {
  session_id: string;
  session_name: string;
  exam_type_id: string;
  exam_date: string;
  total_students: number;
  subject_stats: SubjectStatistics[];
  overall_stats: {
    avg_total_net: number;
    highest_total_net: number;
    lowest_total_net: number;
  };
}

export interface SubjectStatistics {
  subject_id: string;
  subject_name: string;
  question_count: number;
  avg_correct: number;
  avg_wrong: number;
  avg_empty: number;
  avg_net: number;
  highest_net: number;
  lowest_net: number;
  std_deviation: number;
}

export interface StudentExamStatistics {
  student_id: string;
  student_name: string;
  exam_type_id: string;
  total_exams: number;
  avg_net_score: number;
  best_net_score: number;
  worst_net_score: number;
  improvement_rate: number;
  subject_performance: SubjectPerformance[];
  recent_exams: RecentExamSummary[];
}

export interface SubjectPerformance {
  subject_id: string;
  subject_name: string;
  avg_net: number;
  trend: 'improving' | 'stable' | 'declining';
  strength_level: 'weak' | 'moderate' | 'strong';
}

export interface RecentExamSummary {
  session_id: string;
  session_name: string;
  exam_date: string;
  total_net: number;
  rank?: number;
}

// ============================================================================
// Excel Import/Export
// ============================================================================

export interface ExcelImportResult {
  success: boolean;
  imported_count: number;
  failed_count: number;
  errors: ExcelImportError[];
  results: ExamResult[];
}

export interface ExcelImportError {
  row: number;
  student_id?: string;
  student_name?: string;
  error: string;
}

export interface ExcelTemplateConfig {
  exam_type_id: string;
  session_id?: string;
  include_student_info: boolean;
  schoolId?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ExamManagementApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// Filter and Query Types
// ============================================================================

export interface ExamResultsFilter {
  session_id?: string;
  student_id?: string;
  exam_type_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface SchoolExamResultsFilter {
  student_id?: string;
  subject_name?: string;
  exam_type?: string;
  semester?: string;
  year?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Dashboard Overview Types
// ============================================================================

export interface DashboardOverview {
  summary: DashboardSummary;
  recent_sessions: RecentSessionSummary[];
  student_performance: StudentPerformanceOverview;
  at_risk_students: AtRiskStudent[];
  quick_actions: QuickAction[];
}

export interface DashboardSummary {
  total_sessions: number;
  total_students: number;
  total_results_count: number;
  avg_participation_rate: number;
  avg_overall_success: number;
  sessions_this_month: number;
  sessions_last_month: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RecentSessionSummary {
  session_id: string;
  session_name: string;
  exam_type_id: string;
  exam_type_name: string;
  exam_date: string;
  participants: number;
  avg_net: number;
  completion_rate: number;
  days_ago: number;
}

export interface StudentPerformanceOverview {
  high_performers: number;
  average_performers: number;
  needs_attention: number;
  performance_distribution: PerformanceDistribution[];
}

export interface PerformanceDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface AtRiskStudent {
  student_id: string;
  student_name: string;
  risk_level: 'high' | 'medium' | 'low';
  recent_avg_net: number;
  trend: 'declining' | 'stable' | 'improving';
  weak_subjects: string[];
  last_exam_date: string;
}

export interface QuickAction {
  id: string;
  type: 'create_session' | 'enter_results' | 'view_statistics' | 'export_report';
  title: string;
  description: string;
  icon: string;
  url?: string;
}

// ============================================================================
// Comparison and Trend Analysis Types
// ============================================================================

export interface SessionComparison {
  sessions: SessionComparisonItem[];
  comparison_type: 'overall' | 'subject' | 'student';
  subject_comparisons?: SubjectComparisonData[];
}

export interface SessionComparisonItem {
  session_id: string;
  session_name: string;
  exam_date: string;
  avg_net: number;
  highest_net: number;
  lowest_net: number;
  participants: number;
}

export interface SubjectComparisonData {
  subject_name: string;
  sessions: {
    session_id: string;
    session_name: string;
    avg_net: number;
  }[];
}

export interface TrendAnalysis {
  exam_type_id: string;
  exam_type_name: string;
  period: string;
  data_points: TrendDataPoint[];
  overall_trend: 'improving' | 'declining' | 'stable';
  trend_percentage: number;
}

export interface TrendDataPoint {
  session_id: string;
  session_name: string;
  exam_date: string;
  avg_net: number;
  participants: number;
}

// ============================================================================
// AI Analysis Types
// ============================================================================

export interface AIAnalysisResult {
  student_id?: string;
  session_id?: string;
  analysis_type: 'risk' | 'weak_subject' | 'recommendation' | 'prediction';
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  generated_at: string;
}

export interface AIInsight {
  id: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  data_points: Array<Record<string, unknown>>;
  confidence: number;
}

export interface AIRecommendation {
  id: string;
  type: 'intervention' | 'support' | 'enrichment';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable_steps: string[];
  expected_impact: string;
}

export interface WeakSubjectAnalysis {
  student_id: string;
  student_name: string;
  weak_subjects: WeakSubjectDetail[];
  analysis_period: string;
}

export interface WeakSubjectDetail {
  subject_id: string;
  subject_name: string;
  avg_net: number;
  avg_success_rate: number;
  trend: 'improving' | 'declining' | 'stable';
  common_mistakes: string[];
  improvement_suggestions: string[];
}

// ============================================================================
// Report Types
// ============================================================================

export interface ExamReportConfig {
  report_type: 'session' | 'student' | 'comparative' | 'comprehensive';
  session_ids?: string[];
  student_ids?: string[];
  exam_type_id?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  include_charts: boolean;
  include_recommendations: boolean;
  format: 'pdf' | 'excel';
}

export interface GeneratedReport {
  id: string;
  report_type: string;
  title: string;
  generated_at: string;
  file_path?: string;
  download_url?: string;
  metadata: Record<string, unknown>;
}

// ============================================================================
// Advanced Features Types
// ============================================================================

// Student Exam Goals
export interface StudentExamGoal {
  id: string;
  student_id: string;
  exam_type_id: string;
  subject_id?: string;
  target_net: number;
  current_net: number;
  deadline?: string;
  status: 'active' | 'achieved' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentExamGoalWithDetails extends StudentExamGoal {
  student_name?: string;
  exam_type_name?: string;
  subject_name?: string;
  progress_percentage?: number;
  days_remaining?: number;
}

export interface CreateStudentExamGoalInput {
  student_id: string;
  exam_type_id: string;
  subject_id?: string;
  target_net: number;
  deadline?: string;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
}

// Question Analysis
export interface QuestionAnalysis {
  id: string;
  session_id: string;
  subject_id: string;
  question_number: number;
  correct_count: number;
  wrong_count: number;
  empty_count: number;
  difficulty_score: number;
  discrimination_index: number;
  avg_response_time?: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionAnalysisWithDetails extends QuestionAnalysis {
  subject_name?: string;
  total_responses?: number;
  difficulty_level?: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';
  quality_rating?: 'excellent' | 'good' | 'needs_review';
  difficulty_index?: number;
}

export interface QuestionAnalysisResult {
  session_id: string;
  session_name: string;
  questions: QuestionAnalysisWithDetails[];
  summary: {
    total_questions: number;
    avg_difficulty: number;
    avg_discrimination: number;
    reliability: number;
  };
}

// Subject Performance Heatmap
export interface SubjectPerformanceHeatmap {
  id: string;
  student_id: string;
  subject_id: string;
  exam_type_id: string;
  performance_score: number;
  trend: 'improving' | 'stable' | 'declining';
  last_6_avg: number;
  last_12_avg: number;
  total_sessions: number;
  strength_level: 'weak' | 'moderate' | 'strong';
  updated_at: string;
}

export interface HeatmapData {
  student_id: string;
  student_name: string;
  exam_type_id: string;
  subjects: HeatmapSubjectData[];
}

export interface HeatmapSubjectData {
  subject_id: string;
  subject_name: string;
  performance_score: number;
  strength_level: 'weak' | 'moderate' | 'strong';
  trend: 'improving' | 'stable' | 'declining';
  color_intensity: number;
}

// Exam Benchmarks
export interface ExamBenchmark {
  id: string;
  session_id: string;
  student_id: string;
  total_net: number;
  class_avg: number;
  school_avg: number;
  percentile: number;
  rank?: number;
  total_participants?: number;
  deviation_from_avg: number;
  performance_category?: 'excellent' | 'good' | 'average' | 'needs_improvement';
  created_at: string;
}

export interface BenchmarkComparison {
  student_id: string;
  student_name: string;
  session_id: string;
  session_name: string;
  student_score: number;
  class_average: number;
  school_average: number;
  percentile: number;
  rank: number;
  total_participants: number;
  performance_vs_class: 'above' | 'at' | 'below';
  performance_vs_school: 'above' | 'at' | 'below';
}

// Time Analysis
export interface ExamTimeAnalysis {
  id: string;
  student_id: string;
  exam_type_id: string;
  total_exams: number;
  avg_days_between_exams: number;
  study_frequency: 'high' | 'medium' | 'low';
  optimal_interval_days?: number;
  last_exam_date?: string;
  performance_time_correlation: number;
  improvement_velocity: number;
  updated_at: string;
}

export interface TimeAnalysisInsights {
  student_id: string;
  student_name: string;
  exam_type_id: string;
  consistency_score: number;
  optimal_study_pattern: string;
  recommended_next_exam_date: string;
  performance_trends: TimePerformanceTrend[];
}

export interface TimePerformanceTrend {
  period: string;
  avg_net: number;
  exam_count: number;
  trend: 'improving' | 'stable' | 'declining';
}

// Exam Predictions
export interface ExamPrediction {
  id: string;
  student_id: string;
  exam_type_id: string;
  predicted_net: number;
  confidence_level: number;
  prediction_date: string;
  target_exam_date?: string;
  risk_level?: 'high' | 'medium' | 'low';
  success_probability: number;
  improvement_needed: number;
  ai_insights?: string;
  created_at: string;
}

export interface PredictiveAnalysis {
  student_id: string;
  student_name: string;
  exam_type_id: string;
  current_performance: number;
  predicted_performance: number;
  confidence: number;
  risk_assessment: RiskAssessment;
  improvement_path: ImprovementPath;
  success_scenarios: SuccessScenario[];
}

export interface RiskAssessment {
  risk_level: 'high' | 'medium' | 'low';
  risk_factors: string[];
  protective_factors: string[];
  intervention_needed: boolean;
}

export interface ImprovementPath {
  current_net: number;
  target_net: number;
  gap: number;
  estimated_weeks_needed: number;
  weekly_improvement_rate: number;
  action_plan: string[];
}

export interface SuccessScenario {
  scenario: string;
  probability: number;
  required_actions: string[];
  expected_outcome: string;
}

// Exam Alerts
export interface ExamAlert {
  id: string;
  student_id: string;
  alert_type: 'performance_drop' | 'goal_achieved' | 'at_risk' | 'improvement_needed' | 'milestone';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  data?: string;
  is_read: boolean;
  action_taken: boolean;
  created_at: string;
}

export interface ExamAlertWithDetails extends ExamAlert {
  student_name?: string;
  days_ago?: number;
  action_url?: string;
}

// Student Development Plans
export interface StudentDevelopmentPlan {
  id: string;
  student_id: string;
  exam_type_id: string;
  weak_subjects: string;
  strong_subjects: string;
  priority_topics?: string;
  recommended_study_hours: number;
  improvement_suggestions?: string;
  action_items?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface DevelopmentPlanWithDetails extends StudentDevelopmentPlan {
  student_name?: string;
  exam_type_name?: string;
  weak_subjects_parsed?: SubjectDetail[];
  strong_subjects_parsed?: SubjectDetail[];
  action_items_parsed?: ActionItem[];
}

export interface SubjectDetail {
  subject_id: string;
  subject_name: string;
  current_performance: number;
  target_performance: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimated_hours: number;
  completed: boolean;
}

// Dashboard Widgets
export interface RealTimeDashboardMetrics {
  today: DailyMetrics;
  this_week: WeeklyMetrics;
  this_month: MonthlyMetrics;
  quick_stats: QuickStats;
}

export interface DailyMetrics {
  exams_today: number;
  results_entered_today: number;
  alerts_today: number;
  active_students: number;
}

export interface WeeklyMetrics {
  exams_this_week: number;
  avg_performance: number;
  improvement_rate: number;
  participation_rate: number;
}

export interface MonthlyMetrics {
  total_exams: number;
  total_participants: number;
  avg_success_rate: number;
  trend_direction: 'up' | 'down' | 'stable';
}

export interface QuickStats {
  at_risk_count: number;
  high_performers: number;
  goals_achieved_this_month: number;
  pending_results: number;
}

// PDF Report Types
export interface PDFReportConfig {
  report_type: 'student_detailed' | 'parent_summary' | 'class_overview' | 'annual_progress';
  student_id?: string;
  class_id?: string;
  exam_type_id?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  include_sections: {
    performance_charts: boolean;
    goal_tracking: boolean;
    subject_heatmap: boolean;
    benchmark_comparison: boolean;
    time_analysis: boolean;
    predictions: boolean;
    recommendations: boolean;
  };
  language: 'tr' | 'en';
  format: 'pdf' | 'excel';
}

export interface StudentDetailedReport {
  student_info: {
    id: string;
    name: string;
    class: string;
  };
  summary: {
    total_exams: number;
    avg_performance: number;
    best_performance: number;
    improvement_rate: number;
  };
  performance_by_subject: SubjectPerformanceSummary[];
  goal_progress: GoalProgressSummary[];
  benchmark_data: BenchmarkSummary[];
  time_analysis: TimeAnalysisSummary;
  predictions: PredictionSummary;
  recommendations: string[];
  generated_at: string;
}

export interface SubjectPerformanceSummary {
  subject_name: string;
  avg_net: number;
  trend: 'improving' | 'stable' | 'declining';
  strength_level: 'weak' | 'moderate' | 'strong';
  exams_count: number;
}

export interface GoalProgressSummary {
  goal_id: string;
  subject_name?: string;
  target_net: number;
  current_net: number;
  progress_percentage: number;
  status: 'active' | 'achieved' | 'cancelled';
  deadline?: string;
}

export interface BenchmarkSummary {
  session_name: string;
  exam_date: string;
  student_score: number;
  class_avg: number;
  percentile: number;
  rank: number;
}

export interface ExamBenchmarkWithDetails extends ExamBenchmark {
  session_name?: string;
  exam_date?: string;
  student_name?: string;
  exam_type_name?: string;
}

export interface TimeAnalysisSummary {
  total_exams: number;
  avg_interval_days: number;
  study_frequency: 'high' | 'medium' | 'low';
  consistency_score: number;
  recommended_pattern: string;
}

export interface TimeAnalysisData {
  student_id: string;
  student_name: string;
  exam_type_id: string;
  total_exams: number;
  avg_days_between_exams: number;
  study_frequency: 'high' | 'medium' | 'low';
  consistency_score: number;
  optimal_interval_days: number;
  performance_correlation: number;
  longest_gap: number;
  exam_history: {
    session_id: string;
    exam_date: string;
    total_net: number;
    days_since_last?: number;
  }[];
}

export interface PredictionSummary {
  predicted_performance: number;
  confidence: number;
  risk_level: 'high' | 'medium' | 'low';
  success_probability: number;
  key_insights: string[];
}
