/**
 * Öğrenci Profili Sekmesi
 * Veri Kategorisi: Demografik Veriler
 * İçerik: Kimlik bilgileri, iletişim bilgileri, aile yapısı
 */

import { Student } from "@/lib/storage";
import UnifiedIdentitySection from "@/components/features/student-profile/sections/UnifiedIdentitySection";
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
    </motion.div>
  );
}
