import type { 
  SurveyTemplate, 
  SurveyQuestion, 
  SurveyDistribution, 
  SurveyResponse,
  SurveyAnalytics,
  QuestionAnalytics,
  OptionCount,
  RatingDistribution,
  SentimentAnalysis,
  DistributionStatistics
} from '../../types/surveys.types.js';

export function calculateSurveyAnalytics(
  distribution: SurveyDistribution, 
  template: SurveyTemplate, 
  questions: SurveyQuestion[], 
  responses: SurveyResponse[]
): SurveyAnalytics {
  const questionAnalytics = questions.map(question => 
    calculateQuestionAnalytics(question, responses)
  );

  return {
    distributionInfo: {
      id: distribution.id,
      title: distribution.title,
      templateTitle: template.title,
      status: distribution.status,
      totalTargets: distribution.targetStudents?.length || 0,
      totalResponses: responses.length,
      responseRate: distribution.targetStudents?.length ? 
        (responses.length / distribution.targetStudents.length * 100).toFixed(1) + '%' : 
        'N/A'
    },
    overallStats: {
      averageCompletionTime: calculateAverageCompletionTime(responses),
      mostSkippedQuestion: findMostSkippedQuestion(questions, responses),
      satisfactionScore: calculateOverallSatisfaction(questionAnalytics)
    },
    questionAnalytics
  };
}

export function calculateQuestionAnalytics(question: SurveyQuestion, responses: SurveyResponse[]): QuestionAnalytics {
  const questionResponses = responses
    .map(r => r.responseData?.[question.id])
    .filter(answer => answer !== undefined && answer !== null && answer !== '');

  const analytics: QuestionAnalytics = {
    questionId: question.id,
    questionText: question.questionText,
    questionType: question.questionType,
    totalResponses: questionResponses.length,
    responseRate: responses.length > 0 ? 
      (questionResponses.length / responses.length * 100).toFixed(1) + '%' : '0%'
  };

  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
    case 'DROPDOWN':
      analytics.optionCounts = calculateOptionCounts(question.options || [], questionResponses);
      break;
    
    case 'LIKERT':
    case 'RATING':
      analytics.averageRating = calculateAverageRating(questionResponses);
      analytics.distribution = calculateRatingDistribution(questionResponses);
      break;
    
    case 'YES_NO':
      analytics.yesCount = questionResponses.filter(r => r === 'Evet' || r === 'yes' || r === true).length;
      analytics.noCount = questionResponses.filter(r => r === 'Hayır' || r === 'no' || r === false).length;
      break;
    
    case 'OPEN_ENDED':
      analytics.responses = questionResponses;
      analytics.averageLength = questionResponses.reduce((sum: number, r: string) => 
        sum + (r?.toString().length || 0), 0) / questionResponses.length;
      analytics.sentiment = analyzeSentiment(questionResponses);
      break;
  }

  return analytics;
}

export function getResponsesByDay(responses: unknown[]) {
  const byDay: { [key: string]: number } = {};
  responses.forEach(response => {
    const date = new Date(response.created_at).toISOString().split('T')[0];
    byDay[date] = (byDay[date] || 0) + 1;
  });
  return byDay;
}

export function getDemographicBreakdown(responses: unknown[]) {
  const breakdown: any = {
    byClass: {},
    byGender: { E: 0, K: 0, unknown: 0 }
  };
  
  responses.forEach(response => {
    const studentInfo = response.studentInfo;
    if (studentInfo?.class) {
      breakdown.byClass[studentInfo.class] = (breakdown.byClass[studentInfo.class] || 0) + 1;
    }
    
    breakdown.byGender.unknown++;
  });
  
  return breakdown;
}

export function getSubmissionTypeBreakdown(responses: unknown[]) {
  const breakdown: { [key: string]: number } = {};
  responses.forEach(response => {
    const type = response.submissionType || 'ONLINE';
    breakdown[type] = (breakdown[type] || 0) + 1;
  });
  return breakdown;
}

