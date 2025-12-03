export type AttendanceRecord = {
 id: string;
 studentId: string;
 date: string;
 status:"Devamsız" |"Geç" |"Var";
 reason?: string;
};
