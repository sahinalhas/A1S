import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Calendar as CalendarIcon, Clock, Video, Phone, Users as UsersIcon, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/organisms/Popover";
import { RadioGroup, RadioGroupItem } from "@/components/atoms/RadioGroup";
import { Calendar } from "@/components/organisms/Calendar";
import { Label } from "@/components/atoms/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { SESSION_MODES } from "@shared/constants/common.constants";

import type { IndividualSessionFormValues, GroupSessionFormValues } from "../types";

interface SessionDetailsStepProps {
  form: UseFormReturn<any>;
}

export default function SessionDetailsStep({ form }: SessionDetailsStepProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const sessionMode = form.watch("sessionMode");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 pb-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
          <Settings2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-sm text-slate-800 dark:text-slate-100">
            Görüşme Detayları
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tarih, saat ve görüşme şeklini belirleyin
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="sessionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Tarih <span className="text-rose-500">*</span>
                </FormLabel>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal h-9 text-sm rounded-lg border bg-white dark:bg-slate-900",
                          !field.value && "text-slate-400"
                        )}
                      >
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                        {field.value ? (
                          format(field.value, "d MMM yyyy", { locale: tr })
                        ) : (
                          <span>Tarih seçin</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-lg" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date);
                          setDateOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sessionTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Saat <span className="text-rose-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field} 
                    className="h-9 text-sm rounded-lg border bg-white dark:bg-slate-900"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sessionMode"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Görüşme Şekli <span className="text-rose-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                >
                  <div>
                    <RadioGroupItem
                      value={SESSION_MODES.YUZ_YUZE}
                      id="yuz_yuze"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="yuz_yuze"
                      className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-950/30 cursor-pointer transition-colors"
                    >
                      <UsersIcon className="mb-1 h-5 w-5 text-emerald-600" />
                      <span className="font-medium text-xs text-slate-700 dark:text-slate-200">Yüz Yüze</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value={SESSION_MODES.ONLINE}
                      id="online"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="online"
                      className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950/30 cursor-pointer transition-colors"
                    >
                      <Video className="mb-1 h-5 w-5 text-blue-600" />
                      <span className="font-medium text-xs text-slate-700 dark:text-slate-200">Online</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value={SESSION_MODES.TELEFON}
                      id="telefon"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="telefon"
                      className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50 dark:peer-data-[state=checked]:bg-orange-950/30 cursor-pointer transition-colors"
                    >
                      <Phone className="mb-1 h-5 w-5 text-orange-600" />
                      <span className="font-medium text-xs text-slate-700 dark:text-slate-200">Telefon</span>
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="sessionLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Görüşme Yeri <span className="text-rose-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder={
                      sessionMode === SESSION_MODES.ONLINE 
                        ? "Zoom, Teams, vb." 
                        : sessionMode === SESSION_MODES.TELEFON
                          ? "Telefon görüşmesi"
                          : "Rehberlik Servisi"
                    }
                    className="h-9 text-sm rounded-lg border bg-white dark:bg-slate-900"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="disciplineStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Disiplin Durumu
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm rounded-lg bg-white dark:bg-slate-900">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="none">Yok</SelectItem>
                    <SelectItem value="kurulu_sevk">Kurula sevk</SelectItem>
                    <SelectItem value="gorusu_alinan">Görüşü alınan</SelectItem>
                    <SelectItem value="akran_gorusmesi">Akran görüşmesi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
