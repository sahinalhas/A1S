import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { Label } from "@/components/atoms/Label";
import { Switch } from "@/components/atoms/Switch";
import { Input } from "@/components/atoms/Input";
import { RefreshCw, Calendar, BookOpen, HelpCircle, ClipboardList } from "lucide-react";
import type { TemplateCustomization } from "@/lib/types/study.types";

const WEEKDAYS = [
  { value: "1", label: "Pazartesi" },
  { value: "2", label: "Salı" },
  { value: "3", label: "Çarşamba" },
  { value: "4", label: "Perşembe" },
  { value: "5", label: "Cuma" },
  { value: "6", label: "Cumartesi" },
  { value: "7", label: "Pazar" },
];

const DURATION_OPTIONS = [
  { value: "15", label: "15 dk" },
  { value: "30", label: "30 dk" },
  { value: "45", label: "45 dk" },
  { value: "60", label: "1 saat" },
  { value: "90", label: "1.5 saat" },
  { value: "120", label: "2 saat" },
];

export default function TemplateCustomizationPanel({
  customization,
  onCustomizationChange,
}: {
  customization: TemplateCustomization;
  onCustomizationChange: (customization: TemplateCustomization) => void;
}) {
  const updateCustomization = (updates: Partial<TemplateCustomization>) => {
    onCustomizationChange({ ...customization, ...updates });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Günlük Tekrar */}
      <div className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-100">
              <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <span className="font-medium text-sm">Günlük Tekrar</span>
          </div>
          <Switch
            checked={customization.dailyRepetition?.enabled === true}
            onCheckedChange={(checked) =>
              updateCustomization({
                dailyRepetition: {
                  enabled: checked,
                  durationMinutes: customization.dailyRepetition?.durationMinutes || 30,
                  weekdaysOnly: true,
                },
              })
            }
          />
        </div>
        {customization.dailyRepetition?.enabled && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Süre:</Label>
              <Select
                value={String(customization.dailyRepetition?.durationMinutes || 30)}
                onValueChange={(value) =>
                  updateCustomization({
                    dailyRepetition: {
                      enabled: true,
                      durationMinutes: parseInt(value),
                      weekdaysOnly: true,
                    },
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Hafta içi her gün</p>
          </div>
        )}
      </div>

      {/* Haftalık Tekrar */}
      <div className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-100">
              <Calendar className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <span className="font-medium text-sm">Haftalık Tekrar</span>
          </div>
          <Switch
            checked={customization.weeklyRepetition?.enabled === true}
            onCheckedChange={(checked) =>
              updateCustomization({
                weeklyRepetition: {
                  enabled: checked,
                  durationMinutes: customization.weeklyRepetition?.durationMinutes || 60,
                  day: customization.weeklyRepetition?.day || 6,
                },
              })
            }
          />
        </div>
        {customization.weeklyRepetition?.enabled && (
          <div className="mt-2 pt-2 border-t space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Gün:</Label>
              <Select
                value={String(customization.weeklyRepetition?.day || 6)}
                onValueChange={(value) =>
                  updateCustomization({
                    weeklyRepetition: {
                      enabled: true,
                      day: parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
                      durationMinutes: customization.weeklyRepetition?.durationMinutes || 60,
                    },
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.slice(5).map((day) => (
                    <SelectItem key={day.value} value={day.value} className="text-xs">
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Süre:</Label>
              <Select
                value={String(customization.weeklyRepetition?.durationMinutes || 60)}
                onValueChange={(value) =>
                  updateCustomization({
                    weeklyRepetition: {
                      enabled: true,
                      durationMinutes: parseInt(value),
                      day: customization.weeklyRepetition?.day || 6,
                    },
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Kitap Okuma */}
      <div className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-green-100">
              <BookOpen className="h-3.5 w-3.5 text-green-600" />
            </div>
            <span className="font-medium text-sm">Kitap Okuma</span>
          </div>
          <Switch
            checked={customization.bookReading?.enabled === true}
            onCheckedChange={(checked) =>
              updateCustomization({
                bookReading: {
                  enabled: checked,
                  daysPerWeek: customization.bookReading?.daysPerWeek || 3,
                  durationMinutes: customization.bookReading?.durationMinutes || 30,
                },
              })
            }
          />
        </div>
        {customization.bookReading?.enabled && (
          <div className="mt-2 pt-2 border-t space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Gün sayısı:</Label>
              <Input
                type="number"
                min="1"
                max="7"
                className="h-8 w-16 text-xs"
                value={customization.bookReading?.daysPerWeek || 3}
                onChange={(e) =>
                  updateCustomization({
                    bookReading: {
                      enabled: true,
                      daysPerWeek: parseInt(e.target.value) || 1,
                      durationMinutes: customization.bookReading?.durationMinutes || 30,
                    },
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Süre:</Label>
              <Select
                value={String(customization.bookReading?.durationMinutes || 30)}
                onValueChange={(value) =>
                  updateCustomization({
                    bookReading: {
                      enabled: true,
                      durationMinutes: parseInt(value),
                      daysPerWeek: customization.bookReading?.daysPerWeek || 3,
                    },
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Soru Çözümü */}
      <div className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-100">
              <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <span className="font-medium text-sm">Soru Çözümü</span>
          </div>
          <Switch
            checked={customization.questionSolving?.enabled === true}
            onCheckedChange={(checked) =>
              updateCustomization({
                questionSolving: {
                  enabled: checked,
                  askTeacher: checked,
                },
              })
            }
          />
        </div>
        {customization.questionSolving?.enabled && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-[10px] text-muted-foreground">Çarşamba ve Cuma 1'er saat</p>
          </div>
        )}
      </div>

      {/* Deneme Sınavı */}
      <div className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-100">
              <ClipboardList className="h-3.5 w-3.5 text-red-600" />
            </div>
            <span className="font-medium text-sm">Deneme Sınavı</span>
          </div>
          <Switch
            checked={customization.mockExam?.enabled === true}
            onCheckedChange={(checked) =>
              updateCustomization({
                mockExam: {
                  enabled: checked,
                  durationMinutes: 120,
                  day: customization.mockExam?.day || 7,
                },
              })
            }
          />
        </div>
        {customization.mockExam?.enabled && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Gün:</Label>
              <Select
                value={String(customization.mockExam?.day || 7)}
                onValueChange={(value) =>
                  updateCustomization({
                    mockExam: {
                      enabled: true,
                      day: parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
                      durationMinutes: 120,
                    },
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value} className="text-xs">
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-[10px] text-muted-foreground ml-2">2 saat</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
