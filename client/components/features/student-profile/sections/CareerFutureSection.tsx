/**
 * Career & Future Section
 * Kariyer analizi, yol haritası, hedefler - unified view
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Briefcase, Target } from "lucide-react";
import CareerGuidanceSection from "./CareerGuidanceSection";
import HedeflerPlanlamaSection from "./HedeflerPlanlamaSection";

const KARIYER_TABS = [
 { value:"rehberlik", label:"Kariyer Rehberliği", icon: Briefcase },
 { value:"hedefler", label:"Hedefler & Planlama", icon: Target },
] as const;

interface CareerFutureSectionProps {
 studentId: string;
 studentName: string;
 onUpdate: () => void;
}

export default function CareerFutureSection({
 studentId,
 studentName,
 onUpdate
}: CareerFutureSectionProps) {
 return (
 <Tabs defaultValue="rehberlik" className="space-y-4">
 <TabsList variant="nested">
 {KARIYER_TABS.map(({ value, label, icon: Icon }) => (
 <TabsTrigger key={value} value={value}>
 <Icon className="h-4 w-4" />
 <span className="hidden sm:inline">{label}</span>
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="rehberlik" className="space-y-4">
 <CareerGuidanceSection
 studentId={studentId}
 studentName={studentName}
 onUpdate={onUpdate}
 />
 </TabsContent>

 <TabsContent value="hedefler" className="space-y-4">
 <HedeflerPlanlamaSection
 studentId={studentId}
 onUpdate={onUpdate}
 />
 </TabsContent>
 </Tabs>
 );
}