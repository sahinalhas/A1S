import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { BookOpen, Target } from "lucide-react";
import Courses from "./Courses";
import GuidanceStandardsTab from "@/components/features/settings/GuidanceStandardsTab";

export default function ContentManagement() {
  const [tab, setTab] = useState("courses");

  return (
    <div className="w-full min-h-screen pb-6">
      <div className="space-y-6 max-w-7xl mx-auto px-6">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">İçerik Kütüphanesi</h1>
          <p className="text-muted-foreground">
            Dersler, konular ve rehberlik standartlarını yönetin
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
            <TabsTrigger value="courses" variant="minimal">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Dersler & Konular</span>
            </TabsTrigger>
            <TabsTrigger value="guidance" variant="minimal">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Rehberlik Standartları</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Courses />
          </TabsContent>

          <TabsContent value="guidance">
            <GuidanceStandardsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
