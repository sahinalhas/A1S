import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Check, ChevronDown, Users as UsersIcon, Search, UserCircle2, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
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
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 pb-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <UserCircle2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-sm text-slate-800 dark:text-slate-100">
            Katılımcı Bilgileri
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {sessionType === 'individual' ? 'Öğrenci ve katılımcı bilgilerini girin' : 'Öğrencileri seçin'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sessionType === 'individual' ? (
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Search className="h-3 w-3 text-blue-500" />
                      Öğrenci <span className="text-rose-500">*</span>
                    </FormLabel>
                    <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between h-9 text-left font-normal text-sm rounded-lg border bg-white dark:bg-slate-900",
                              !field.value && "text-slate-400"
                            )}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {field.value
                                  ? (() => {
                                      const student = students.find((s) => s.id === field.value);
                                      return student ? `${student.name} ${student.surname}` : "Öğrenci ara...";
                                    })()
                                  : "Öğrenci ara..."}
                              </span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="p-0 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-900"
                        align="start"
                        sideOffset={4}
                        style={{ width: 'var(--radix-popover-trigger-width)' }}
                      >
                        <Command className="rounded-xl">
                          <CommandInput placeholder="Öğrenci ara..." className="h-10 text-sm border-b border-slate-100 dark:border-slate-800" />
                          <CommandList className="max-h-[240px] overflow-y-auto">
                            <CommandEmpty className="py-6 text-sm text-center text-slate-500">Öğrenci bulunamadı.</CommandEmpty>
                            <CommandGroup className="p-1">
                              {students.map((student) => (
                                <CommandItem
                                  key={student.id}
                                  value={`${student.id} ${student.name} ${student.surname} ${student.class}`}
                                  onSelect={() => {
                                    field.onChange(student.id);
                                    setStudentSearchOpen(false);
                                  }}
                                  className={cn(
                                    "py-2.5 px-3 rounded-lg cursor-pointer transition-colors",
                                    field.value === student.id 
                                      ? "bg-purple-50 dark:bg-purple-900/20" 
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                  )}
                                >
                                  <div className={cn(
                                    "flex items-center justify-center w-5 h-5 mr-2.5 rounded-full border-2 transition-colors",
                                    field.value === student.id 
                                      ? "border-purple-500 bg-purple-500" 
                                      : "border-slate-300 dark:border-slate-600"
                                  )}>
                                    {field.value === student.id && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{student.name} {student.surname}</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{student.class}</p>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="studentIds"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <UsersIcon className="h-3 w-3 text-blue-500" />
                      Öğrenciler <span className="text-rose-500">*</span>
                      <span className="text-[10px] text-slate-400 ml-1">({selectedStudents.length})</span>
                    </FormLabel>
                    <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-9 text-left font-normal text-sm rounded-lg border bg-white dark:bg-slate-900"
                          >
                            <div className="flex items-center gap-1.5">
                              <Search className="h-3.5 w-3.5 text-slate-400" />
                              {selectedStudents.length > 0
                                ? `${selectedStudents.length} öğrenci seçildi`
                                : "Öğrenci seçin..."}
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="p-0 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-900"
                        align="start"
                        sideOffset={4}
                        style={{ width: 'var(--radix-popover-trigger-width)' }}
                      >
                        <Command className="rounded-xl">
                          <CommandInput placeholder="Öğrenci ara..." className="h-10 text-sm border-b border-slate-100 dark:border-slate-800" />
                          <CommandList className="max-h-[240px] overflow-y-auto">
                            <CommandEmpty className="py-6 text-sm text-center text-slate-500">Öğrenci bulunamadı.</CommandEmpty>
                            <CommandGroup className="p-1">
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
                                    className={cn(
                                      "py-2.5 px-3 rounded-lg cursor-pointer transition-colors",
                                      isSelected 
                                        ? "bg-purple-50 dark:bg-purple-900/20" 
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                  >
                                    <div className={cn(
                                      "flex items-center justify-center w-5 h-5 mr-2.5 rounded-md border-2 transition-colors",
                                      isSelected 
                                        ? "border-purple-500 bg-purple-500" 
                                        : "border-slate-300 dark:border-slate-600"
                                    )}>
                                      {isSelected && (
                                        <Check className="h-3 w-3 text-white" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{student.name} {student.surname}</p>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{student.class}</p>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="participantType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-emerald-500" />
                    Katılımcı Tipi
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || "öğrenci"}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm rounded-lg bg-white dark:bg-slate-900">
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
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {sessionType === 'group' && (
            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <UsersIcon className="h-3 w-3 text-purple-500" />
                    Grup Adı <span className="text-[10px] text-slate-400 ml-1">(İsteğe Bağlı)</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Örn: 9-A Sınıfı" 
                      className="h-9 text-sm rounded-lg border bg-white dark:bg-slate-900"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}

          {participantType === "veli" && (
            <div className="grid grid-cols-2 gap-2.5 p-2.5 border border-blue-200 dark:border-blue-800/50 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
              <FormField
                control={form.control}
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Veli Adı <span className="text-rose-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ad Soyad" className="h-9 text-sm rounded-lg bg-white dark:bg-slate-900" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Yakınlık <span className="text-rose-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm rounded-lg bg-white dark:bg-slate-900">
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
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {participantType === "öğretmen" && (
            <div className="grid grid-cols-2 gap-2.5 p-2.5 border border-emerald-200 dark:border-emerald-800/50 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20">
              <FormField
                control={form.control}
                name="teacherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Öğretmen Adı <span className="text-rose-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ad Soyad" className="h-9 text-sm rounded-lg bg-white dark:bg-slate-900" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teacherBranch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">Branş</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Örn: Matematik" className="h-9 text-sm rounded-lg bg-white dark:bg-slate-900" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {participantType === "diğer" && (
            <div className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/20">
              <FormField
                control={form.control}
                name="otherParticipantDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Katılımcı Açıklaması <span className="text-rose-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Katılımcı hakkında bilgi" className="h-9 text-sm rounded-lg bg-white dark:bg-slate-900" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

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
