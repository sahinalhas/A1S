import { Progress } from "@/components/atoms/Progress";

interface MultipleChoiceAnalyticsProps {
 optionCounts: Array<{
 option: string;
 count: number;
 percentage: string;
 }>;
}

function sanitizePercentage(percentage: string): number {
 const cleaned = String(percentage || '0').replace('%', '').trim();
 const value = parseFloat(cleaned);
 return isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100);
}

export default function MultipleChoiceAnalytics({ optionCounts }: MultipleChoiceAnalyticsProps) {
 return (
 <div className="space-y-2">
 <h4 className="font-medium">Seçenek Dağılımı:</h4>
 {optionCounts.map((option, index) => {
 const percentageValue = sanitizePercentage(option.percentage);
 return (
 <div key={index} className="flex items-center justify-between">
 <span className="text-sm">{option.option}</span>
 <div className="flex items-center gap-2">
 <Progress value={percentageValue} className="w-24" />
 <span className="text-sm font-medium">{option.count} ({option.percentage}%)</span>
 </div>
 </div>
 );
 })}
 </div>
 );
}
