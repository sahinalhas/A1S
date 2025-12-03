import { useState } from "react";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/organisms/Card";
import { Label } from "@/components/atoms/Label";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Separator } from "@/components/atoms/Separator";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";
import { Input } from "@/components/atoms/Input";
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
 { value: "15", label: "15 dakika" },
 { value: "30", label: "30 dakika" },
 { value: "45", label: "45 dakika" },
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
 <div className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Günlük Tekrar</CardTitle>
 <CardDescription>
 Hafta içi her gün yapacağınız tekrar çalışması
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center gap-2">
 <Checkbox
 id="daily-rep"
 checked={customization.dailyRepetition?.enabled === true}
 onCheckedChange={(checked) =>
 updateCustomization({
 dailyRepetition: {
 enabled: checked as boolean,
 durationMinutes: (customization.dailyRepetition?.durationMinutes) || 30,
 weekdaysOnly: true,
 },
 })
 }
 />
 <Label htmlFor="daily-rep" className="font-normal cursor-pointer">
 Günlük tekrar ekle
 </Label>
 </div>

 {customization.dailyRepetition?.enabled && (
 <div className="ml-6 space-y-3">
 <div className="space-y-2">
 <Label className="text-sm">Günlük Süre</Label>
 <Select
 value={String(customization.dailyRepetition?.durationMinutes || 30)}
 onValueChange={(value: string) =>
 updateCustomization({
 dailyRepetition: {
 enabled: true,
 durationMinutes: parseInt(value),
 weekdaysOnly: true,
 },
 })
 }
 >
 <SelectTrigger className="w-full">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {DURATION_OPTIONS.map((opt) => (
 <SelectItem key={opt.value} value={opt.value}>
 {opt.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Haftalık Tekrar</CardTitle>
 <CardDescription>Hafta sonu yapacağınız yoğun tekrar çalışması</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center gap-2">
 <Checkbox
 id="weekly-rep"
 checked={customization.weeklyRepetition?.enabled === true}
 onCheckedChange={(checked) =>
 updateCustomization({
 weeklyRepetition: {
 enabled: checked as boolean,
 durationMinutes: (customization.weeklyRepetition?.durationMinutes) || 60,
 day: (customization.weeklyRepetition?.day) || 6,
 },
 })
 }
 />
 <Label htmlFor="weekly-rep" className="font-normal cursor-pointer">
 Haftalık tekrar ekle
 </Label>
 </div>

 {customization.weeklyRepetition?.enabled && (
 <div className="ml-6 space-y-3">
 <div className="space-y-2">
 <Label className="text-sm">Günü Seçin</Label>
 <Select
 value={String(customization.weeklyRepetition?.day || 6)}
 onValueChange={(value: string) =>
 updateCustomization({
 weeklyRepetition: {
 enabled: true,
 day: parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
 durationMinutes: (customization.weeklyRepetition?.durationMinutes) || 60,
 },
 })
 }
 >
 <SelectTrigger className="w-full">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {WEEKDAYS.slice(5).map((day) => (
 <SelectItem key={day.value} value={day.value}>
 {day.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label className="text-sm">Süre</Label>
 <Select
 value={String(customization.weeklyRepetition?.durationMinutes || 60)}
 onValueChange={(value: string) =>
 updateCustomization({
 weeklyRepetition: {
 enabled: true,
 durationMinutes: parseInt(value),
 day: (customization.weeklyRepetition?.day) || 6,
 },
 })
 }
 >
 <SelectTrigger className="w-full">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {DURATION_OPTIONS.map((opt) => (
 <SelectItem key={opt.value} value={opt.value}>
 {opt.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Kitap Okuma</CardTitle>
 <CardDescription>Haftalık kitap okuma saatleri</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center gap-2">
 <Checkbox
 id="book-reading"
 checked={customization.bookReading?.enabled === true}
 onCheckedChange={(checked) =>
 updateCustomization({
 bookReading: {
 enabled: checked as boolean,
 daysPerWeek: (customization.bookReading?.daysPerWeek) || 3,
 durationMinutes: (customization.bookReading?.durationMinutes) || 30,
 },
 })
 }
 />
 <Label htmlFor="book-reading" className="font-normal cursor-pointer">
 Kitap okuma ekle
 </Label>
 </div>

 {customization.bookReading?.enabled && (
 <div className="ml-6 space-y-3">
 <div className="space-y-2">
 <Label className="text-sm">Haftada Kaç Gün?</Label>
 <Input
 type="number"
 min="1"
 max="7"
 value={customization.bookReading?.daysPerWeek || 3}
 onChange={(e) =>
 updateCustomization({
 bookReading: {
 enabled: true,
 daysPerWeek: parseInt(e.target.value),
 durationMinutes: (customization.bookReading?.durationMinutes) || 30,
 },
 })
 }
 />
 </div>
 <div className="space-y-2">
 <Label className="text-sm">Her Oturumda Okuma Süresi</Label>
 <Select
 value={String(customization.bookReading?.durationMinutes || 30)}
 onValueChange={(value: string) =>
 updateCustomization({
 bookReading: {
 enabled: true,
 durationMinutes: parseInt(value),
 daysPerWeek: (customization.bookReading?.daysPerWeek) || 3,
 },
 })
 }
 >
 <SelectTrigger className="w-full">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {DURATION_OPTIONS.map((opt) => (
 <SelectItem key={opt.value} value={opt.value}>
 {opt.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Soru Çözüm</CardTitle>
 <CardDescription>Öğretmene soru sorma ve tartışma zamanları</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center gap-2">
 <Checkbox
 id="question-solving"
 checked={customization.questionSolving?.enabled === true}
 onCheckedChange={(checked) =>
 updateCustomization({
 questionSolving: {
 enabled: checked as boolean,
 askTeacher: checked as boolean,
 },
 })
 }
 />
 <Label htmlFor="question-solving" className="font-normal cursor-pointer">
 Soru çözümü ekle
 </Label>
 </div>

 {customization.questionSolving?.enabled && (
 <div className="ml-6 space-y-3">
 <div className="flex items-center gap-2">
 <Checkbox
 id="ask-teacher"
 checked={customization.questionSolving?.askTeacher === true}
 onCheckedChange={(checked) =>
 updateCustomization({
 questionSolving: {
 enabled: true,
 askTeacher: checked as boolean,
 },
 })
 }
 />
 <Label
 htmlFor="ask-teacher"
 className="text-sm font-normal cursor-pointer"
 >
 Bilmediğim soruları öğretmene sorma seçeneği etkinleştir
 </Label>
 </div>
 </div>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Deneme Sınavı</CardTitle>
 <CardDescription>Haftalık 2 saatlik deneme sınavı zamanı</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center gap-2">
 <Checkbox
 id="mock-exam"
 checked={customization.mockExam?.enabled === true}
 onCheckedChange={(checked) =>
 updateCustomization({
 mockExam: {
 enabled: checked as boolean,
 durationMinutes: 120,
 day: (customization.mockExam?.day) || 7,
 },
 })
 }
 />
 <Label htmlFor="mock-exam" className="font-normal cursor-pointer">
 Deneme sınavı ekle
 </Label>
 </div>

 {customization.mockExam?.enabled && (
 <div className="ml-6 space-y-3">
 <div className="space-y-2">
 <Label className="text-sm">Sınavın Yapılacağı Gün</Label>
 <Select
 value={String(customization.mockExam?.day || 7)}
 onValueChange={(value: string) =>
 updateCustomization({
 mockExam: {
 enabled: true,
 day: parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
 durationMinutes: 120,
 },
 })
 }
 >
 <SelectTrigger className="w-full">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {WEEKDAYS.map((day) => (
 <SelectItem key={day.value} value={day.value}>
 {day.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <p className="text-xs text-muted-foreground">
 Not: Sınavın süresi otomatik olarak 2 saat (120 dakika) olarak ayarlanmıştır.
 </p>
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
