/**
 * Öğrenci Profili Sekmesi
 * Veri Kategorisi: Demografik Veriler ve Sağlık Profili
 * İçerik: Kimlik bilgileri, iletişim bilgileri, aile yapısı, standartlaştırılmış sağlık profili
 */

import { Student } from "@/lib/storage";
import UnifiedIdentitySection from "@/components/features/student-profile/sections/UnifiedIdentitySection";
import StandardizedHealthSection from "@/components/features/student-profile/sections/StandardizedHealthSection";
import StandardizedTalentsSection from "@/components/features/student-profile/sections/StandardizedTalentsSection";
import { Separator } from "@/components/atoms";
import { motion } from "framer-motion";

interface DemographicsTabProps {
  student: Student;
  studentId: string;
  onUpdate: () => void;
}

export function DemographicsTab({ student, studentId, onUpdate }: DemographicsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <UnifiedIdentitySection student={student} onUpdate={onUpdate} />
      
      <Separator />
      
      <StandardizedHealthSection 
        studentId={studentId}
        onUpdate={onUpdate}
      />

      <Separator />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <StandardizedTalentsSection
          studentId={studentId}
          onUpdate={onUpdate}
        />
      </motion.div>
    </motion.div>
  );
}
