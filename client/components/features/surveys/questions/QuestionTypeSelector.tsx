import { Button } from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { 
 CheckSquare,
 Type,
 Star,
 ToggleLeft,
 ChevronDown
} from "lucide-react";
import { SurveyQuestionType } from "@/lib/survey-types";

const questionTypeIcons = {
 MULTIPLE_CHOICE: CheckSquare,
 OPEN_ENDED: Type,
 LIKERT: Star,
 YES_NO: ToggleLeft,
 RATING: Star,
 DROPDOWN: ChevronDown,
};

const questionTypeLabels = {
 MULTIPLE_CHOICE:"Çoktan Seçmeli",
 OPEN_ENDED:"Açık Uçlu",
 LIKERT:"Likert Ölçeği",
 YES_NO:"Evet/Hayır",
 RATING:"Puanlama",
 DROPDOWN:"Açılır Liste",
};

interface QuestionTypeSelectorProps {
 onTypeSelect: (type: SurveyQuestionType) => void;
}

export function QuestionTypeSelector({ onTypeSelect }: QuestionTypeSelectorProps) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="text-sm">Soru Tipi Seçin</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
 {(Object.keys(questionTypeLabels) as SurveyQuestionType[]).map((type) => {
 const Icon = questionTypeIcons[type];
 return (
 <Button
 key={type}
 variant="outline"
 size="sm"
 type="button"
 onClick={() => onTypeSelect(type)}
 className="justify-start"
 >
 <Icon className="mr-2 h-4 w-4" />
 {questionTypeLabels[type]}
 </Button>
 );
 })}
 </div>
 </CardContent>
 </Card>
 );
}

export { questionTypeIcons, questionTypeLabels };
