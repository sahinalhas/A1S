/**
 * Student Profile Tabs - Veri Tipi Odaklı Yapı
 * 5 Ana Sekme: Dashboard, Tanıtıcı Bilgiler, Akademik Durum, 
 * Psikososyal Durum, Kariyer Rehberliği
 * 
 * AI Araçları artık floating AI icon üzerinden erişilebilir
 * Minimalist Tab Tasarımı - Kasım 2025
 */

import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { STUDENT_PROFILE_MAIN_TABS } from "@/config/tabs";
import { StudentData } from "@/hooks/features/student-profile";
import { Student } from "@/lib/storage";

import { OverviewTab } from "./tabs/OverviewTab";
import { DemographicsTab } from "./tabs/DemographicsTab";
import { AcademicTab } from "./tabs/AcademicTab";
import { PsychosocialTab } from "./tabs/PsychosocialTab";
import { CareerTab } from "./tabs/CareerTab";

interface StudentProfileTabsProps {
  student: Student;
  studentId: string;
  data: StudentData;
  onUpdate: () => void;
  scoresData?: any;
  loadingScores?: boolean;
}

export function StudentProfileTabs({
  student,
  studentId,
  data,
  onUpdate,
  scoresData,
  loadingScores,
}: StudentProfileTabsProps) {
  const [searchParams] = useSearchParams();
  const studentName = `${student.name} ${student.surname}`;
  const tabFromUrl = searchParams.get("tab");
  
  const validTabValues = STUDENT_PROFILE_MAIN_TABS.map(tab => tab.value);
  const defaultTab = tabFromUrl && validTabValues.includes(tabFromUrl) ? tabFromUrl : "overview";

  return (
    <Tabs defaultValue={defaultTab} className="space-y-1">
      <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
        {STUDENT_PROFILE_MAIN_TABS.map((tabConfig) => {
          const Icon = tabConfig.icon;
          return (
            <TabsTrigger
              key={tabConfig.value}
              value={tabConfig.value}
              variant="minimal"
              title={tabConfig.description}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span className="hidden sm:inline">{tabConfig.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Dashboard */}
      <TabsContent value="overview" className="space-y-3">
        <OverviewTab
          student={student}
          studentId={studentId}
          scoresData={scoresData}
          loadingScores={loadingScores}
        />
      </TabsContent>

      {/* Tanıtıcı Bilgiler */}
      <TabsContent value="demographics" className="space-y-3">
        <DemographicsTab 
          student={student} 
          studentId={studentId}
          onUpdate={onUpdate} 
        />
      </TabsContent>

      {/* Akademik Durum */}
      <TabsContent value="academic" className="space-y-3">
        <AcademicTab studentId={studentId} studentName={studentName} onUpdate={onUpdate} />
      </TabsContent>

      {/* Psikososyal Durum */}
      <TabsContent value="psychosocial" className="space-y-3">
        <PsychosocialTab
          studentId={studentId}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* Kariyer Rehberliği */}
      <TabsContent value="career" className="space-y-3">
        <CareerTab
          studentId={studentId}
          studentName={studentName}
          onUpdate={onUpdate}
        />
      </TabsContent>
    </Tabs>
  );
}
