import { motion } from "framer-motion";
import type { Student } from "@/lib/types/student.types";
import {
  IdentityCard,
  ContactCard,
  ParentCard,
  GuardianCard,
  OtherInfoCard,
  HealthCard,
  TalentsCard,
} from "@/components/features/student-profile/sections/demographics";

interface DemographicsTabProps {
  student: Student;
  studentId: string;
  onUpdate: () => void;
}

export function DemographicsTab({
  student,
  studentId,
  onUpdate,
}: DemographicsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <IdentityCard student={student} onUpdate={onUpdate} />
        <ContactCard student={student} onUpdate={onUpdate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ParentCard student={student} parentType="mother" onUpdate={onUpdate} />
        <ParentCard student={student} parentType="father" onUpdate={onUpdate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GuardianCard student={student} onUpdate={onUpdate} />
        <OtherInfoCard student={student} onUpdate={onUpdate} />
      </div>

      <HealthCard student={student} onUpdate={onUpdate} />
      <TalentsCard student={student} onUpdate={onUpdate} />
    </motion.div>
  );
}
