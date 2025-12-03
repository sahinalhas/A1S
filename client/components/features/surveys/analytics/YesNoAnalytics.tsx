interface YesNoAnalyticsProps {
 yesCount: number;
 noCount: number;
}

export default function YesNoAnalytics({ yesCount, noCount }: YesNoAnalyticsProps) {
 return (
 <div className="grid grid-cols-2 gap-4">
 <div className="text-center">
 <div className="text-2xl font-bold text-green-600">{yesCount}</div>
 <div className="text-sm text-muted-foreground">Evet</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-red-600">{noCount}</div>
 <div className="text-sm text-muted-foreground">Hayır</div>
 </div>
 </div>
 );
}
