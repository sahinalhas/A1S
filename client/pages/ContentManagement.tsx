import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Badge } from "@/components/atoms/Badge";
import { BookOpen, Target, Library, Sparkles } from "lucide-react";
import Courses from "./Courses";
import GuidanceStandardsTab from "@/components/features/settings/GuidanceStandardsTab";

export default function ContentManagement() {
  const [tab, setTab] = useState("courses");

  return (
    <div className="w-full min-h-screen pb-6">
      {/* Header - Diğer sayfalarla tutarlı stil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-5 md:p-6 shadow-xl"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-full flex items-center justify-between">
          <div className="flex-1">
            <Badge className="mb-2 bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              İçerik Yönetimi
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
              İçerik Kütüphanesi
            </h1>
            <p className="text-sm md:text-base text-white/90 max-w-xl leading-relaxed">
              Dersler, konular ve rehberlik standartlarını yönetin
            </p>
          </div>

          <motion.div
            className="hidden md:block opacity-30"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Library className="h-20 w-20 text-white" />
          </motion.div>
        </div>
      </motion.div>

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
