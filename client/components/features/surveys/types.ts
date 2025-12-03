import { z } from "zod";

export const surveyTemplateSchema = z.object({
 title: z.string().min(1,"Başlık gereklidir").max(200,"Başlık çok uzun"),
 description: z.string().max(1000,"Açıklama çok uzun").optional(),
 tags: z.array(z.string().max(50)),
 targetAudience: z.enum([
"STUDENT",
"PARENT",
"TEACHER",
"ADMINISTRATOR",
"STAFF",
"ALUMNI",
"EXTERNAL_STAKEHOLDER"
 ]),
 questions: z.array(z.object({
 questionText: z.string().min(5,"Soru en az 5 karakter olmalı").max(500,"Soru çok uzun"),
 questionType: z.enum(["MULTIPLE_CHOICE","OPEN_ENDED","LIKERT","YES_NO","RATING","DROPDOWN"]),
 required: z.boolean(),
 options: z.array(z.string().min(1,"Seçenek boş olamaz")).min(1,"En az 1 seçenek gerekli").optional(),
 validation: z.object({
 minLength: z.number().optional(),
 maxLength: z.number().optional(),
 minValue: z.number().optional(),
 maxValue: z.number().optional(),
 }).optional(),
 })).min(1,"En az 1 soru gerekli").max(100,"Maksimum 100 soru")
});

export type SurveyTemplateForm = z.infer<typeof surveyTemplateSchema>;

export const targetAudienceLabels: Record<string, string> = {
 STUDENT:"Öğrenci Anketleri",
 PARENT:"Veli Anketleri",
 TEACHER:"Öğretmen Anketleri",
 ADMINISTRATOR:"İdareci Anketleri",
 STAFF:"Personel Anketleri",
 ALUMNI:"Mezun Anketleri",
 EXTERNAL_STAKEHOLDER:"Kurum Dışı Paydaş Anketleri"
};

export const participationTypeLabels: Record<string, string> = {
 PUBLIC: "Herkese Açık (Anonim)",
 STUDENT_INFO: "Öğrenci Bilgileri Zorunlu",
 SECURITY_CODE: "Güvenlik Kodu (QR) ile Erişim"
};

export const participationTypeDescriptions: Record<string, string> = {
 PUBLIC: "Kişisel bilgi girilmeden anonim yanıt alınır",
 STUDENT_INFO: "Öğrenci adı, soyadı, sınıf, cinsiyet, numara zorunlu",
 SECURITY_CODE: "QR kod ile öğrenci eşleştirmesi - PDF olarak yazdırılabilir"
};
