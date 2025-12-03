/**
 * Kariyer & Yaşam Planlama Sekmesi
 * Veri Kategorisi: Kariyer Gelişimi ve Gelecek Planlaması
 * İçerik: Meslek hedefleri, üniversite planlaması, yetkinlikler ve gelecek vizyonu
 */

import CareerFutureSection from "@/components/features/student-profile/sections/CareerFutureSection";
import { motion } from "framer-motion";

interface CareerTabProps {
  studentId: string;
  studentName: string;
  onUpdate: () => void;
}

export function CareerTab({
  studentId,
  studentName,
  onUpdate,
}: CareerTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <CareerFutureSection
        studentId={studentId}
        studentName={studentName}
        onUpdate={onUpdate}
      />
    </motion.div>
  );
}
