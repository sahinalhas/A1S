import * as repository from '../repository/counseling-sessions.repository.js';
import type { CounselingSession } from '../types/counseling-sessions.types.js';

export interface AIReadySessionData {
  session: {
    id: string;
    date: string;
    topic: string;
    duration: number;
    sessionType: 'individual' | 'group';
  };
  assessment: {
    sessionFlow?: string;
    participationLevel?: string;
    cooperationLevel?: number;
    emotionalState?: string;
    physicalState?: string;
    communicationQuality?: string;
  };
  content: {
    summary: string;
    outcomes?: string;
    tags: string[];
  };
  actions: {
    followUpNeeded: boolean;
    followUpPlan?: string;
    actionItems: unknown[];
  };
  metadata: {
    studentId?: string;
    counselorId: string;
    completedAt: string;
  };
}

export function convertSessionToAIFormat(session: CounselingSession): AIReadySessionData {
  const duration = session.exitTime && session.entryTime 
    ? calculateDuration(session.entryTime, session.exitTime)
    : 0;

  const parsedTags = session.sessionTags ? JSON.parse(session.sessionTags) : [];
  const parsedActionItems = session.actionItems ? JSON.parse(session.actionItems) : [];

  return {
    session: {
      id: session.id,
      date: session.sessionDate,
      topic: session.topic || '',
      duration,
      sessionType: session.sessionType
    },
    assessment: {
      sessionFlow: session.sessionFlow,
      participationLevel: session.studentParticipationLevel,
      cooperationLevel: session.cooperationLevel,
      emotionalState: session.emotionalState,
      physicalState: session.physicalState,
      communicationQuality: session.communicationQuality
    },
    content: {
      summary: session.detailedNotes || '',
      outcomes: session.achievedOutcomes,
      tags: parsedTags
    },
    actions: {
      followUpNeeded: session.followUpNeeded === 1,
      followUpPlan: session.followUpPlan,
      actionItems: parsedActionItems
    },
    metadata: {
      counselorId: session.counselorId,
      completedAt: session.updated_at || session.created_at || new Date().toISOString()
    }
  };
}

/**
 * Oturumları AI formatına dönüştürür.
 * @param schoolId - Okul ID'si (zorunlu - güvenlik için)
 * @param sessionIds - Belirli oturum ID'leri (opsiyonel)
 */
export function exportSessionsForAI(schoolId: string, sessionIds?: string[]): AIReadySessionData[] {
  if (!schoolId) {
    throw new Error('schoolId is required for exportSessionsForAI');
  }
  
  let sessions: CounselingSession[];
  
  if (sessionIds && sessionIds.length > 0) {
    sessions = sessionIds
      .map(id => repository.getSessionByIdAndSchool(id, schoolId))
      .filter((s): s is CounselingSession => s !== null);
  } else {
    sessions = repository.getSessionsBySchool(schoolId);
  }

  return sessions
    .filter(s => s.completed === 1)
    .map(convertSessionToAIFormat);
}

export function generateAIAnalysisPrompt(sessionData: AIReadySessionData): string {
  const prompt = `
Analyze the following counseling session data:

Session Information:
- Date: ${sessionData.session.date}
- Topic: ${sessionData.session.topic}
- Type: ${sessionData.session.sessionType}
- Duration: ${sessionData.session.duration} minutes

Assessment:
- Session Flow: ${sessionData.assessment.sessionFlow || 'Not assessed'}
- Participation Level: ${sessionData.assessment.participationLevel || 'Not assessed'}
- Cooperation Level: ${sessionData.assessment.cooperationLevel || 'Not assessed'}/5
- Emotional State: ${sessionData.assessment.emotionalState || 'Not assessed'}
- Physical State: ${sessionData.assessment.physicalState || 'Not assessed'}
- Communication Quality: ${sessionData.assessment.communicationQuality || 'Not assessed'}

Summary:
${sessionData.content.summary}

Outcomes:
${sessionData.content.outcomes || 'Not specified'}

Tags: ${sessionData.content.tags.join(', ')}

Follow-up Needed: ${sessionData.actions.followUpNeeded ? 'Yes' : 'No'}
${sessionData.actions.followUpPlan ? `Follow-up Plan: ${sessionData.actions.followUpPlan}` : ''}

Action Items:
${sessionData.actions.actionItems.map((item: any) => `- ${item.description || item}`).join('\n') || 'None'}

Please provide:
1. A brief analysis of the student's progress
2. Risk assessment (low/medium/high)
3. Key themes and patterns
4. Recommended next steps
`;

  return prompt;
}

function calculateDuration(entryTime: string, exitTime: string): number {
  const [entryHour, entryMin] = entryTime.split(':').map(Number);
  const [exitHour, exitMin] = exitTime.split(':').map(Number);
  
  const entryMinutes = entryHour * 60 + entryMin;
  const exitMinutes = exitHour * 60 + exitMin;
  
  return exitMinutes - entryMinutes;
}

/**
 * Öğrenci için oturum verilerini toplar.
 * @param studentId - Öğrenci ID'si
 * @param schoolId - Okul ID'si (zorunlu - güvenlik için)
 */
export function aggregateSessionDataForStudent(studentId: string, schoolId: string): {
  totalSessions: number;
  averageCooperation: number;
  commonEmotionalStates: string[];
  topTags: string[];
  riskIndicators: string[];
  progressTrend: 'improving' | 'stable' | 'declining' | 'unknown';
} {
  if (!schoolId) {
    throw new Error('schoolId is required for aggregateSessionDataForStudent');
  }
  
  const sessions = repository.getSessionsBySchool(schoolId)
    .filter(s => s.completed === 1)
    .map(convertSessionToAIFormat);

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageCooperation: 0,
      commonEmotionalStates: [],
      topTags: [],
      riskIndicators: [],
      progressTrend: 'unknown'
    };
  }

  const cooperationLevels = sessions
    .map(s => s.assessment.cooperationLevel)
    .filter((level): level is number => level !== undefined);
  
  const averageCooperation = cooperationLevels.length > 0
    ? cooperationLevels.reduce((a, b) => a + b, 0) / cooperationLevels.length
    : 0;

  const emotionalStates = sessions
    .map(s => s.assessment.emotionalState)
    .filter((state): state is string => !!state);

  const emotionalStateCount = emotionalStates.reduce((acc, state) => {
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const commonEmotionalStates = Object.entries(emotionalStateCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([state]) => state);

  const allTags = sessions.flatMap(s => s.content.tags);
  const tagCount = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  const riskIndicators: string[] = [];
  if (commonEmotionalStates.includes('kaygılı') || commonEmotionalStates.includes('sinirli')) {
    riskIndicators.push('Emotional distress indicators present');
  }
  if (averageCooperation < 2.5) {
    riskIndicators.push('Low cooperation levels');
  }

  const recentSessions = sessions.slice(-5);
  const recentCooperation = recentSessions
    .map(s => s.assessment.cooperationLevel)
    .filter((level): level is number => level !== undefined);

  let progressTrend: 'improving' | 'stable' | 'declining' | 'unknown' = 'unknown';
  if (recentCooperation.length >= 3) {
    const firstHalf = recentCooperation.slice(0, Math.floor(recentCooperation.length / 2));
    const secondHalf = recentCooperation.slice(Math.floor(recentCooperation.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.5) progressTrend = 'improving';
    else if (secondAvg < firstAvg - 0.5) progressTrend = 'declining';
    else progressTrend = 'stable';
  }

  return {
    totalSessions: sessions.length,
    averageCooperation,
    commonEmotionalStates,
    topTags,
    riskIndicators,
    progressTrend
  };
}
