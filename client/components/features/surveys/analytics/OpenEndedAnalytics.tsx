interface OpenEndedAnalyticsProps {
 averageLength: number;
 sentiment?: {
 positive: number;
 neutral: number;
 negative: number;
 };
}

export default function OpenEndedAnalytics({ averageLength, sentiment }: OpenEndedAnalyticsProps) {
 return (
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <h4 className="font-medium">Ortalama Uzunluk:</h4>
 <span className="font-medium">{Math.round(averageLength)} karakter</span>
 </div>
 {sentiment && (
 <div>
 <h4 className="font-medium mb-2">Duygu Analizi:</h4>
 <div className="grid grid-cols-3 gap-2">
 <div className="text-center">
 <div className="text-xl font-bold text-green-600">{sentiment.positive}</div>
 <div className="text-sm text-muted-foreground">Pozitif</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-gray-600">{sentiment.neutral}</div>
 <div className="text-sm text-muted-foreground">Nötr</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-red-600">{sentiment.negative}</div>
 <div className="text-sm text-muted-foreground">Negatif</div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
