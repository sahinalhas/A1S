import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { AlertCircle, Loader2 } from "lucide-react";
import { useStudentProfile, useStudentData } from "@/hooks/features/student-profile";
import { StudentHeader } from "./components/StudentHeader";
import { StudentProfileTabs } from "./StudentProfileTabs";
import { useAIContext } from "@/lib/contexts/ai-context";

interface FormDirtyContextType {
  registerFormSubmit: (id: string, submitFn: () => Promise<void>) => void;
  unregisterFormSubmit: (id: string) => void;
}

const FormDirtyContext = createContext<FormDirtyContextType | undefined>(undefined);

export const useFormDirty = () => {
  const context = useContext(FormDirtyContext);
  if (!context) {
    throw new Error('useFormDirty must be used within FormDirtyProvider');
  }
  return context;
};

interface StudentScoresData {
 overallScore: number;
 profileCompleteness: number;
 categoryScores: {
   academic: number;
   behavioral: number;
   socialEmotional: number;
   health: number;
   talents: number;
 };
}

export default function StudentProfile() {
 const { id } = useParams();
 const [refresh, setRefresh] = useState(0);
 const [scoresData, setScoresData] = useState<StudentScoresData | null>(null);
 const [loadingScores, setLoadingScores] = useState(false);
 const [formSubmits] = useState<Map<string, () => Promise<void>>>(new Map());
 
 const { student, studentId, isLoading, error } = useStudentProfile(id);
 const { data } = useStudentData(studentId, refresh);
 const { setStudentContext } = useAIContext();

 useEffect(() => {
   if (student && studentId) {
     setStudentContext({
       id: studentId,
       name: `${student.name} ${student.surname}`
     });
   }
   return () => {
     setStudentContext(null);
   };
 }, [student, studentId, setStudentContext]);

 const handleUpdate = () => {
   setRefresh((x) => x + 1);
 };

 const registerFormSubmit = useCallback((id: string, submitFn: () => Promise<void>) => {
   formSubmits.set(id, submitFn);
 }, [formSubmits]);

 const unregisterFormSubmit = useCallback((id: string) => {
   formSubmits.delete(id);
 }, [formSubmits]);

 // Fetch standardized scores and profile completeness
 useEffect(() => {
 if (!studentId) return;
 
 setLoadingScores(true);
 fetch(`/api/student-profile/${studentId}/scores`)
 .then(res => res.json())
 .then(result => {
 if (result.success) {
 setScoresData(result.data);
 }
 })
 .catch(err => console.error('Error loading scores:', err))
 .finally(() => setLoadingScores(false));
 }, [studentId, refresh]);

 if (isLoading) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex items-center justify-center min-h-[400px]"
 >
 <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
 <CardHeader className="text-center space-y-4">
 <div className="flex justify-center">
 <Loader2 className="h-12 w-12 text-primary" />
 </div>
 <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
 Yükleniyor...
 </CardTitle>
 <CardDescription className="text-base">
 Öğrenci bilgileri yükleniyor
 </CardDescription>
 </CardHeader>
 </Card>
 </motion.div>
 );
 }

 if (error) {
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex items-center justify-center min-h-[400px]"
 >
 <Card className="border-2 border-destructive/20 bg-gradient-to-br from-destructive/5 via-background to-destructive/5">
 <CardHeader className="text-center space-y-3">
 <div className="flex justify-center">
 <div className="p-4 rounded-full bg-destructive/10">
 <AlertCircle className="h-12 w-12 text-destructive" />
 </div>
 </div>
 <CardTitle className="text-2xl flex items-center justify-center gap-2">
 Hata Oluştu
 </CardTitle>
 <CardDescription className="text-base">
 Öğrenci verileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
 </CardDescription>
 </CardHeader>
 <CardContent className="text-center pb-6">
 <Button asChild variant="outline" className="">
 <Link to="/ogrenci">Listeye Dön</Link>
 </Button>
 </CardContent>
 </Card>
 </motion.div>
 );
 }

 if (!student) {
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex items-center justify-center min-h-[400px]"
 >
 <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-amber-500/5">
 <CardHeader className="text-center space-y-3">
 <div className="flex justify-center">
 <div className="p-4 rounded-full bg-amber-500/10">
 <AlertCircle className="h-12 w-12 text-amber-500" />
 </div>
 </div>
 <CardTitle className="text-2xl bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
 Öğrenci bulunamadı
 </CardTitle>
 <CardDescription className="text-base">No: {id}</CardDescription>
 </CardHeader>
 <CardContent className="text-center pb-6">
 <Button asChild variant="outline" className="">
 <Link to="/ogrenci">Listeye Dön</Link>
 </Button>
 </CardContent>
 </Card>
 </motion.div>
 );
 }

 return (
 <FormDirtyContext.Provider value={{ registerFormSubmit, unregisterFormSubmit }}>
   <motion.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.5 }}
   className="w-full max-w-7xl mx-auto py-3 space-y-4"
   >
   <motion.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ delay: 0.1, duration: 0.5 }}
   >
   <StudentHeader student={student} />
   </motion.div>

   <motion.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ delay: 0.2, duration: 0.5 }}
   >
   <StudentProfileTabs
   student={student}
   studentId={studentId as string}
   data={data}
   onUpdate={handleUpdate}
   scoresData={scoresData}
   loadingScores={loadingScores}
   />
   </motion.div>
   </motion.div>
 </FormDirtyContext.Provider>
 );
}
