import { Progress } from "@/components/atoms/Progress";

interface LikertRatingAnalyticsProps {
 averageRating: number;
 distribution?: Record<string, number>;
 totalResponses: number;
}

export default function LikertRatingAnalytics({ 
 averageRating, 
 distribution, 
 totalResponses 
}: LikertRatingAnalyticsProps) {
 return (
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <h4 className="font-medium">Ortalama Puan:</h4>
 <span className="text-2xl font-bold text-blue-600">{averageRating}</span>
 </div>
 {distribution && (
 <div className="space-y-1">
 <h5 className="text-sm font-medium">Puan Dağılımı:</h5>
 {Object.entries(distribution).map(([rating, count]) => (
 <div key={rating} className="flex items-center gap-2">
 <span className="text-sm w-8">{rating}:</span>
 <Progress value={((count as number) / totalResponses * 100)} className="flex-1" />
 <span className="text-sm">{count as number}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 );
}
