/**
 * Development Profile Section
 * Gelişim ve kişilik profili - sosyal-duygusal, çoklu zeka, yetenekler, motivasyon
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Heart, Brain, Target, Star, TrendingUp } from "lucide-react";
import StandardizedSocialEmotionalSection from "./StandardizedSocialEmotionalSection";
import KisilikProfiliSection from "./KisilikProfiliSection";
import StandardizedTalentsSection from "./StandardizedTalentsSection";
import MotivationProfileSection from "./MotivationProfileSection";
import Degerlendirme360Section from "./Degerlendirme360Section";

const GELISIM_TABS = [
 { value:"sosyal-duygusal", label:"Sosyal-Duygusal", icon: Heart },
 { value:"coklu-zeka", label:"Çoklu Zeka", icon: Brain },
 { value:"degerlendirme-360", label:"360 Derece Değerlendirme", icon: Target },
 { value:"yetenekler", label:"Yetenekler & İlgiler", icon: Star },
 { value:"motivasyon", label:"Motivasyon", icon: TrendingUp },
] as const;

interface DevelopmentProfileSectionProps {
 studentId: string;
 multipleIntelligence: any;
 evaluations360: any[];
 onUpdate: () => void;
}

export default function DevelopmentProfileSection({
 studentId,
 multipleIntelligence,
 evaluations360,
 onUpdate
}: DevelopmentProfileSectionProps) {
 return (
 <Tabs defaultValue="sosyal-duygusal" className="space-y-4">
 <TabsList variant="nested">
 {GELISIM_TABS.map(({ value, label, icon: Icon }) => (
 <TabsTrigger key={value} value={value}>
 <Icon className="h-4 w-4" />
 <span className="hidden sm:inline">{label}</span>
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="sosyal-duygusal" className="space-y-4">
 <StandardizedSocialEmotionalSection
 studentId={studentId}
 onUpdate={onUpdate}
 />
 </TabsContent>

 <TabsContent value="coklu-zeka" className="space-y-4">
 <KisilikProfiliSection
 studentId={studentId}
 multipleIntelligence={multipleIntelligence}
 onUpdate={onUpdate}
 />
 </TabsContent>

 <TabsContent value="degerlendirme-360" className="space-y-4">
 <Degerlendirme360Section
 studentId={studentId}
 evaluations360={evaluations360}
 onUpdate={onUpdate}
 />
 </TabsContent>

 <TabsContent value="yetenekler" className="space-y-4">
 <StandardizedTalentsSection
 studentId={studentId}
 onUpdate={onUpdate}
 />
 </TabsContent>

 <TabsContent value="motivasyon" className="space-y-4">
 <MotivationProfileSection
 studentId={studentId}
 onUpdate={onUpdate}
 />
 </TabsContent>
 </Tabs>
 );
}
