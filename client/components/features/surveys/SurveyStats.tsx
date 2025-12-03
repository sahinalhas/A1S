import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { FileText, Users, BarChart } from "lucide-react";
import { SurveyTemplate, SurveyDistribution } from "@/lib/survey-types";

interface SurveyStatsProps {
 templates: SurveyTemplate[];
 distributions: SurveyDistribution[];
}

export default function SurveyStats({ templates, distributions }: SurveyStatsProps) {
 const activeDistributions = distributions.filter(d => d.status === 'ACTIVE').length;

 return (
 <div className="grid gap-4 md:grid-cols-4">
 <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Toplam Şablon</CardTitle>
 <FileText className="h-4 w-4 text-primary" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{templates.length}</div>
 <p className="text-xs text-muted-foreground">
 +2 bu ay
 </p>
 </CardContent>
 </Card>
 <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Aktif Anket</CardTitle>
 <Users className="h-4 w-4 text-accent" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{activeDistributions}</div>
 <p className="text-xs text-muted-foreground">
 Şu anda dağıtılmış
 </p>
 </CardContent>
 </Card>
 <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/15">
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Toplam Yanıt</CardTitle>
 <BarChart className="h-4 w-4 text-primary" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">1,247</div>
 <p className="text-xs text-muted-foreground">
 +12% önceki aya göre
 </p>
 </CardContent>
 </Card>
 <Card className="bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20">
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Tamamlanma Oranı</CardTitle>
 <BarChart className="h-4 w-4 text-accent" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">87%</div>
 <p className="text-xs text-muted-foreground">
 +5% önceki aya göre
 </p>
 </CardContent>
 </Card>
 </div>
 );
}
