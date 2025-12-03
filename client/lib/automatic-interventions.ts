import { generateEarlyWarnings, calculateRiskScore, type EarlyWarning } from "./analytics";
import { loadStudents, getInterventionsByStudent, addIntervention, type Intervention } from "./storage";
import { toast } from "sonner";

export interface AutoInterventionResult {
 studentId: string;
 studentName: string;
 riskLevel: string;
 interventionCreated: boolean;
 reason?: string;
}

export async function checkAndCreateAutomaticInterventions(): Promise<AutoInterventionResult[]> {
 const results: AutoInterventionResult[] = [];
 const students = loadStudents();
 const warnings = await generateEarlyWarnings();

 for (const student of students) {
 const riskScore = await calculateRiskScore(student.id);
 const studentWarnings = warnings.filter(w => w.studentId === student.id);
 
 let riskLevel: string;
 if (riskScore < 0.3) riskLevel ="Düşük";
 else if (riskScore < 0.5) riskLevel ="Orta";
 else if (riskScore < 0.7) riskLevel ="Yüksek";
 else riskLevel ="Kritik";

 if (riskScore >= 0.5) {
 const existingInterventions = await getInterventionsByStudent(student.id);
 const hasActiveIntervention = existingInterventions.some(
 i => i.status ==="Planlandı" || i.status ==="Devam"
 );

 if (!hasActiveIntervention && studentWarnings.length > 0) {
 const primaryWarning = studentWarnings[0];
 const interventionTitle = generateInterventionTitle(primaryWarning);
 
 const newIntervention: Intervention = {
 id: `auto-${student.id}-${Date.now()}`,
 studentId: student.id,
 date: new Date().toISOString(),
 title: interventionTitle,
 status:"Planlandı"
 };

 try {
 await addIntervention(newIntervention);
 results.push({
 studentId: student.id,
 studentName: `${student.name} ${student.surname}`,
 riskLevel,
 interventionCreated: true
 });
 } catch (error) {
 console.error(`Failed to create intervention for ${student.id}:`, error);
 results.push({
 studentId: student.id,
 studentName: `${student.name} ${student.surname}`,
 riskLevel,
 interventionCreated: false,
 reason:"Kayıt oluşturulamadı"
 });
 }
 } else {
 results.push({
 studentId: student.id,
 studentName: `${student.name} ${student.surname}`,
 riskLevel,
 interventionCreated: false,
 reason: hasActiveIntervention ?"Aktif müdahale mevcut" :"Uyarı bulunamadı"
 });
 }
 }
 }

 return results;
}

function generateInterventionTitle(warning: EarlyWarning): string {
 const typeMap: Record<string, string> = {
 'attendance': 'Devamsızlık Müdahalesi',
 'academic': 'Akademik Destek Programı',
 'behavioral': 'Davranışsal Rehberlik',
 'wellbeing': 'Kapsamlı Risk Müdahale Planı'
 };

 return typeMap[warning.warningType] || 'Otomatik Müdahale Planı';
}

export async function runAutomaticInterventionCheck(): Promise<void> {
 const results = await checkAndCreateAutomaticInterventions();
 const created = results.filter(r => r.interventionCreated);
 
 if (created.length > 0) {
 toast.success(`${created.length} öğrenci için otomatik müdahale planı oluşturuldu`, {
 description: created.map(r => r.studentName).join(",")
 });
 } else {
 toast.info("Yeni otomatik müdahale planı oluşturulmadı", {
 description:"Tüm riskli öğrenciler için mevcut müdahale planları aktif"
 });
 }
}
