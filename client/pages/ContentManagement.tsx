import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Badge } from "@/components/atoms/Badge";
import { BookOpen, Target, Library, Sparkles } from "lucide-react";
import Courses from "./Courses";
import GuidanceStandardsTab from "@/components/features/settings/GuidanceStandardsTab";
import { PageHeader } from "@/components/features/common/PageHeader";

export default function ContentManagement() {
  const [tab, setTab] = useState("courses");

  return (
    <div className="w-full min-h-screen pb-6">
      <PageHeader
        title="İçerik Kütüphanesi"
        description="Dersler, konular ve rehberlik standartlarını yönetin"
        icon={Library}
      />

      {/* İçerik Alanı */}
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
              <TabsTrigger value="courses" variant="minimal">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Dersler & Konular</span>
                <span className="sm:hidden">Dersler</span>
              </TabsTrigger>
              <TabsTrigger value="guidance" variant="minimal">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Rehberlik Standartları</span>
                <span className="sm:hidden">Rehberlik</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              <Courses />
            </TabsContent>

            <TabsContent value="guidance">
              <GuidanceStandardsTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
