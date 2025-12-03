import { useState, useEffect, useMemo, useRef } from "react";
import { useSettingsTabDirty } from "@/pages/Settings";
import { AppSettings, loadSettings, saveSettings } from "@/lib/app-settings";
import { motion } from "framer-motion";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { Palette, User, Calendar, Clock, Globe, Save, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/atoms/Badge";
import { AlertCircle } from "lucide-react";

export default function GeneralSettingsTab() {
 const settingsContext = useSettingsTabDirty();
 const componentId = useMemo(() => `general-settings-${Date.now()}`, []);
 const saveSettingsRef = useRef<() => Promise<void>>();

 const [settings, setSettings] = useState<AppSettings | null>(null);
 const [savedSettings, setSavedSettings] = useState<AppSettings | null>(null);
 const [isSaving, setIsSaving] = useState(false);

 useEffect(() => {
   loadSettings().then(loaded => {
     setSettings(loaded);
     setSavedSettings(loaded);
   });
 }, []);

 const hasChanges = settings && savedSettings && (
   settings.theme !== savedSettings.theme ||
   settings.language !== savedSettings.language ||
   settings.dateFormat !== savedSettings.dateFormat ||
   settings.timeFormat !== savedSettings.timeFormat ||
   settings.weekStart !== savedSettings.weekStart ||
   settings.account.displayName !== savedSettings.account.displayName ||
   settings.account.email !== savedSettings.account.email ||
   settings.account.signature !== savedSettings.account.signature
 );

 const handleSave = async () => {
   if (!settings) return;
   
   setIsSaving(true);
   try {
     await saveSettings(settings);
     setSavedSettings(settings);
     toast.success('Genel ayarlar kaydedildi');
   } catch (error) {
     toast.error('Ayarlar kaydedilemedi');
   } finally {
     setIsSaving(false);
   }
 };

 const handleReset = () => {
   if (savedSettings) {
     setSettings(savedSettings);
   }
 };

 useEffect(() => {
   saveSettingsRef.current = handleSave;
 }, [settings]);

 useEffect(() => {
   if (!settingsContext?.registerTabSubmit) return;
   
   settingsContext.registerTabSubmit(componentId, async () => {
     if (hasChanges && saveSettingsRef.current) {
       await saveSettingsRef.current();
     }
   });

   return () => {
     if (settingsContext?.unregisterTabSubmit) {
       settingsContext.unregisterTabSubmit(componentId);
     }
   };
 }, [componentId, settingsContext, hasChanges]);

 if (!settings || !savedSettings) {
   return <div className="text-center py-8">Yükleniyor...</div>;
 }

 return (
   <div className="grid gap-4 md:grid-cols-2">
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.3 }}
     >
       <Card className="border-muted relative">
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle className="flex items-center gap-2">
                 <Palette className="h-5 w-5 text-primary" />
                 Görünüm
               </CardTitle>
               <CardDescription>Tema ve dil tercihi</CardDescription>
             </div>
             {hasChanges && (
               <Badge variant="outline" className="border-orange-500 text-orange-600 animate-pulse">
                 <AlertCircle className="h-3 w-3 mr-1" />
                 Kaydedilmedi
               </Badge>
             )}
           </div>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid gap-2">
             <Label>Tema</Label>
             <div className="flex items-center gap-3">
               <Button
                 type="button"
                 variant={settings.theme === "light" ? "default" : "outline"}
                 onClick={() => setSettings({ ...settings, theme: "light" })}
               >
                 Açık
               </Button>
               <Button
                 type="button"
                 variant={settings.theme === "dark" ? "default" : "outline"}
                 onClick={() => setSettings({ ...settings, theme: "dark" })}
               >
                 Koyu
               </Button>
             </div>
           </div>
           <div className="grid gap-2">
             <Label htmlFor="language">Dil</Label>
             <Select value={settings.language} onValueChange={(v) => setSettings({ ...settings, language: v as any })}>
               <SelectTrigger id="language">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="tr">Türkçe</SelectItem>
                 <SelectItem value="en">English</SelectItem>
               </SelectContent>
             </Select>
           </div>
           <div className="grid gap-2">
             <Label htmlFor="dateFormat">Tarih Formatı</Label>
             <Select value={settings.dateFormat} onValueChange={(v) => setSettings({ ...settings, dateFormat: v as any })}>
               <SelectTrigger id="dateFormat">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="dd.MM.yyyy">dd.MM.yyyy</SelectItem>
                 <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
               </SelectContent>
             </Select>
           </div>
           <div className="grid gap-2">
             <Label htmlFor="timeFormat">Saat Formatı</Label>
             <Select value={settings.timeFormat} onValueChange={(v) => setSettings({ ...settings, timeFormat: v as any })}>
               <SelectTrigger id="timeFormat">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="HH:mm">24 Saat (HH:mm)</SelectItem>
                 <SelectItem value="hh:mm a">12 Saat (hh:mm a)</SelectItem>
               </SelectContent>
             </Select>
           </div>
           <div className="grid gap-2">
             <Label htmlFor="weekStart">Haftanın İlk Günü</Label>
             <Select value={String(settings.weekStart)} onValueChange={(v) => setSettings({ ...settings, weekStart: Number(v) as 1 | 7 })}>
               <SelectTrigger id="weekStart">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="1">Pazartesi</SelectItem>
                 <SelectItem value="7">Pazar</SelectItem>
               </SelectContent>
             </Select>
           </div>
           {hasChanges && (
             <div className="flex gap-2 pt-2 border-t">
               <Button variant="outline" onClick={handleReset} disabled={isSaving} className="flex-1">
                 İptal
               </Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-green-600 hover:bg-green-700">
                 {isSaving ? (
                   <>
                     <Loader2 className="h-4 w-4 animate-spin mr-1" />
                     Kaydediliyor
                   </>
                 ) : (
                   <>
                     <CheckCircle className="h-4 w-4 mr-1" />
                     Kaydet
                   </>
                 )}
               </Button>
             </div>
           )}
         </CardContent>
       </Card>
     </motion.div>

     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.3, delay: 0.1 }}
     >
       <Card id="account" className="border-muted">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <User className="h-5 w-5 text-primary" />
             Hesap
           </CardTitle>
           <CardDescription>Kullanıcı bilgileri</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid gap-2">
             <Label htmlFor="displayName">Ad Soyad</Label>
             <Input
               id="displayName"
               value={settings.account.displayName}
               onChange={(e) => setSettings({
                 ...settings,
                 account: { ...settings.account, displayName: e.target.value }
               })}
             />
           </div>
           <div className="grid gap-2">
             <Label htmlFor="email">E-posta</Label>
             <Input
               id="email"
               type="email"
               value={settings.account.email}
               onChange={(e) => setSettings({
                 ...settings,
                 account: { ...settings.account, email: e.target.value }
               })}
             />
           </div>
           <div className="grid gap-2">
             <Label htmlFor="signature">İmza / Not</Label>
             <Textarea
               id="signature"
               value={settings.account.signature ?? ""}
               onChange={(e) => setSettings({
                 ...settings,
                 account: { ...settings.account, signature: e.target.value }
               })}
             />
           </div>
           {hasChanges && (
             <div className="flex gap-2 pt-2 border-t">
               <Button variant="outline" onClick={handleReset} disabled={isSaving} className="flex-1">
                 İptal
               </Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-green-600 hover:bg-green-700">
                 {isSaving ? (
                   <>
                     <Loader2 className="h-4 w-4 animate-spin mr-1" />
                     Kaydediliyor
                   </>
                 ) : (
                   <>
                     <CheckCircle className="h-4 w-4 mr-1" />
                     Kaydet
                   </>
                 )}
               </Button>
             </div>
           )}
         </CardContent>
       </Card>
     </motion.div>
   </div>
 );
}
