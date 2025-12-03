import getDatabase from '../../../lib/database/index.js';
import type { PredictiveAnalysis } from '../../../../shared/types/exam-management.types.js';
import { randomUUID } from 'crypto';

export function predictPerformance(studentId: string, examTypeId: string): PredictiveAnalysis {
  const db = getDatabase();
  
  // Get student info
  const student = db.prepare("SELECT COALESCE(CAST((name || ' ' || surname) AS TEXT), name) as fullName FROM students WHERE id = ?").get(studentId) as any;
  
  // Get recent performance data
  const recentResults = db.prepare(`
    SELECT 
      SUM(r.net_score) as total_net,
      s.exam_date
    FROM exam_session_results r
    INNER JOIN exam_sessions s ON r.session_id = s.id
    WHERE r.student_id = ? AND s.exam_type_id = ?
    GROUP BY s.id
    ORDER BY s.exam_date DESC
    LIMIT 10
  `).all(studentId, examTypeId);
  
  if ((recentResults as any[]).length < 2) {
    return {
      student_id: studentId,
      student_name: student?.fullName || '',
      exam_type_id: examTypeId,
      current_performance: 0,
      predicted_performance: 0,
      confidence: 0,
      risk_assessment: {
        risk_level: 'medium',
        risk_factors: ['Insufficient data for accurate prediction'],
        protective_factors: [],
        intervention_needed: false
      },
      improvement_path: {
        current_net: 0,
        target_net: 0,
        gap: 0,
        estimated_weeks_needed: 0,
        weekly_improvement_rate: 0,
        action_plan: []
      },
      success_scenarios: []
    };
  }
  
  // Calculate current performance (last 3 exams average)
  const last3 = (recentResults as any[]).slice(0, 3);
  const currentPerformance = last3.reduce((sum: number, r: any) => sum + r.total_net, 0) / last3.length;
  
  // Calculate trend (linear regression)
  const scores = (recentResults as any[]).map((r: any) => r.total_net);
  const avgScore = scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length;
  
  // Simple trend calculation
  let trend = 0;
  for (let i = 0; i < scores.length - 1; i++) {
    trend += scores[i] - scores[i + 1];
  }
  trend = trend / (scores.length - 1);
  
  // Predict next performance (current + trend)
  const predictedPerformance = currentPerformance + trend;
  
  // Calculate confidence based on variance
  const variance = scores.reduce((sum: number, s: number) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
  const confidence = Math.max(0, Math.min(100, 100 - variance));
  
  // Risk assessment
  let riskLevel: 'high' | 'medium' | 'low' = 'low';
  const riskFactors: string[] = [];
  const protectiveFactors: string[] = [];
  
  if (trend < -2) {
    riskLevel = 'high';
    riskFactors.push('Declining performance trend');
  } else if (trend < 0) {
    riskLevel = 'medium';
    riskFactors.push('Slight performance decline');
  } else {
    protectiveFactors.push('Positive performance trend');
  }
  
  if (currentPerformance < 50) {
    riskFactors.push('Low current performance');
    riskLevel = riskLevel === 'high' ? 'high' : 'medium';
  } else {
    protectiveFactors.push('Good baseline performance');
  }
  
  // Improvement path
  const targetNet = currentPerformance * 1.2;
  const gap = targetNet - currentPerformance;
  const weeklyRate = Math.abs(trend) || 1;
  const weeksNeeded = Math.ceil(gap / weeklyRate);
  
  // Save prediction to database
  const predictionId = randomUUID();
  db.prepare(`
    INSERT INTO exam_predictions (
      id, student_id, exam_type_id, predicted_net, confidence_level,
      prediction_date, risk_level, success_probability, improvement_needed, ai_insights
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    predictionId,
    studentId,
    examTypeId,
    predictedPerformance,
    confidence,
    new Date().toISOString().split('T')[0],
    riskLevel,
    confidence,
    gap,
    JSON.stringify({ trend, variance })
  );
  
  return {
    student_id: studentId,
    student_name: student?.fullName || '',
    exam_type_id: examTypeId,
    current_performance: currentPerformance,
    predicted_performance: predictedPerformance,
    confidence: confidence,
    risk_assessment: {
      risk_level: riskLevel,
      risk_factors: riskFactors,
      protective_factors: protectiveFactors,
      intervention_needed: riskLevel === 'high'
    },
    improvement_path: {
      current_net: currentPerformance,
      target_net: targetNet,
      gap: gap,
      estimated_weeks_needed: weeksNeeded,
      weekly_improvement_rate: weeklyRate,
      action_plan: [
        'Focus on weak subjects identified in heatmap',
        'Maintain consistent study schedule',
        'Review mistakes from previous exams'
      ]
    },
    success_scenarios: [
      {
        scenario: 'Optimal Progress',
        probability: confidence,
        required_actions: ['Study 10+ hours weekly', 'Complete all practice exams'],
        expected_outcome: `Reach ${targetNet.toFixed(1)} net in ${weeksNeeded} weeks`
      }
    ]
  };
}
