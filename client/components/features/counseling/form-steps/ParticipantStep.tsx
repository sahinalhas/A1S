import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Check, ChevronDown, Users as UsersIcon, Search, UserCircle2, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/organisms/Popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/organisms/Command";

import type { IndividualSessionFormValues, GroupSessionFormValues, Student } from "../types";
import StudentInsightCard from "../form-widgets/StudentInsightCard";
import { getStudentSessionHistory } from "@/lib/api/endpoints/counseling.api";

interface ParticipantStepProps {
 form: UseFormReturn<any>;
 students: Student[];
 sessionType: 'individual' | 'group';
 selectedStudents?: Student[];
 onSelectedStudentsChange?: (students: Student[]) => void;
}

export default function ParticipantStep({ 
 form, 
 students, 
 sessionType,
 selectedStudents = [],
 onSelectedStudentsChange
}: ParticipantStepProps) {
 const [studentSearchOpen, setStudentSearchOpen] = useState(false);
 const [studentSessionCount, setStudentSessionCount] = useState(0);
 const [lastSession, setLastSession] = useState<{ date: string; topic: string } | undefined>();

 const participantType = form.watch("participantType");

 const selectedStudentId = sessionType === 'individual' ? (form.watch("studentId") as string) : null;
 const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) : null;

 useEffect(() => {
 if (selectedStudentId) {
 getStudentSessionHistory(selectedStudentId).then((stats) => {
 setStudentSessionCount(stats.sessionCount);
 if (stats.lastSessionDate && stats.history.length > 0) {
 setLastSession({
 date: stats.lastSessionDate,
 topic: stats.history[0].topic
 });
 } else {
 setLastSession(undefined);
 }
 }).catch(() => {
 setStudentSessionCount(0);
 setLastSession(undefined);
 });
 } else {
 setStudentSessionCount(0);
 setLastSession(undefined);
 }
 }, [selectedStudentId]);

 return (
 <div className="space-y-5 fade-in-50 slide-in-from-bottom-4">
 <div className="relative pb-3">
 <div className="flex items-center gap-3">
 <div className="relative">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-md opacity-20" />
 <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
 <UserCircle2 className="h-5 w-5 text-white" />
 </div>
 </div>
 <div>
 <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
 Katılımcı Bilgileri
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 {sessionType === 'individual' ? 'Öğrenci ve katılımcı bilgilerini girin' : 'Öğrencileri ve katılımcı bilgilerini girin'}
 </p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
 <div className="lg:col-span-2 space-y-4">
 {/* Öğrenci Seçimi ve Katılımcı Tipi - Yan Yana */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Öğrenci Seçimi */}
 {sessionType === 'individual' ? (
 <FormField
 control={form.control}
 name="studentId"
 render={({ field }) => (
 <FormItem className="flex flex-col">
 <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <Search className="h-3.5 w-3.5 text-blue-500" />
 Öğrenci Seçin <span className="text-rose-500">*</span>
 </FormLabel>
 <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
 <PopoverTrigger asChild>
 <FormControl>
 <Button
 type="button"
 variant="outline"
 role="combobox"
 className={cn(
"justify-between h-10 text-left font-normal rounded-lg border bg-white dark:bg-slate-900 dark:",
 !field.value &&"text-slate-400"
 )}
 >
 <div className="flex items-center gap-2">
 <Search className="h-4 w-4 text-slate-400" />
 {field.value
 ? (() => {
 const student = students.find((s) => s.id === field.value);
 return student ? `${student.name} ${student.surname}` :"Öğrenci ara...";
 })()
 :"Öğrenci ara..."}
 </div>
 <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
 </Button>
 </FormControl>
 </PopoverTrigger>
 <PopoverContent className="w-[450px] p-0 rounded-lg border">
 <Command>
 <CommandInput placeholder="Öğrenci ara..." className="h-10" />
 <CommandList className="max-h-[320px]">
 <CommandEmpty>Öğrenci bulunamadı.</CommandEmpty>
 <CommandGroup>
 {students.map((student) => (
 <CommandItem
 key={student.id}
 value={`${student.id} ${student.name} ${student.surname} ${student.class}`}
 onSelect={() => {
 field.onChange(student.id);
 setStudentSearchOpen(false);
 }}
 className="py-2 px-3 dark:"
 >
 <Check
 className={cn(
"mr-2 h-4 w-4 text-blue-500",
 field.value === student.id ?"opacity-100" :"opacity-0"
 )}
 />
 <div>
 <p className="font-medium text-sm text-slate-700 dark:text-slate-200">{student.name} {student.surname}</p>
 <p className="text-xs text-slate-500 dark:text-slate-400">No: {student.id} • {student.class}</p>
 </div>
 </CommandItem>
 ))}
 </CommandGroup>
 </CommandList>
 </Command>
 </PopoverContent>
 </Popover>
 <FormMessage />
 </FormItem>
 )}
 />
 ) : (
 <FormField
 control={form.control}
 name="studentIds"
 render={({ field }) => (
 <FormItem className="flex flex-col">
 <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <UsersIcon className="h-3.5 w-3.5 text-blue-500" />
 Öğrenciler <span className="text-rose-500">*</span> 
 <span className="text-xs text-slate-500 ml-1">({selectedStudents.length} seçili)</span>
 </FormLabel>
 <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
 <PopoverTrigger asChild>
 <FormControl>
 <Button
 type="button"
 variant="outline"
 role="combobox"
 className="justify-between h-10 text-left font-normal rounded-lg border bg-white dark:bg-slate-900 dark:"
 >
 <div className="flex items-center gap-2">
 <Search className="h-4 w-4 text-slate-400" />
 {selectedStudents.length > 0
 ? `${selectedStudents.length} öğrenci seçildi`
 :"Öğrenci seçin..."}
 </div>
 <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
 </Button>
 </FormControl>
 </PopoverTrigger>
 <PopoverContent className="w-[450px] p-0 rounded-lg border">
 <Command>
 <CommandInput placeholder="Öğrenci ara..." className="h-10" />
 <CommandList className="max-h-[320px]">
 <CommandEmpty>Öğrenci bulunamadı.</CommandEmpty>
 <CommandGroup>
 {students.map((student) => {
 const isSelected = selectedStudents.some(s => s.id === student.id);
 return (
 <CommandItem
 key={student.id}
 value={`${student.id} ${student.name} ${student.surname} ${student.class}`}
 onSelect={() => {
 if (!onSelectedStudentsChange) return;

 const newStudents = isSelected
 ? selectedStudents.filter(s => s.id !== student.id)
 : [...selectedStudents, student];

 onSelectedStudentsChange(newStudents);
 field.onChange(newStudents.map(s => s.id));
 }}
 className="py-2 px-3 dark:"
 >
 <Check
 className={cn(
"mr-2 h-4 w-4 text-blue-500",
 isSelected ?"opacity-100" :"opacity-0"
 )}
 />
 <div>
 <p className="font-medium text-sm text-slate-700 dark:text-slate-200">{student.name} {student.surname}</p>
 <p className="text-xs text-slate-500 dark:text-slate-400">No: {student.id} • {student.class}</p>
 </div>
 </CommandItem>
 );
 })}
 </CommandGroup>
 </CommandList>
 </Command>
 </PopoverContent>
 </Popover>
 <FormMessage />
 </FormItem>
 )}
 />
 )}

 {/* Katılımcı Tipi */}
 <FormField
 control={form.control}
 name="participantType"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
 Katılımcı Tipi
 </FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value ||"öğrenci"}>
 <FormControl>
 <SelectTrigger className="h-10 rounded-lg bg-white dark:bg-slate-900 dark:">
 <SelectValue />
 </SelectTrigger>
 </FormControl>
 <SelectContent className="rounded-lg">
 <SelectItem value="öğrenci">Öğrenci</SelectItem>
 <SelectItem value="veli">Veli</SelectItem>
 <SelectItem value="öğretmen">Öğretmen</SelectItem>
 <SelectItem value="diğer">Diğer</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 {/* Grup Adı (sadece grup görüşmeleri için) */}
 {sessionType === 'group' && (
 <FormField
 control={form.control}
 name="groupName"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <UsersIcon className="h-3.5 w-3.5 text-purple-500" />
 Grup Adı <span className="text-xs text-slate-400 font-normal ml-1">(İsteğe Bağlı)</span>
 </FormLabel>
 <FormControl>
 <Input 
 {...field} 
 placeholder="Örn: 9-A Sınıfı Akran Arabuluculuğu" 
 className="h-10 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 )}

 {/* Veli Bilgileri */}
 {participantType ==="veli" && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 border border-blue-200 dark:border-blue-800/50 rounded-lg bg-gradient-to-br from-blue-50/50 to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/10 fade-in-50 slide-in-from-top-2">
 <FormField
 control={form.control}
 name="parentName"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
 Veli Adı <span className="text-rose-500">*</span>
 </FormLabel>
 <FormControl>
 <Input {...field} placeholder="Ad Soyad" className="h-10 rounded-lg bg-white dark:bg-slate-900" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 <FormField
 control={form.control}
 name="parentRelationship"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
 Yakınlık <span className="text-rose-500">*</span>
 </FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger className="h-10 rounded-lg bg-white dark:bg-slate-900">
 <SelectValue placeholder="Seçin" />
 </SelectTrigger>
 </FormControl>
 <SelectContent className="rounded-lg">
 <SelectItem value="anne">Anne</SelectItem>
 <SelectItem value="baba">Baba</SelectItem>
 <SelectItem value="vasi">Vasi</SelectItem>
 <SelectItem value="diger_aile">Diğer Aile</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 )}

 {/* Öğretmen Bilgileri */}
 {participantType ==="öğretmen" && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 border border-emerald-200 dark:border-emerald-800/50 rounded-lg bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 fade-in-50 slide-in-from-top-2">
 <FormField
 control={form.control}
 name="teacherName"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
 Öğretmen Adı <span className="text-rose-500">*</span>
 </FormLabel>
 <FormControl>
 <Input {...field} placeholder="Ad Soyad" className="h-10 rounded-lg bg-white dark:bg-slate-900" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 <FormField
 control={form.control}
 name="teacherBranch"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Branş</FormLabel>
 <FormControl>
 <Input {...field} placeholder="Örn: Matematik" className="h-10 rounded-lg bg-white dark:bg-slate-900" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 )}

 {/* Diğer Katılımcı */}
 {participantType ==="diğer" && (
 <div className="p-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 fade-in-50 slide-in-from-top-2">
 <FormField
 control={form.control}
 name="otherParticipantDescription"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
 Katılımcı Açıklaması <span className="text-rose-500">*</span>
 </FormLabel>
 <FormControl>
 <Input {...field} placeholder="Katılımcı hakkında bilgi" className="h-10 rounded-lg bg-white dark:bg-slate-900" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 )}
 </div>

 {/* Öğrenci İçgörü Kartı */}
 {sessionType === 'individual' && selectedStudent && (
 <div className="lg:col-span-1">
 <StudentInsightCard
 studentName={`${selectedStudent.name} ${selectedStudent.surname}`}
 className={selectedStudent.class}
 totalSessions={studentSessionCount}
 lastSession={lastSession}
 />
 </div>
 )}
 </div>
 </div>
 );
}