export function calculateDistributionStatistics(distribution: SurveyDistribution, responses: SurveyResponse[]): DistributionStatistics {
  return {
    totalResponses: responses.length,
    completionRate: distribution.maxResponses ? 
      (responses.length / distribution.maxResponses * 100).toFixed(1) + '%' : 
      'Sınırsız',
    responsesByDay: getResponsesByDay(responses),
    demographicBreakdown: getDemographicBreakdown(responses),
    submissionTypes: getSubmissionTypeBreakdown(responses)
  };
}

function calculateOptionCounts(options: string[], responses: unknown[]): OptionCount[] {
  const counts = options.map(option => ({
    option,
    count: responses.filter(r => r === option).length,
    percentage: responses.length > 0 ? 
      (responses.filter(r => r === option).length / responses.length * 100).toFixed(1) : '0'
  }));
  
  return counts.sort((a, b) => b.count - a.count);
}

function calculateAverageRating(responses: unknown[]): number {
  const numericResponses = responses
    .map(r => typeof r === 'number' ? r : parseFloat(r))
    .filter(r => !isNaN(r));
  
  return numericResponses.length > 0 ? 
    numericResponses.reduce((sum, r) => sum + r, 0) / numericResponses.length : 0;
}

function calculateRatingDistribution(responses: unknown[]): RatingDistribution {
  const distribution: RatingDistribution = {};
  responses.forEach(response => {
    const rating = response.toString();
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  return distribution;
}

function analyzeSentiment(responses: unknown[]): SentimentAnalysis {
  const positiveKeywords = ['iyi', 'güzel', 'memnun', 'başarılı', 'harika', 'excellent', 'good', 'great'];
  const negativeKeywords = ['kötü', 'berbat', 'memnun değil', 'başarısız', 'poor', 'bad', 'terrible'];
  
  let positive = 0, negative = 0, neutral = 0;
  
  responses.forEach(response => {
    const text = response.toString().toLowerCase();
    const hasPositive = positiveKeywords.some(keyword => text.includes(keyword));
    const hasNegative = negativeKeywords.some(keyword => text.includes(keyword));
    
    if (hasPositive && !hasNegative) positive++;
    else if (hasNegative && !hasPositive) negative++;
    else neutral++;
  });
  
  return {
    positive,
    negative,
    neutral,
    overall: positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral'
  };
}

function calculateAverageCompletionTime(responses: SurveyResponse[]): number | string {
  const responsesWithTime = responses.filter(r => r.completionTime && typeof r.completionTime === 'number');
  
  if (responsesWithTime.length === 0) return 'N/A';
  
  const avgTime = responsesWithTime.reduce((sum, r) => sum + (r.completionTime || 0), 0) / responsesWithTime.length;
  return Math.round(avgTime);
}

function findMostSkippedQuestion(questions: SurveyQuestion[], responses: SurveyResponse[]): string | null {
  let maxSkipped = 0;
  let mostSkippedQuestion: string | null = null;
  
  questions.forEach(question => {
    const skipped = responses.filter(r => 
      !r.responseData?.[question.id] || 
      r.responseData[question.id] === '' || 
      r.responseData[question.id] === null
    ).length;
    
    if (skipped > maxSkipped) {
      maxSkipped = skipped;
      mostSkippedQuestion = question.questionText;
    }
  });
  
  return mostSkippedQuestion;
}

function calculateOverallSatisfaction(questionAnalytics: QuestionAnalytics[]): string | number {
  const ratingQuestions = questionAnalytics.filter(q => 
    q.questionType === 'LIKERT' || q.questionType === 'RATING'
  );
  
  if (ratingQuestions.length === 0) return 'N/A';
  
  const avgRating = ratingQuestions.reduce((sum, q) => 
    sum + (typeof q.averageRating === 'number' ? q.averageRating : parseFloat(q.averageRating as string)), 0) / ratingQuestions.length;
  
  return Number(avgRating.toFixed(2));
}
