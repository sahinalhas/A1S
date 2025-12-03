import { useMemo, useState, useRef, useEffect } from "react";
import type React from "react";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 CardDescription,
} from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Trash2, Undo2, Redo2, History, Download } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/organisms/DropdownMenu";
import {
 loadSubjects,
 getWeeklySlotsByStudent,
 addWeeklySlot,
 removeWeeklySlot,
 updateWeeklySlot,
 WeeklySlot,
 weeklyTotalMinutes,
 saveWeeklySlots,
} from "@/lib/storage";
import { loadStudents } from "@/lib/api/endpoints/students.api";
import { toast } from "sonner";
import { useUndo, formatActionName, formatTime } from "@/hooks/utils/undo.utils";
import ScheduleTemplateDialog from "./ScheduleTemplateDialog";
import { generateWeeklySchedulePDF } from "@/lib/utils/pdf-generator";

const DAYS: { value: 1 | 2 | 3 | 4 | 5 | 6 | 7; label: string }[] = [
 { value: 1, label:"Pazartesi" },
 { value: 2, label:"Salı" },
 { value: 3, label:"Çarşamba" },
 { value: 4, label:"Perşembe" },
 { value: 5, label:"Cuma" },
 { value: 6, label:"Cumartesi" },
 { value: 7, label:"Pazar" },
];

const START_MIN = 7 * 60; // 07:00
const END_MIN = 24 * 60; // 24:00
const STEP = 30; // 30dk
const ROWS = (END_MIN - START_MIN) / STEP; // 34 satır
const ROW_H = 28; // px

