export * from "./types/student.types";
export * from "./types/common.types";
export * from "./types/attendance.types";
export * from "./types/academic.types";
export * from "./types/study.types";
export * from "./types/coaching.types";
export * from "./types/family.types";

export type { SpecialEducation } from "@shared/types";

export * from "./api/endpoints/students.api";
export * from "./api/endpoints/notes.api";
export * from "./api/endpoints/documents.api";
export * from "./api/endpoints/attendance.api";
export * from "./api/endpoints/academic.api";
export * from "./api/endpoints/survey.api";
export * from "./api/endpoints/study.api";
export * from "./api/endpoints/coaching.api";
export * from "./api/endpoints/family.api";
export * from "./api/endpoints/risk.api";
export * from "./api/endpoints/student-profile.api";

export * from "./utils/formatters/templates";
export * from "./utils/helpers/study-planning";

export function defaultSeed() {
 return [
 {
 id:"1001",
 name:"Ayşe",
 surname:"Yılmaz",
 class:"9/A",
 gender:"K",
 phone:"+90 555 111 22 33",
 parentName:"Fatma Yılmaz",
 parentContact:"+90 555 000 11 22",
 enrollmentDate: new Date().toISOString(),
 },
 {
 id:"1002",
 name:"Mehmet",
 surname:"Demir",
 class:"10/B",
 gender:"E",
 phone:"+90 555 333 44 55",
 enrollmentDate: new Date().toISOString(),
 },
 {
 id:"1003",
 name:"Zeynep",
 surname:"Kaya",
 class:"11/C",
 gender:"K",
 enrollmentDate: new Date().toISOString(),
 },
 {
 id:"1004",
 name:"Ali",
 surname:"Çelik",
 class:"12/A",
 gender:"E",
 enrollmentDate: new Date().toISOString(),
 },
 ];
}