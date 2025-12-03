/**
 * Sağlık & Destek Hizmetleri Sekmesi
 * Veri Kategorisi: Risk Yönetimi ve Müdahale Sistemleri
 * İçerik: Risk analizi, müdahale planları
 */

import { Student } from "@/lib/storage";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { ShieldAlert } from "lucide-react";
import EnhancedRiskDashboard from "@/components/features/student-profile/sections/EnhancedRiskDashboard";
import { motion } from "framer-motion";

interface HealthSupportTabProps {
  studentId: string;
  student: Student;
  onUpdate: () => void;
}

export function HealthSupportTab({
  studentId,
  student,
  onUpdate,
}: HealthSupportTabProps) {
  return (
    <div className="space-y-6">
      {/* Risk Analizi & Müdahale Planları */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-red-100 bg-gradient-to-br from-red-50/50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              Risk Analizi & Müdahale Sistemleri
            </CardTitle>
            <CardDescription>
              AI risk değerlendirmesi, koruyucu faktörler ve erken müdahale planları
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-4">
          <EnhancedRiskDashboard
            studentId={studentId}
            student={student}
            onUpdate={onUpdate}
          />
        </div>
      </motion.div>
    </div>
  );
}
