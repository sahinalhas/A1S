import { useState, useEffect } from "react";
import { 
 getStudentProfileData, 
 initialStudentProfileData,
 type StudentProfileData 
} from "@/lib/storage";

export type { StudentProfileData as StudentData };

export function useStudentData(studentId: string | undefined, refresh: number) {
 const [data, setData] = useState<StudentProfileData>(initialStudentProfileData);
 const [isLoading, setIsLoading] = useState(false);

 useEffect(() => {
 if (!studentId) {
 setData(initialStudentProfileData);
 return;
 }

 setIsLoading(true);

 getStudentProfileData(studentId)
 .then((profileData) => {
 setData(profileData);
 setIsLoading(false);
 })
 .catch((error) => {
 console.error("Error loading student data:", error);
 setIsLoading(false);
 });
 }, [studentId, refresh]);

 return { data, isLoading };
}
