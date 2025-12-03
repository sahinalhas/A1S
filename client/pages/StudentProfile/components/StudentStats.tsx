import { useMemo } from "react";
import { Card, CardContent } from "@/components/organisms/Card";
import { Student, AttendanceRecord, SurveyResult, Intervention } from "@/lib/storage";
import { RiskPill } from "./RiskPill";

interface StudentStatsProps {
 student: Student;
 attendanceRecords: AttendanceRecord[];
 surveyResults: SurveyResult[];
 interventions: Intervention[];
}

export function StudentStats({
 student,
 attendanceRecords,
 surveyResults,
 interventions,
}: StudentStatsProps) {
 const devamsiz30 = useMemo(
 () =>
 attendanceRecords.filter(
 (a) =>
 a.status ==="Devamsız" &&
 Date.now() - new Date(a.date).getTime() <= 30 * 24 * 60 * 60 * 1000
 ).length,
 [attendanceRecords]
 );

 const lastSurvey = surveyResults[0];
 const riskLevel = student?.risk || (devamsiz30 >= 2 ?"Orta" :"Düşük");

 return (
 <Card className="">
 <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6">
 <div className="rounded-lg border border-border/50 p-4 bg-gradient-to-br from-background to-muted/20">
 <div className="text-xs font-medium text-muted-foreground">Risk</div>
 <div className="mt-2">
 <RiskPill risk={riskLevel} />
 </div>
 </div>
 <div className="rounded-lg border border-border/50 p-4 bg-gradient-to-br from-background to-muted/20">
 <div className="text-xs font-medium text-muted-foreground">Son Anket</div>
 <div className="mt-2 text-lg font-bold">
 {typeof lastSurvey?.score ==="number" ? `${lastSurvey.score}` :"-"}
 </div>
 </div>
 <div className="rounded-lg border border-border/50 p-4 bg-gradient-to-br from-background to-muted/20">
 <div className="text-xs font-medium text-muted-foreground">30 Günde Devamsız</div>
 <div className="mt-2 text-lg font-bold">{devamsiz30}</div>
 </div>
 <div className="rounded-lg border border-border/50 p-4 bg-gradient-to-br from-background to-muted/20">
 <div className="text-xs font-medium text-muted-foreground">Müdahaleler</div>
 <div className="mt-2 text-lg font-bold">{interventions.length}</div>
 </div>
 </CardContent>
 </Card>
 );
}
