import { getNotesByStudent } from './notes.api';
import { getSurveyResultsByStudent } from './survey.api';
import { getAttendanceByStudent } from './attendance.api';
import { 
 getAcademicsByStudent, 
 getInterventionsByStudent 
} from './academic.api';
import {
 getCoachingRecommendationsByStudent,
 getAcademicGoalsByStudent,
 getMultipleIntelligenceByStudent,
 getLearningStyleByStudent,
 getSmartGoalsByStudent,
 getEvaluations360ByStudent,
 getAchievementsByStudent,
 getSelfAssessmentsByStudent,
 getTodaysSelfAssessment,
} from './coaching.api';
import {
 getParentMeetingsByStudent,
 getHomeVisitsByStudent,
 getFamilyParticipationByStudent,
} from './family.api';
import {
 getSpecialEducationByStudent,
 getLatestRiskFactors,
 getBehaviorIncidentsByStudent,
 getExamResultsByStudent,
} from './risk.api';
import type { MeetingNote } from '@shared/types/meeting-notes.types';
import type { SurveyResult, Intervention } from '../../types/common.types';
import type { AttendanceRecord } from '../../types/attendance.types';
import type { AcademicRecord, BehaviorIncident, ExamResult } from '../../types/academic.types';
import type {
 CoachingRecommendation,
 MultipleIntelligence,
 LearningStyle,
 AcademicGoal,
 SmartGoal,
 Evaluation360,
 Achievement,
 SelfAssessment,
} from '../../types/coaching.types';
import type {
 ParentMeeting,
 HomeVisit,
 FamilyParticipation,
} from '../../types/family.types';
import type { SpecialEducation } from '@shared/types';

export interface RiskFactors {
 level: string;
 factors: string[];
 lastUpdated: string;
}

export interface StudentProfileData {
 notes: MeetingNote[];
 surveyResults: SurveyResult[];
 attendanceRecords: AttendanceRecord[];
 academicRecords: AcademicRecord[];
 interventions: Intervention[];
 specialEducation: SpecialEducation[];
 riskFactors: RiskFactors | null;
 behaviorIncidents: BehaviorIncident[];
 examResults: ExamResult[];
 coachingRecommendations: CoachingRecommendation[];
 academicGoals: AcademicGoal[];
 multipleIntelligence: MultipleIntelligence | null;
 learningStyle: LearningStyle | null;
 smartGoals: SmartGoal[];
 evaluations360: Evaluation360[];
 achievements: Achievement[];
 selfAssessments: SelfAssessment[];
 todaysAssessment: SelfAssessment | undefined;
 parentMeetings: ParentMeeting[];
 homeVisits: HomeVisit[];
 familyParticipation: FamilyParticipation[];
}

export const initialStudentProfileData: StudentProfileData = {
 notes: [],
 surveyResults: [],
 attendanceRecords: [],
 academicRecords: [],
 interventions: [],
 specialEducation: [],
 riskFactors: null,
 behaviorIncidents: [],
 examResults: [],
 coachingRecommendations: [],
 academicGoals: [],
 multipleIntelligence: null,
 learningStyle: null,
 smartGoals: [],
 evaluations360: [],
 achievements: [],
 selfAssessments: [],
 todaysAssessment: undefined,
 parentMeetings: [],
 homeVisits: [],
 familyParticipation: [],
};

export async function getStudentProfileData(studentId: string): Promise<StudentProfileData> {
 const [
 notes,
 surveyResults,
 attendanceRecords,
 academicRecords,
 interventions,
 specialEducation,
 riskFactors,
 behaviorIncidents,
 examResults,
 coachingRecommendations,
 academicGoals,
 multipleIntelligence,
 learningStyle,
 smartGoals,
 evaluations360,
 achievements,
 selfAssessments,
 todaysAssessment,
 parentMeetings,
 homeVisits,
 familyParticipation,
 ] = await Promise.all([
 getNotesByStudent(studentId),
 getSurveyResultsByStudent(studentId),
 getAttendanceByStudent(studentId),
 getAcademicsByStudent(studentId),
 getInterventionsByStudent(studentId),
 getSpecialEducationByStudent(studentId),
 getLatestRiskFactors(studentId),
 getBehaviorIncidentsByStudent(studentId),
 getExamResultsByStudent(studentId),
 getCoachingRecommendationsByStudent(studentId),
 getAcademicGoalsByStudent(studentId),
 getMultipleIntelligenceByStudent(studentId),
 getLearningStyleByStudent(studentId),
 getSmartGoalsByStudent(studentId),
 getEvaluations360ByStudent(studentId),
 getAchievementsByStudent(studentId),
 getSelfAssessmentsByStudent(studentId),
 getTodaysSelfAssessment(studentId),
 getParentMeetingsByStudent(studentId),
 getHomeVisitsByStudent(studentId),
 getFamilyParticipationByStudent(studentId),
 ]);

 return {
 notes,
 surveyResults,
 attendanceRecords,
 academicRecords,
 interventions,
 specialEducation,
 riskFactors,
 behaviorIncidents,
 examResults,
 coachingRecommendations,
 academicGoals,
 multipleIntelligence: multipleIntelligence || null,
 learningStyle: learningStyle || null,
 smartGoals,
 evaluations360,
 achievements,
 selfAssessments,
 todaysAssessment,
 parentMeetings,
 homeVisits,
 familyParticipation,
 };
}
