/**
 * Unified Risk Section
 * Koruyucu faktörleri gösterir
 */

import { Card, CardContent } from "@/components/organisms/Card";
import { useUnifiedRisk } from "@/hooks/features/student-profile";
import { Student } from "@/lib/storage";
import RiskProtectiveProfileSection from "./RiskProtectiveProfileSection";

interface UnifiedRiskSectionProps {
 studentId: string;
 student: Student;
 onUpdate?: () => void;
}

export default function UnifiedRiskSection({ studentId, student, onUpdate }: UnifiedRiskSectionProps) {
 const { data: riskData, isLoading } = useUnifiedRisk(studentId, student);

 if (isLoading) {
 return (
 <Card>
 <CardContent className="p-6">
 <div className="text-center text-muted-foreground">Bilgiler yükleniyor...</div>
 </CardContent>
 </Card>
 );
 }

 if (!riskData) {
 return (
 <Card>
 <CardContent className="p-6">
 <div className="text-center text-muted-foreground">Bilgi bulunamadı</div>
 </CardContent>
 </Card>
 );
 }

 return (
 <div className="space-y-6">
 <RiskProtectiveProfileSection
 studentId={studentId}
 onUpdate={onUpdate || (() => {})}
 />
 </div>
 );
}
