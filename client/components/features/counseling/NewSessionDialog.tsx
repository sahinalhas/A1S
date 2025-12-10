import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Users, X, Calendar, Clock, MapPin, ArrowRight, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

import { Dialog, DialogContent } from "@/components/organisms/Dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/organisms/Popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/organisms/Command";
import { Calendar as CalendarComponent } from "@/components/organisms/Calendar";
import { RadioGroup, RadioGroupItem } from "@/components/atoms/RadioGroup";
import { Label } from "@/components/atoms/Label";
import { cn } from "@/lib/utils";
import { SESSION_MODES } from "@shared/constants/common.constants";

import { 
  individualSessionSchema, 
  groupSessionSchema,
  type IndividualSessionFormValues, 
  type GroupSessionFormValues,
  type Student,
} from "./types";

interface NewSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionType: 'individual' | 'group';
  onSessionTypeChange: (type: 'individual' | 'group') => void;
  students: Student[];
  selectedStudents: Student[];
  onSelectedStudentsChange: (students: Student[]) => void;
  onSubmit: (data: IndividualSessionFormValues | GroupSessionFormValues) => void;
  isPending: boolean;
}

export default function NewSessionDialog({
  open,
  onOpenChange,
  sessionType,
  onSessionTypeChange,
  students,
  selectedStudents,
  onSelectedStudentsChange,
  onSubmit,
  isPending,
}: NewSessionDialogProps) {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const individualForm = useForm<IndividualSessionFormValues>({
    resolver: zodResolver(individualSessionSchema) as any,
    defaultValues: {
      studentId: "",
      participantType: "öğrenci",
      relationshipType: "",
      sessionMode: "yüz_yüze",
      sessionLocation: "Rehberlik Servisi",
      disciplineStatus: "none",
      sessionDate: now,
      sessionTime: currentTime,
      sessionDetails: "",
    },
  });

  const groupForm = useForm<GroupSessionFormValues>({
    resolver: zodResolver(groupSessionSchema) as any,
    defaultValues: {
      groupName: "",
      studentIds: [],
      participantType: "öğrenci",
      sessionMode: "yüz_yüze",
      sessionLocation: "Rehberlik Servisi",
      disciplineStatus: "none",
      sessionDate: now,
      sessionTime: currentTime,
      sessionDetails: "",
    },
  });

  const activeForm = sessionType === 'individual' ? individualForm : groupForm;
  const selectedStudentId = sessionType === 'individual' ? individualForm.watch("studentId") : null;
  const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) : null;

  const handleClose = () => {
    onOpenChange(false);
    individualForm.reset();
    groupForm.reset();
    onSelectedStudentsChange([]);
  };

  const handleSubmit = (data: IndividualSessionFormValues | GroupSessionFormValues) => {
    onSubmit(data);
  };

  const sessionModeValue = sessionType === 'individual' 
    ? individualForm.watch("sessionMode") 
    : groupForm.watch("sessionMode");
  const participantType = sessionType === 'individual' 
    ? individualForm.watch("participantType") 
    : groupForm.watch("participantType");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        hideCloseButton 
        className="max-w-lg p-0 gap-0 border-0 bg-white dark:bg-slate-950 overflow-hidden rounded-2xl shadow-2xl"
      >
        {/* Minimal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
          
          <h2 className="text-lg font-semibold text-white">Yeni Görüşme</h2>
          <p className="text-white/70 text-sm mt-0.5">Görüşme bilgilerini girin</p>
        </div>

        {/* Session Type Toggle */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
            <button
              type="button"
              onClick={() => onSessionTypeChange('individual')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                sessionType === 'individual'
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <User className="h-4 w-4" />
              Bireysel
            </button>
            <button
              type="button"
              onClick={() => onSessionTypeChange('group')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                sessionType === 'group'
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Users className="h-4 w-4" />
              Grup
            </button>
          </div>
        </div>

        {/* Form Content */}
        <Form {...(activeForm as any)}>
          <form onSubmit={activeForm.handleSubmit(handleSubmit as any)} className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
            
            {/* Student Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">1</span>
                </div>
                Katılımcı
              </div>

              {sessionType === 'individual' ? (
                <FormField
                  control={individualForm.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              type="button"
                              className={cn(
                                "w-full h-11 flex items-center justify-between px-3 rounded-lg border bg-white dark:bg-slate-900 transition-all text-left group",
                                field.value 
                                  ? "border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-100 dark:ring-indigo-900/30" 
                                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                              )}
                            >
                              {field.value ? (
                                <span className="text-[13px] text-slate-700 dark:text-slate-200 truncate">
                                  {selectedStudent?.name} {selectedStudent?.surname} <span className="text-slate-400">•</span> {selectedStudent?.class} <span className="text-slate-400">•</span> {selectedStudent?.id}
                                </span>
                              ) : (
                                <span className="text-[13px] text-slate-400">Öğrenci seçin...</span>
                              )}
                              <ChevronDown className={cn(
                                "h-4 w-4 text-slate-400 shrink-0 transition-transform",
                                studentSearchOpen && "rotate-180"
                              )} />
                            </button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="p-0 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden" 
                          align="start"
                          sideOffset={4}
                          style={{ width: 'var(--radix-popover-trigger-width)' }}
                        >
                          <Command className="border-0">
                            <CommandInput placeholder="Ara..." className="h-9 text-[13px] border-0 border-b border-slate-100 dark:border-slate-800" />
                            <CommandList className="max-h-[180px] overflow-y-auto p-1">
                              <CommandEmpty className="py-6 text-center text-[13px] text-slate-400">
                                Sonuç bulunamadı
                              </CommandEmpty>
                              <CommandGroup>
                                {students.map((student) => (
                                  <CommandItem
                                    key={student.id}
                                    value={`${student.id} ${student.name} ${student.surname} ${student.class}`}
                                    onSelect={() => {
                                      field.onChange(student.id);
                                      setStudentSearchOpen(false);
                                    }}
                                    className={cn(
                                      "py-2 px-2 rounded-md cursor-pointer flex items-center gap-2 text-[13px] transition-colors",
                                      field.value === student.id 
                                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300" 
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                  >
                                    <span className="truncate flex-1">
                                      {student.name} {student.surname} <span className="text-slate-400 dark:text-slate-500">•</span> {student.class} <span className="text-slate-400 dark:text-slate-500">•</span> {student.id}
                                    </span>
                                    {field.value === student.id && (
                                      <Check className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                    )}
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
                  control={groupForm.control}
                  name="studentIds"
                  render={({ field }) => (
                    <FormItem>
                      <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              type="button"
                              className={cn(
                                "w-full h-11 flex items-center justify-between px-3 rounded-lg border bg-white dark:bg-slate-900 transition-all text-left group",
                                selectedStudents.length > 0 
                                  ? "border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-100 dark:ring-indigo-900/30" 
                                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                              )}
                            >
                              {selectedStudents.length > 0 ? (
                                <span className="text-[13px] text-slate-700 dark:text-slate-200 truncate">
                                  {selectedStudents.length} öğrenci <span className="text-slate-400">•</span> {selectedStudents.slice(0, 2).map(s => s.name).join(", ")}{selectedStudents.length > 2 && "..."}
                                </span>
                              ) : (
                                <span className="text-[13px] text-slate-400">Öğrenci seçin...</span>
                              )}
                              <ChevronDown className={cn(
                                "h-4 w-4 text-slate-400 shrink-0 transition-transform",
                                studentSearchOpen && "rotate-180"
                              )} />
                            </button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="p-0 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden" 
                          align="start"
                          sideOffset={4}
                          style={{ width: 'var(--radix-popover-trigger-width)' }}
                        >
                          <Command className="border-0">
                            <CommandInput placeholder="Ara..." className="h-9 text-[13px] border-0 border-b border-slate-100 dark:border-slate-800" />
                            <CommandList className="max-h-[180px] overflow-y-auto p-1">
                              <CommandEmpty className="py-6 text-center text-[13px] text-slate-400">
                                Sonuç bulunamadı
                              </CommandEmpty>
                              <CommandGroup>
                                {students.map((student) => {
                                  const isSelected = selectedStudents.some(s => s.id === student.id);
                                  return (
                                    <CommandItem
                                      key={student.id}
                                      value={`${student.id} ${student.name} ${student.surname} ${student.class}`}
                                      onSelect={() => {
                                        const newStudents = isSelected
                                          ? selectedStudents.filter(s => s.id !== student.id)
                                          : [...selectedStudents, student];
                                        onSelectedStudentsChange(newStudents);
                                        field.onChange(newStudents.map(s => s.id));
                                      }}
                                      className={cn(
                                        "py-2 px-2 rounded-md cursor-pointer flex items-center gap-2 text-[13px] transition-colors",
                                        isSelected 
                                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300" 
                                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                      )}
                                    >
                                      <div className={cn(
                                        "w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors",
                                        isSelected 
                                          ? "border-indigo-500 bg-indigo-500" 
                                          : "border-slate-300 dark:border-slate-600"
                                      )}>
                                        {isSelected && (
                                          <Check className="h-2.5 w-2.5 text-white" />
                                        )}
                                      </div>
                                      <span className="truncate flex-1">
                                        {student.name} {student.surname} <span className="text-slate-400 dark:text-slate-500">•</span> {student.class} <span className="text-slate-400 dark:text-slate-500">•</span> {student.id}
                                      </span>
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

              {/* Participant Type - Compact */}
              <FormField
                control={activeForm.control as any}
                name="participantType"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "öğrenci"}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Katılımcı tipi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
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

              {/* Conditional Parent/Teacher Fields */}
              <AnimatePresence mode="wait">
                {participantType === "veli" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <FormField
                      control={activeForm.control as any}
                      name="parentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Veli adı" 
                              className="h-11 rounded-xl border-2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={activeForm.control as any}
                      name="parentRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-2">
                                <SelectValue placeholder="Yakınlık" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="anne">Anne</SelectItem>
                              <SelectItem value="baba">Baba</SelectItem>
                              <SelectItem value="vasi">Vasi</SelectItem>
                              <SelectItem value="diger_aile">Diğer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {participantType === "öğretmen" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <FormField
                      control={activeForm.control as any}
                      name="teacherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Öğretmen adı" 
                              className="h-11 rounded-xl border-2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={activeForm.control as any}
                      name="teacherBranch"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Branş" 
                              className="h-11 rounded-xl border-2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">2</span>
                </div>
                Tarih ve Saat
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={activeForm.control as any}
                  name="sessionDate"
                  render={({ field }) => (
                    <FormItem>
                      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              type="button"
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-left"
                            >
                              <Calendar className="h-5 w-5 text-slate-400" />
                              <span className={field.value ? "text-slate-900 dark:text-white" : "text-slate-400"}>
                                {field.value 
                                  ? format(field.value, "d MMM", { locale: tr })
                                  : "Tarih"}
                              </span>
                            </button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                                setDatePickerOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={activeForm.control as any}
                  name="sessionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                          <Clock className="h-5 w-5 text-slate-400" />
                          <input
                            type="time"
                            {...field}
                            className="flex-1 bg-transparent border-0 focus:outline-none text-slate-900 dark:text-white"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Session Mode */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">3</span>
                </div>
                Görüşme Şekli
              </div>

              <FormField
                control={activeForm.control as any}
                name="sessionMode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-3"
                      >
                        {[
                          { value: SESSION_MODES.YUZ_YUZE, label: "Yüz Yüze", icon: "👤" },
                          { value: SESSION_MODES.ONLINE, label: "Online", icon: "💻" },
                          { value: SESSION_MODES.TELEFON, label: "Telefon", icon: "📞" },
                        ].map((mode) => (
                          <div key={mode.value}>
                            <RadioGroupItem
                              value={mode.value}
                              id={mode.value}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={mode.value}
                              className={cn(
                                "flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all",
                                "border-slate-200 dark:border-slate-700",
                                "peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-950/30",
                                "hover:border-slate-300 dark:hover:border-slate-600"
                              )}
                            >
                              <span className="text-2xl mb-1">{mode.icon}</span>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{mode.label}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={activeForm.control as any}
                name="sessionLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                        <MapPin className="h-5 w-5 text-slate-400" />
                        <input
                          {...field}
                          placeholder={
                            sessionModeValue === SESSION_MODES.ONLINE 
                              ? "Zoom, Teams, vb." 
                              : sessionModeValue === SESSION_MODES.TELEFON
                                ? "Telefon görüşmesi"
                                : "Rehberlik Servisi"
                          }
                          className="flex-1 bg-transparent border-0 focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleClose}
              className="text-slate-500 hover:text-slate-700"
            >
              İptal
            </Button>

            <Button 
              type="button"
              onClick={() => activeForm.handleSubmit(handleSubmit as any)()}
              disabled={isPending}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 rounded-xl"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Başlatılıyor...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Görüşmeyi Başlat
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
