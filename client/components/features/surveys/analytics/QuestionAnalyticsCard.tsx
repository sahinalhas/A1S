import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import MultipleChoiceAnalytics from "./MultipleChoiceAnalytics";
import LikertRatingAnalytics from "./LikertRatingAnalytics";
import YesNoAnalytics from "./YesNoAnalytics";
import OpenEndedAnalytics from "./OpenEndedAnalytics";

interface QuestionAnalyticsCardProps {
 question: any;
}

const getQuestionTypeLabel = (type: string) => {
 const labels: { [key: string]: string } = {
 'MULTIPLE_CHOICE': 'Çoktan Seçmeli',
 'OPEN_ENDED': 'Açık Uçlu',
 'LIKERT': 'Likert Ölçeği',
 'YES_NO': 'Evet/Hayır',
 'RATING': 'Puanlama',
 'DROPDOWN': 'Açılır Liste'
 };
 return labels[type] || type;
};

export default function QuestionAnalyticsCard({ question }: QuestionAnalyticsCardProps) {
 return (
 <Card className="mb-4">
 <CardHeader>
 <CardTitle className="text-lg">{question.questionText}</CardTitle>
 <CardDescription>
 <div className="flex items-center gap-4">
 <span>Tür: {getQuestionTypeLabel(question.questionType)}</span>
 <span>Yanıt Oranı: {question.responseRate}</span>
 <span>Toplam Yanıt: {question.totalResponses}</span>
 </div>
 </CardDescription>
 </CardHeader>
 <CardContent>
 {question.questionType === 'MULTIPLE_CHOICE' && question.optionCounts && (
 <MultipleChoiceAnalytics optionCounts={question.optionCounts} />
 )}

 {(question.questionType === 'LIKERT' || question.questionType === 'RATING') && (
 <LikertRatingAnalytics
 averageRating={question.averageRating}
 distribution={question.distribution}
 totalResponses={question.totalResponses}
 />
 )}

 {question.questionType === 'YES_NO' && (
 <YesNoAnalytics
 yesCount={question.yesCount}
 noCount={question.noCount}
 />
 )}

 {question.questionType === 'OPEN_ENDED' && question.sentiment && (
 <OpenEndedAnalytics
 averageLength={question.averageLength}
 sentiment={question.sentiment}
 />
 )}
 </CardContent>
 </Card>
 );
}
