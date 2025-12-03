/**
 * Psikososyal Profil Sekmesi
 * Veri Kategorisi: Psikososyal Gelişim
 * İçerik: Sosyal-duygusal gelişim, davranış gözlemleri, akran ilişkileri, motivasyon
 */

import { Separator } from "@/components/atoms";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Heart, Users, TrendingUp } from "lucide-react";
import StandardizedSocialEmotionalSection from "@/components/features/student-profile/sections/StandardizedSocialEmotionalSection";
import StandardizedBehaviorSection from "@/components/features/student-profile/sections/StandardizedBehaviorSection";
import { motion } from "framer-motion";

interface PsychosocialTabProps {
  studentId: string;
  onUpdate: () => void;
}

export function PsychosocialTab({ studentId, onUpdate }: PsychosocialTabProps) {
  return (
    <div className="space-y-6">
      {/* Psikososyal Durum */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-pink-100 bg-gradient-to-br from-pink-50/50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-pink-600" />
              Psikososyal Durum (SEL)
            </CardTitle>
            <CardDescription>
              SEL yetkinlikleri, akran ilişkileri, duygu düzenleme ve sosyal beceriler
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-4">
          <StandardizedSocialEmotionalSection
            studentId={studentId}
            onUpdate={onUpdate}
          />
        </div>
      </motion.div>

      <Separator />

      {/* Davranışsal Gözlemler */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-600" />
              Davranışsal Profil
            </CardTitle>
            <CardDescription>
              Sınıf içi davranış, disiplin kayıtları ve davranış değişimi gözlemleri
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-4">
          <StandardizedBehaviorSection
            studentId={studentId}
            onUpdate={onUpdate}
          />
        </div>
      </motion.div>
    </div>
  );
}
