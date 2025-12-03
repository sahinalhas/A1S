import { useState, useEffect, useMemo } from "react";
import { Student, loadStudents, refreshStudentsFromAPI } from "@/lib/storage";

export function useStudentProfile(studentId: string | undefined) {
 const [studentsData, setStudentsData] = useState<Student[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<Error | null>(null);
 
 useEffect(() => {
 let mounted = true;
 
 const initialData = loadStudents();
 
 if (initialData.length > 0) {
 setStudentsData(initialData);
 setIsLoading(false);
 } else {
 setIsLoading(true);
 refreshStudentsFromAPI()
 .then((data) => {
 if (mounted) {
 setStudentsData(data);
 setError(null);
 }
 })
 .catch((err) => {
 if (mounted) {
 console.error("Error loading students:", err);
 setError(err);
 }
 })
 .finally(() => {
 if (mounted) {
 setIsLoading(false);
 }
 });
 }
 
 const handleUpdate = () => {
 if (!mounted) return;
 const updatedData = loadStudents();
 setStudentsData(updatedData);
 setIsLoading(false);
 };
 
 window.addEventListener('studentsUpdated', handleUpdate);
 
 return () => {
 mounted = false;
 window.removeEventListener('studentsUpdated', handleUpdate);
 };
 }, []);
 
 const normalizedId = useMemo(() => {
 if (!studentId) return studentId;
 if (studentsData.some((s) => s.id === studentId)) return studentId;
 return studentId;
 }, [studentId, studentsData]);
 
 const student = useMemo(
 () => studentsData.find((s) => s.id === normalizedId),
 [normalizedId, studentsData]
 );

 return {
 student,
 studentId: normalizedId,
 isLoading,
 error,
 };
}
