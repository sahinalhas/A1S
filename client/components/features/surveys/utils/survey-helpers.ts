import { SurveyQuestionType } from "@/lib/survey-types";

export function createEmptyQuestion(type: SurveyQuestionType) {
 return {
 questionText:"",
 questionType: type,
 required: false,
 options: type ==="MULTIPLE_CHOICE" || type ==="DROPDOWN" ? [""] : undefined,
 validation: {},
 };
}
