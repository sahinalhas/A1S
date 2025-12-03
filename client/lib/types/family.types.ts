export type ParentMeeting = {
 id: string;
 studentId: string;
 meetingDate: string;
 time: string;
 type:"YÜZ_YÜZE" |"TELEFON" |"ONLINE" |"EV_ZİYARETİ";
 participants: string[];
 mainTopics: string[];
 concerns?: string;
 decisions?: string;
 actionPlan?: string;
 nextMeetingDate?: string;
 parentSatisfaction?: number;
 followUpRequired: boolean;
 notes?: string;
 createdBy: string;
 createdAt: string;
};

export type HomeVisit = {
 id: string;
 studentId: string;
 date: string;
 time: string;
 visitDuration: number;
 visitors: string[];
 familyPresent: string[];
 homeEnvironment:"UYGUN" |"ORTA" |"ZOR_KOŞULLAR" |"DEĞERLENDİRİLEMEDİ";
 familyInteraction:"OLUMLU" |"NORMAL" |"GERGİN" |"İŞBİRLİKSİZ";
 observations: string;
 recommendations: string;
 concerns?: string;
 resources?: string;
 followUpActions?: string;
 nextVisitPlanned?: string;
 notes?: string;
 createdBy: string;
 createdAt: string;
};

export type FamilyParticipation = {
 id: string;
 studentId: string;
 eventType:"VELI_TOPLANTISI" |"OKUL_ETKİNLİĞİ" |"ÖĞRETMEN_GÖRÜŞMESİ" |"PERFORMANS_DEĞERLENDİRME" |"DİĞER";
 eventName: string;
 eventDate: string;
 participationStatus:"KATILDI" |"KATILMADI" |"GEÇ_KATILDI" |"ERKEN_AYRILDI";
 participants?: string[];
 engagementLevel:"ÇOK_AKTİF" |"AKTİF" |"PASİF" |"İLGİSİZ";
 communicationFrequency:"GÜNLÜK" |"HAFTALIK" |"AYLIK" |"SADECE_GEREKENDE";
 preferredContactMethod:"TELEFON" |"EMAIL" |"WHATSAPP" |"YÜZ_YÜZE" |"OKUL_SISTEMI";
 parentAvailability?: string;
 notes?: string;
 recordedBy: string;
 recordedAt: string;
};
