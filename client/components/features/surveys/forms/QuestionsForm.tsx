import { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { QuestionEditor } from "../questions/QuestionEditor";
import { QuestionTypeSelector } from "../questions/QuestionTypeSelector";
import { SurveyQuestionType } from "@/lib/survey-types";
import { createEmptyQuestion } from "../utils/survey-helpers";
import { SurveyTemplateForm } from "../types";

interface QuestionsFormProps {
 control: Control<SurveyTemplateForm>;
 questions: FieldArrayWithId<SurveyTemplateForm,"questions","id">[];
 append: UseFieldArrayAppend<SurveyTemplateForm,"questions">;
 remove: UseFieldArrayRemove;
 setValue: UseFormSetValue<SurveyTemplateForm>;
 watch: UseFormWatch<SurveyTemplateForm>;
}

export function QuestionsForm({ 
 control, 
 questions, 
 append, 
 remove,
 setValue,
 watch
}: QuestionsFormProps) {
 const addQuestion = (type: SurveyQuestionType) => {
 const newQuestion = createEmptyQuestion(type);
 append(newQuestion);
 };

 return (
 <div className="space-y-4">
 <QuestionTypeSelector onTypeSelect={addQuestion} />

 {questions.length > 0 && (
 <div className="space-y-3">
 {questions.map((question, index) => (
 <QuestionEditor
 key={question.id || index}
 control={control}
 questionIndex={index}
 onRemove={() => remove(index)}
 setValue={setValue}
 watch={watch}
 />
 ))}
 </div>
 )}

 {questions.length === 0 && (
 <div className="text-center py-8 text-muted-foreground">
 <p>Henüz soru eklenmedi. Yukarıdan bir soru tipi seçerek başlayın.</p>
 </div>
 )}
 </div>
 );
}