function toMin(t: string) {
 const [h, m] = t.split(":").map(Number);
 return h * 60 + m;
}
function fmt(mins: number) {
 const m = Math.max(0, Math.min(mins, END_MIN));
 const h = Math.floor(m / 60);
 const mm = m % 60;
 return `${String(h).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
}
function overlaps(a: WeeklySlot, b: WeeklySlot) {
 if (a.day !== b.day) return false;
 const s1 = toMin(a.start),
 e1 = toMin(a.end);
 const s2 = toMin(b.start),
 e2 = toMin(b.end);
 return Math.max(s1, s2) < Math.min(e1, e2);
}

function canPlace(
 day: 1 | 2 | 3 | 4 | 5 | 6 | 7,
 startMin: number,
 duration: number,
 slots: WeeklySlot[]
): boolean {
 if (startMin < START_MIN || startMin % STEP !== 0) return false;
 const endMin = startMin + duration;
 if (endMin > END_MIN || duration < STEP) return false;
 
 const testSlot: WeeklySlot = {
 id:"test",
 studentId:"test",
 day,
 start: fmt(startMin),
 end: fmt(endMin)
 } as WeeklySlot;
 
 return !slots.some(s => overlaps(s, testSlot));
}

function findNearestEmptyCells(
 targetDay: 1 | 2 | 3 | 4 | 5 | 6 | 7,
 targetMin: number,
 duration: number,
 slots: WeeklySlot[],
 limit = 3
): SuggestedCell[] {
 const candidates: SuggestedCell[] = [];
 
 for (let day = 1; day <= 7; day++) {
 for (let min = START_MIN; min <= END_MIN - duration; min += STEP) {
 if (canPlace(day as 1 | 2 | 3 | 4 | 5 | 6 | 7, min, duration, slots)) {
 candidates.push({ 
 day: day as 1 | 2 | 3 | 4 | 5 | 6 | 7, 
 startMin: min 
 });
 }
 }
 }
 
 return candidates
 .sort((a, b) => {
 const distA = Math.abs((a.day - targetDay) * 1440) + Math.abs(a.startMin - targetMin);
 const distB = Math.abs((b.day - targetDay) * 1440) + Math.abs(b.startMin - targetMin);
 return distA - distB;
 })
 .slice(0, limit);
}

type SuggestedCell = { day: 1 | 2 | 3 | 4 | 5 | 6 | 7; startMin: number };

export default function WeeklySchedule({ sid }: { sid: string }) {
 const [subjects, setSubjects] = useState<Awaited<ReturnType<typeof loadSubjects>>>([]);
 const [error, setError] = useState("");
 const [selectedCategory, setSelectedCategory] = useState<"LGS" |"YKS" |"TYT" |"AYT" |"YDT" |"Okul dersleri">("Okul dersleri");
 const [suggestedCells, setSuggestedCells] = useState<SuggestedCell[]>([]);
 const calendarRef = useRef<HTMLDivElement | null>(null);
 const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

 const {
 state: slots,
 push: pushHistory,
 undo,
 redo,
 canUndo,
 canRedo,
 history
 } = useUndo<WeeklySlot[]>([], 30);

 useEffect(() => {
 setSubjects(loadSubjects());
 
 const handleUpdate = () => setSubjects(loadSubjects());
 window.addEventListener('subjectsUpdated', handleUpdate);
 return () => window.removeEventListener('subjectsUpdated', handleUpdate);
 }, []);

 useEffect(() => {
 const initialSlots = getWeeklySlotsByStudent(sid).slice().sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
 pushHistory(initialSlots, 'load', true);
 }, [sid, pushHistory]);

 useEffect(() => {
 const handleSlotsUpdate = () => {
 const updatedSlots = getWeeklySlotsByStudent(sid).slice().sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
 pushHistory(updatedSlots, 'update', true);
 };
 
 window.addEventListener('weeklySlotsUpdated', handleSlotsUpdate);
 return () => window.removeEventListener('weeklySlotsUpdated', handleSlotsUpdate);
 }, [sid, pushHistory]);

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
 e.preventDefault();
 if (canUndo) {
 const prevState = undo();
 saveWeeklySlots(prevState).catch(console.error);
 toast.info("Son işlem geri alındı", {
 action: {
 label:"Tekrarla",
 onClick: () => {
 if (canRedo) {
 const nextState = redo();
 saveWeeklySlots(nextState).catch(console.error);
 }
 }
 }
 });
 }
 } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
 e.preventDefault();
 if (canRedo) {
 const nextState = redo();
 saveWeeklySlots(nextState).catch(console.error);
 toast.success("İşlem tekrar uygulandı");
 }
 }
 };
 
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, [undo, redo, canUndo, canRedo]);

 const sortedSlots = useMemo(
 () => slots.slice().sort((a, b) => a.day - b.day || a.start.localeCompare(b.start)),
 [slots]
 );

 const totalMin = useMemo(() => {
 return sortedSlots.reduce((sum, slot) => {
 const start = toMin(slot.start);
 const end = toMin(slot.end);
 return sum + (end - start);
 }, 0);
 }, [sortedSlots]);
 
 const warnLow = totalMin < 5 * 60;
 const warnHigh = totalMin > 10 * 60;

 const filteredSubjects = useMemo(() => {
 if (selectedCategory ==="Okul dersleri") {
 return subjects.filter((s) => !s.category);
 }
 return subjects.filter((s) => s.category === selectedCategory);
 }, [subjects, selectedCategory]);

 const onDragStart = (e: React.DragEvent, subjectId: string) => {
 e.dataTransfer.setData("text/plain", subjectId);
 e.dataTransfer.effectAllowed ="copy";
 (window as any)._dragSubjectId = subjectId;
 };

 const dropOn = (day: 1 | 2 | 3 | 4 | 5 | 6 | 7, startMin: number) => {
 setError("");
 const moving = (window as any)._dragSlotMove as
 | { id: string; duration: number }
 | undefined;

 if (moving) {
 const existing = sortedSlots.find((s) => s.id === moving.id);
 if (!existing) return;
 const duration = Math.max(
 STEP,
 Math.round(moving.duration / STEP) * STEP,
 );
 let start = Math.max(START_MIN, Math.min(startMin, END_MIN - STEP));
 let end = Math.min(start + duration, END_MIN);
 if (end - start < duration)
 start = Math.max(START_MIN, END_MIN - duration);
 const candidate: WeeklySlot = {
 ...existing,
 day,
 start: fmt(start),
 end: fmt(end),
 };
 for (const s of sortedSlots) {
 if (s.id !== existing.id && overlaps(s, candidate)) {
 const suggested = findNearestEmptyCells(day, start, duration, sortedSlots.filter(sl => sl.id !== existing.id));
 
 if (suggestionTimeoutRef.current) {
 clearTimeout(suggestionTimeoutRef.current);
 }
 setSuggestedCells(suggested);
 
 const suggestions = suggested.slice(0, 3).map(c => {
 const dLabel = DAYS.find(d => d.value === c.day)?.label ||"";
 return `${dLabel} ${fmt(c.startMin)}`;
 }).join(",");
 
 toast.error("Bu saatte başka bir ders var!", {
 description: suggestions ? `Önerilen saatler: ${suggestions}` :"Boş saat bulunamadı",
 action: suggested.length > 0 ? {
 label:"Otomatik Yerleştir",
 onClick: () => {
 const first = suggested[0];
 const endMin = Math.min(first.startMin + duration, END_MIN);
 if (canPlace(first.day, first.startMin, duration, sortedSlots.filter(sl => sl.id !== existing.id))) {
 const updatedSlots = sortedSlots.map(s => 
 s.id === existing.id ? {
 ...s,
 day: first.day,
 start: fmt(first.startMin),
 end: fmt(endMin)
 } : s
 );
 pushHistory(updatedSlots, 'move');
 updateWeeklySlot(existing.id, {
 day: first.day,
 start: fmt(first.startMin),
 end: fmt(endMin),
 subjectId: existing.subjectId,
 studentId: existing.studentId,
 });
 setSuggestedCells([]);
 if (suggestionTimeoutRef.current) {
 clearTimeout(suggestionTimeoutRef.current);
 }
 } else {
 toast.error("Seçilen saat artık uygun değil");
 }
 }
 } : undefined,
 duration: 5000
 });
 
 suggestionTimeoutRef.current = setTimeout(() => setSuggestedCells([]), 5000);
 return;
 }
 }
 const updatedSlots = sortedSlots.map(s => 
 s.id === existing.id ? candidate : s
 );
 pushHistory(updatedSlots, 'move');
 updateWeeklySlot(existing.id, {
 day,
 start: candidate.start,
 end: candidate.end,
 subjectId: existing.subjectId,
 studentId: existing.studentId,
 });
 (window as any)._dragSlotMove = undefined;
 return;
 }

 const subjectId = (window as any)._dragSubjectId as string | undefined;
 const chosen = subjectId && subjects.find((s) => s.id === subjectId);
 if (!chosen) {
 setError("Lütfen bir dersi sürükleyin");
 return;
 }
 const defaultDur = 60; // dk
 let start = Math.max(START_MIN, Math.min(startMin, END_MIN - STEP));
 let end = Math.min(start + defaultDur, END_MIN);
 if (end - start < defaultDur) {
 start = Math.max(START_MIN, END_MIN - defaultDur);
 end = Math.min(start + defaultDur, END_MIN);
 }
 const w: WeeklySlot = {
 id: crypto.randomUUID(),
 studentId: sid,
 day,
 start: fmt(start),
 end: fmt(end),
 subjectId: chosen.id,
 };
 for (const s of sortedSlots) {
 if (overlaps(s, w)) {
 const suggested = findNearestEmptyCells(day, start, defaultDur, sortedSlots);
 
 if (suggestionTimeoutRef.current) {
 clearTimeout(suggestionTimeoutRef.current);
 }
 setSuggestedCells(suggested);
 
 const suggestions = suggested.slice(0, 3).map(c => {
 const dLabel = DAYS.find(d => d.value === c.day)?.label ||"";
 return `${dLabel} ${fmt(c.startMin)}`;
 }).join(",");
 
 toast.error("Bu saatte başka bir ders var!", {
 description: suggestions ? `Önerilen saatler: ${suggestions}` :"Boş saat bulunamadı",
 action: suggested.length > 0 ? {
 label:"Otomatik Yerleştir",
 onClick: () => {
 const first = suggested[0];
 const endMin = Math.min(first.startMin + defaultDur, END_MIN);
 if (canPlace(first.day, first.startMin, defaultDur, sortedSlots)) {
 const newSlot: WeeklySlot = {
 id: crypto.randomUUID(),
 studentId: sid,
 day: first.day,
 start: fmt(first.startMin),
 end: fmt(endMin),
 subjectId: chosen.id,
 };
 const newSlots = [...sortedSlots, newSlot];
 pushHistory(newSlots, 'add');
 addWeeklySlot(newSlot);
 setSuggestedCells([]);
 if (suggestionTimeoutRef.current) {
 clearTimeout(suggestionTimeoutRef.current);
 }
 } else {
 toast.error("Seçilen saat artık uygun değil");
 }
 }
 } : undefined,
 duration: 5000
 });
 
 suggestionTimeoutRef.current = setTimeout(() => setSuggestedCells([]), 5000);
 return;
 }
 }
 const newSlots = [...sortedSlots, w];
 pushHistory(newSlots, 'add');
 addWeeklySlot(w);
 };

 const onCellDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 const dt = e.dataTransfer.getData("text/plain");
 if (dt && !dt.startsWith("move-slot:")) (window as any)._dragSubjectId = dt;
 };

 const resizingRef = useRef<null | {
 id: string;
 edge:"top" |"bottom";
 startY: number;
 origStart: number;
 origEnd: number;
 day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
 minStart: number; // lower bound for start when resizing top
 maxEnd: number; // upper bound for end when resizing bottom
 studentId: string;
 subjectId: string;
 }>(null);
 const appliedRef = useRef<{ id: string; start: number; end: number } | null>(
 null,
 );

 const onPointerMove = (ev: PointerEvent) => {
 const st = resizingRef.current;
 if (!st) return;
 const dy = ev.clientY - st.startY;
 const deltaRows = Math.round(dy / ROW_H);

 if (st.edge ==="top") {
 let newStart = st.origStart + deltaRows * STEP;
 newStart = Math.max(st.minStart, Math.min(newStart, st.origEnd - STEP));
 if (!appliedRef.current)
 appliedRef.current = {
 id: st.id,
 start: st.origStart,
 end: st.origEnd,
 };
 if (appliedRef.current.start !== newStart) {
 updateWeeklySlot(st.id, {
 day: st.day,
 start: fmt(newStart),
 end: fmt(st.origEnd),
 studentId: st.studentId,
 subjectId: st.subjectId,
 });
 appliedRef.current.start = newStart;
 }
 } else {
 let newEnd = st.origEnd + deltaRows * STEP;
 newEnd = Math.min(st.maxEnd, Math.max(newEnd, st.origStart + STEP));
 if (!appliedRef.current)
 appliedRef.current = {
 id: st.id,
 start: st.origStart,
 end: st.origEnd,
 };
 if (appliedRef.current.end !== newEnd) {
 updateWeeklySlot(st.id, {
 day: st.day,
 start: fmt(st.origStart),
 end: fmt(newEnd),
 studentId: st.studentId,
 subjectId: st.subjectId,
 });
 appliedRef.current.end = newEnd;
 }
 }
 };
 const onPointerUp = () => {
 window.removeEventListener("pointermove", onPointerMove);
 window.removeEventListener("pointerup", onPointerUp);
 window.removeEventListener("pointercancel", onPointerUp);
 
 if (appliedRef.current && resizingRef.current) {
 const updatedSlots = sortedSlots.map(s => 
 s.id === appliedRef.current!.id ? {
 ...s,
 start: fmt(appliedRef.current!.start),
 end: fmt(appliedRef.current!.end)
 } : s
 );
 pushHistory(updatedSlots, 'resize');
 
 setTimeout(() => {
 saveWeeklySlots(updatedSlots).catch(console.error);
 }, 100);
 }
 
 resizingRef.current = null;
 appliedRef.current = null;
 };
 const startResize = (
 slot: WeeklySlot,
 edge:"top" |"bottom",
 e: React.PointerEvent,
 ) => {
 e.preventDefault();
 e.stopPropagation();
 const origStart = toMin(slot.start);
 const origEnd = toMin(slot.end);
 let minStart = START_MIN;
 let maxEnd = END_MIN;
 const sameDayOthers = slots.filter(
 (x) => x.day === slot.day && x.id !== slot.id,
 );
 for (const o of sameDayOthers) {
 const oEnd = toMin(o.end);
 if (oEnd <= origStart && oEnd > minStart) minStart = oEnd;
 }
 for (const o of sameDayOthers) {
 const oStart = toMin(o.start);
 if (oStart >= origEnd && oStart < maxEnd) maxEnd = oStart;
 }
 resizingRef.current = {
 id: slot.id,
 edge,
 startY: e.clientY,
 origStart,
 origEnd,
 day: slot.day,
 minStart,
 maxEnd,
 studentId: slot.studentId,
 subjectId: slot.subjectId,
 };
 appliedRef.current = { id: slot.id, start: origStart, end: origEnd };
 window.addEventListener("pointermove", onPointerMove);
 window.addEventListener("pointerup", onPointerUp);
 window.addEventListener("pointercancel", onPointerUp);
 };

 const handleExportPDF = async () => {
 try {
 const students = loadStudents();
 const student = students.find(s => s.id === sid);
 const fullName = student ? `${student.name || ''} ${student.surname || ''}`.trim() : undefined;
 await generateWeeklySchedulePDF(sortedSlots, subjects, totalMin, sid, fullName, fullName, { download: true, print: false });
 toast.success("PDF başarıyla indirildi");
 } catch (error) {
 console.error('PDF oluşturma hatası:', error);
 toast.error("PDF oluşturulurken hata oluştu");
 }
 };

 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle>Haftalık Ders Çizelgesi</CardTitle>
 <CardDescription>
 Takvim 1 — Üstten dersi sürükleyip gün/saat alanına bırakın
 </CardDescription>
 </div>
 
 <div className="flex gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={handleExportPDF}
 disabled={sortedSlots.length === 0}
 title="Çizelgeyi PDF olarak indir"
 >
 <Download className="h-4 w-4 mr-2" />
 PDF İndir
 </Button>
 
 <ScheduleTemplateDialog
 studentId={sid}
 onApplied={() => {
 const updatedSlots = getWeeklySlotsByStudent(sid).slice().sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
 pushHistory(updatedSlots, 'template');
 }}
 />
 
 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 const prevState = undo();
 saveWeeklySlots(prevState).catch(console.error);
 toast.info("Son işlem geri alındı");
 }}
 disabled={!canUndo}
 title="Geri Al (Ctrl+Z)"
 >
 <Undo2 className="h-4 w-4" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 const nextState = redo();
 saveWeeklySlots(nextState).catch(console.error);
 toast.success("İşlem tekrar uygulandı");
 }}
 disabled={!canRedo}
 title="Tekrarla (Ctrl+Y)"
 >
 <Redo2 className="h-4 w-4" />
 </Button>
 
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="outline" size="sm" title="İşlem Geçmişi">
 <History className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-64">
 <DropdownMenuLabel>İşlem Geçmişi</DropdownMenuLabel>
 <DropdownMenuSeparator />
 {history.slice().reverse().map((entry, i) => (
 <DropdownMenuItem key={i}>
 <span className="text-xs text-muted-foreground">
 {formatActionName(entry.action)} - {formatTime(entry.timestamp)}
 </span>
 </DropdownMenuItem>
 ))}
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-3">
 <div className="flex flex-wrap gap-2">
 <Button
 size="sm"
 variant={selectedCategory ==="Okul dersleri" ?"default" :"outline"}
 onClick={() => setSelectedCategory("Okul dersleri")}
 >
 Okul dersleri
 </Button>
 <Button
 size="sm"
 variant={selectedCategory ==="LGS" ?"default" :"outline"}
 onClick={() => setSelectedCategory("LGS")}
 >
 LGS
 </Button>
 <Button
 size="sm"
 variant={selectedCategory ==="TYT" ?"default" :"outline"}
 onClick={() => setSelectedCategory("TYT")}
 >
 TYT
 </Button>
 <Button
 size="sm"
 variant={selectedCategory ==="AYT" ?"default" :"outline"}
 onClick={() => setSelectedCategory("AYT")}
 >
 AYT
 </Button>
 <Button
 size="sm"
 variant={selectedCategory ==="YDT" ?"default" :"outline"}
 onClick={() => setSelectedCategory("YDT")}
 >
 YDT
 </Button>
 </div>

 <div className="flex flex-wrap gap-2">
 {subjects.length === 0 && (
 <div className="text-sm text-muted-foreground">
 Önce dersleri yükleyin.
 </div>
 )}
 {filteredSubjects.length === 0 && subjects.length > 0 && (
 <div className="text-sm text-muted-foreground">
 Bu kategoride ders bulunamadı.
 </div>
 )}
 {filteredSubjects.map((s) => (
 <Badge
 key={s.id}
 variant="secondary"
 draggable
 onDragStart={(e) => onDragStart(e, s.id)}
 className="cursor-grab select-none"
 title={`${s.name}${s.category ? ` (${s.category})` :""} — sürükleyin`}
 >
 {s.name}
 {s.category ? ` (${s.category})` :""}
 </Badge>
 ))}
 </div>
 </div>

 {error && <div className="text-sm text-red-600">{error}</div>}

 <div ref={calendarRef} className="w-full overflow-auto rounded border">
 {/* Header */}
 <div
 className="grid"
 style={{
 gridTemplateColumns: `72px repeat(7, minmax(60px, 1fr))`,
 }}
 >
 <div className="p-2 text-xs text-muted-foreground border-b bg-muted/40">
 Saat
 </div>
 {DAYS.map((d) => (
 <div
 key={d.value}
 className="p-2 text-xs font-medium border-b bg-muted/40"
 >
 {d.label}
 </div>
 ))}
 </div>
 {/* Body */}
 <div className="relative">
 <div
 className="grid"
 style={{
 gridTemplateColumns: `72px repeat(7, minmax(60px, 1fr))`,
 }}
 >
 {/* Time labels */}
 <div className="relative">
 {[...Array(ROWS + 1)].map((_, i) => {
 const m = START_MIN + i * STEP;
 const isHour = m % 60 === 0;
 return (
 <div key={i} style={{ height: ROW_H }} className="relative">
 {isHour && (
 <div className="absolute -translate-y-1/2 top-1/2 right-2 text-[11px] text-muted-foreground">
 {fmt(m)}
 </div>
 )}
 </div>
 );
 })}
 </div>
 {/* Day columns with drop zones */}
 {DAYS.map((d) => (
 <div key={d.value} className="relative">
 {[...Array(ROWS)].map((_, ri) => {
 const m = START_MIN + ri * STEP;
 const isSuggested = suggestedCells.some(c => c.day === d.value && c.startMin === m);
 return (
 <div
 key={ri}
 onDragOver={(e) => onCellDragOver(e)}
 onDrop={(e) => {
 const dt = e.dataTransfer.getData("text/plain");
 if (dt?.startsWith("move-slot:")) {
 const id = dt.slice(10);
 const sl = slots.find((x) => x.id === id);
 if (sl) {
 (window as any)._dragSlotMove = {
 id,
 duration: Math.max(
 0,
 toMin(sl.end) - toMin(sl.start),
 ),
 };
 }
 } else if (dt) {
 (window as any)._dragSubjectId = dt;
 }
 dropOn(d.value, m);
 }}
 style={{ height: ROW_H }}
 className={`border-t border-l last:border-r ${
 isSuggested ?" bg-blue-100 dark:bg-blue-900/30" :""
 }`}
 />
 );
 })}

 {/* Render slots for this day as absolute blocks */}
 <div className="absolute inset-0 pointer-events-none">
 {slots
 .filter((s) => s.day === d.value)
 .map((s) => {
 const top =
 ((toMin(s.start) - START_MIN) / STEP) * ROW_H;
 const height =
 (Math.max(0, toMin(s.end) - toMin(s.start)) / STEP) *
 ROW_H;
 const subj = subjects.find((x) => x.id === s.subjectId);
 return (
 <div
 key={s.id}
 style={{ top, height }}
 className="absolute left-2 right-2 rounded bg-primary/15 border border-primary/30 text-xs p-2 pr-8 flex items-center gap-2 backdrop-blur pointer-events-auto cursor-move"
 draggable
 onDragStart={(e) => {
 e.dataTransfer.effectAllowed ="move";
 e.dataTransfer.setData(
"text/plain",
 `move-slot:${s.id}`,
 );
 }}
 onDragEnd={() => {
 (window as any)._dragSlotMove = undefined;
 }}
 >
 {/* Resize handles */}
 <div
 className="absolute left-0 right-0 h-2 top-0"
 style={{ cursor:"n-resize" }}
 data-role="resize-top"
 onPointerDown={(e) => startResize(s,"top", e)}
 title="Üstten sürükleyerek kısalt/uzat (30dk)"
 />
 <div
 className="absolute left-0 right-0 h-2 bottom-0"
 style={{ cursor:"s-resize" }}
 data-role="resize-bottom"
 onPointerDown={(e) => startResize(s,"bottom", e)}
 title="Alttan sürükleyerek kısalt/uzat (30dk)"
 />

 <div className="min-w-0">
 <div className="font-medium truncate">
 {subj?.name}
 {subj?.category ? ` (${subj.category})` :""}
 </div>
 <div className="text-[11px] text-muted-foreground">
 {s.start} – {s.end}
 </div>
 </div>
 <Button
 size="icon"
 variant="outline"
 aria-label="Kaldır"
 title="Kaldır"
 className="absolute top-1 right-1 h-7 w-7 p-0"
 onClick={() => {
 const newSlots = sortedSlots.filter(slot => slot.id !== s.id);
 pushHistory(newSlots, 'remove');
 removeWeeklySlot(s.id);
 }}
 >
 <Trash2 className="h-3.5 w-3.5" />
 </Button>
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>
 
 {/* Hour separator lines */}
 {[...Array(Math.floor((END_MIN - START_MIN) / 60) + 1)].map((_, i) => {
 const hourMin = START_MIN + i * 60;
 if (hourMin > START_MIN && hourMin <= END_MIN) {
 const top = ((hourMin - START_MIN) / STEP) * ROW_H;
 return (
 <div
 key={`hour-${hourMin}`}
 className="absolute left-0 right-0 border-t-2 border-border/60 pointer-events-none"
 style={{ top }}
 />
 );
 }
 return null;
 })}
 </div>
 </div>

 <div className="text-sm">
 Haftalık toplam:{""}
 <span className="font-medium">
 {Math.round((totalMin / 60) * 10) / 10} saat
 </span>
 {warnLow && (
 <span className="ml-2 text-amber-600">
 Çalışma süren çok düşük!
 </span>
 )}
 {warnHigh && (
 <span className="ml-2 text-red-600">Plan çok yoğun!</span>
 )}
 </div>
 </CardContent>
 </Card>
 );
}
