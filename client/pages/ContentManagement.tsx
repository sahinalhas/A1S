import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { BookOpen, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Courses from "./Courses";
import GuidanceStandardsTab from "@/components/features/settings/GuidanceStandardsTab";

export default function ContentManagement() {
  const [tab, setTab] = useState("courses");

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="w-full min-h-screen pb-6 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <motion.div
          className="space-y-4 mb-10"
          variants={itemVariants}
        >
          {/* Decorative Element */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                  İçerik Kütüphanesi
                </h1>
              </motion.div>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Dersler, konular ve rehberlik standartlarını yönetin
              </p>
            </div>
          </div>

          {/* Descriptive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <motion.div
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md transition-shadow"
              variants={itemVariants}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Dersler & Konular</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">LGS, TYT, AYT, YDT ve Okul kategorilerini düzenleyin</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-purple-100 dark:border-purple-900/30 shadow-sm hover:shadow-md transition-shadow"
              variants={itemVariants}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Rehberlik Standartları</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Rehberlik hizmet alanlarını ve standartlarını yönetin</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs Section with Enhanced Styling */}
        <motion.div
          className="space-y-6"
          variants={itemVariants}
        >
          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            {/* Enhanced Tabs List */}
            <div className="flex justify-center sm:justify-start">
              <TabsList variant="minimal" className="w-full sm:w-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <TabsTrigger
                  value="courses"
                  variant="minimal"
                  className="relative px-4 py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Dersler & Konular</span>
                  <span className="sm:hidden">Dersler</span>
                </TabsTrigger>
                <TabsTrigger
                  value="guidance"
                  variant="minimal"
                  className="relative px-4 py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Rehberlik Standartları</span>
                  <span className="sm:hidden">Rehberlik</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content with Animation */}
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="courses" className="space-y-6">
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Courses />
                </div>
              </TabsContent>

              <TabsContent value="guidance" className="space-y-6">
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <GuidanceStandardsTab />
                </div>
              </TabsContent>
            </motion.div>
          </Tabs>
        </motion.div>

        {/* Decorative Footer Elements */}
        <motion.div
          className="flex justify-center gap-2 mt-12 opacity-30"
          variants={itemVariants}
        >
          <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
          <div className="h-1 w-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
          <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full"></div>
        </motion.div>
      </div>
    </motion.div>
  );
}
