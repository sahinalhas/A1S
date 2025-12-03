import { useMemo, useState } from "react";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 CardDescription,
} from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import {
 loadSubjects,
 loadTopics,
 saveSubjects,
 saveTopics,
 loadSubjectsAsync,
 loadTopicsAsync,
 StudySubject,
 StudyTopic,
} from "@/lib/storage";
import { toast } from "sonner";

function parseSubjectHeader(raw: string): {
 name: string;
 category?: StudySubject["category"];
} {
 const m = raw.match(/^(.*)\s*\((TYT|AYT|YDT|YKS|LGS)\)\s*$/i);
 if (m) {
 const name = m[1].trim();
 const cat = m[2].toUpperCase() as any;
 return { name, category: cat };
 }
 return { name: raw.trim() };
}

export default function ExcelLoader() {
 const [refresh, setRefresh] = useState(0);
 const [loading, setLoading] = useState(false);
 const subjects = useMemo(() => loadSubjects(), [refresh]);
 const topics = useMemo(() => loadTopics(), [refresh]);

 const onFile = async (file: File) => {
 setLoading(true);
 try {
 const { read, utils } = await import("xlsx");
 const buf = await file.arrayBuffer();
 const wb = read(buf, { type: 'array', codepage: 65001 });
 const sheet = wb.Sheets[wb.SheetNames[0]];
 const rows: unknown[][] = utils.sheet_to_json(sheet, { header: 1, raw: false });
 
 if (!rows || rows.length === 0) {
 toast.error("Excel dosyası boş");
 return;
 }

 const header = rows[0];
 const maxCols = header.length;

 const currentSubjects = await loadSubjectsAsync();
 const currentTopics = await loadTopicsAsync();
 
 const allSubjects = [...currentSubjects];
 const allTopics = [...currentTopics];
 
 const subjectMap = new Map<string, StudySubject>();
 allSubjects.forEach(s => {
 const key = `${s.name}|${s.category || ''}`;
 subjectMap.set(key, s);
 });
 
 const topicMap = new Map<string, StudyTopic>();
 allTopics.forEach(t => {
 const key = `${t.subjectId}|${t.name}`;
 topicMap.set(key, t);
 });

 let subjectsAdded = 0;
 let topicsAdded = 0;
 let topicsUpdated = 0;

 for (let c = 0; c < maxCols; c += 2) {
 const hdr = header[c];
 if (!hdr) continue;
 
 const { name, category } = parseSubjectHeader(String(hdr));
 const subjectKey = `${name}|${category || ''}`;
 
 let subject = subjectMap.get(subjectKey);
 if (!subject) {
 subject = { id: crypto.randomUUID(), name, category };
 subjectMap.set(subjectKey, subject);
 allSubjects.push(subject);
 subjectsAdded++;
 }

 let order = 1;
 for (let r = 1; r < rows.length; r++) {
 const topicName = rows[r][c];
 const minVal = rows[r][c + 1];
 if (!topicName && !minVal) continue;
 
 const nm = String(topicName ||"").trim();
 if (!nm) continue;
 
 const minutes = Number(minVal || 0) || 0;
 const topicKey = `${subject.id}|${nm}`;
 
 const exists = topicMap.get(topicKey);
 if (exists) {
 exists.avgMinutes = minutes;
 exists.order = order;
 topicsUpdated++;
 } else {
 const newTopic: StudyTopic = {
 id: crypto.randomUUID(),
 subjectId: subject.id,
 name: nm,
 avgMinutes: minutes,
 order,
 };
 topicMap.set(topicKey, newTopic);
 allTopics.push(newTopic);
 topicsAdded++;
 }
 order += 1;
 }
 }

 if (subjectsAdded > 0) {
 await saveSubjects(allSubjects);
 }
 
 if (topicsAdded > 0 || topicsUpdated > 0) {
 await saveTopics(allTopics);
 }

 await Promise.all([
 loadSubjectsAsync(),
 loadTopicsAsync()
 ]);

 setRefresh((x) => x + 1);
 
 const summary = [];
 if (subjectsAdded > 0) summary.push(`${subjectsAdded} ders eklendi`);
 if (topicsAdded > 0) summary.push(`${topicsAdded} konu eklendi`);
 if (topicsUpdated > 0) summary.push(`${topicsUpdated} konu güncellendi`);
 
 toast.success(summary.join(",") ||"İçe aktarım tamamlandı");
 } catch (error) {
 console.error("Excel yükleme hatası:", error);
 toast.error("Excel dosyası yüklenirken hata oluştu");
 } finally {
 setLoading(false);
 }
 };

 const seedExamples = async () => {
 setLoading(true);
 try {
 const currentSubjects = await loadSubjectsAsync();
 const currentTopics = await loadTopicsAsync();
 
 const allSubjects = [...currentSubjects];
 const allTopics = [...currentTopics];
 
 const subjectMap = new Map<string, StudySubject>();
 allSubjects.forEach(s => {
 const key = `${s.name}|${s.category || ''}`;
 subjectMap.set(key, s);
 });

 const ensure = (nm: string, cat?: StudySubject["category"]) => {
 const key = `${nm}|${cat || ''}`;
 let s = subjectMap.get(key);
 if (!s) {
 s = { id: crypto.randomUUID(), name: nm, category: cat };
 subjectMap.set(key, s);
 allSubjects.push(s);
 }
 return s;
 };

 const m = ensure("Matematik","TYT");
 const f = ensure("Fizik","AYT");

 const topicMap = new Map<string, StudyTopic>();
 allTopics.forEach(t => {
 const key = `${t.subjectId}|${t.name}`;
 topicMap.set(key, t);
 });

 const addT = (
 s: StudySubject,
 name: string,
 min: number,
 order: number,
 ) => {
 const key = `${s.id}|${name}`;
 const exists = topicMap.get(key);
 if (!exists) {
 const newTopic: StudyTopic = {
 id: crypto.randomUUID(),
 subjectId: s.id,
 name,
 avgMinutes: min,
 order,
 };
 topicMap.set(key, newTopic);
 allTopics.push(newTopic);
 }
 };

 addT(m,"Sayılar", 60, 1);
 addT(m,"Problemler", 540, 2);
 addT(f,"Elektrik", 120, 1);
 addT(f,"Manyetizma", 90, 2);

 await saveSubjects(allSubjects);
 await saveTopics(allTopics);
 
 await Promise.all([
 loadSubjectsAsync(),
 loadTopicsAsync()
 ]);

 setRefresh((x) => x + 1);
 toast.success("Örnek veriler yüklendi");
 } catch (error) {
 console.error("Örnek veri yükleme hatası:", error);
 toast.error("Örnek veriler yüklenirken hata oluştu");
 } finally {
 setLoading(false);
 }
 };

 return (
 <Card>
 <CardHeader>
 <CardTitle>YKS Ders ve Konuları Yükle</CardTitle>
 <CardDescription>
 Excel ile iki sütunlu gruplar halinde (A/B, C/D, ...) içe aktarın
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 <label className="block">
 <input
 type="file"
 className="hidden"
 accept=".xlsx,.xls"
 onChange={(e) => e.target.files && onFile(e.target.files[0])}
 disabled={loading}
 />
 <Button 
 variant="secondary" 
 className="w-full"
 disabled={loading}
 >
 {loading ?"Yükleniyor..." :"Excel Yükle"}
 </Button>
 </label>
 <Button 
 variant="outline" 
 onClick={seedExamples}
 disabled={loading}
 >
 {loading ?"Yükleniyor..." :"Örnek Verileri Yükle"}
 </Button>
 <div className="text-xs text-muted-foreground">
 Mevcut ders sayısı: {subjects.length} • Konu sayısı: {topics.length}
 </div>
 </CardContent>
 </Card>
 );
}
