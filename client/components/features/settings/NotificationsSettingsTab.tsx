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
import { Switch } from "@/components/atoms/Switch";
import { Separator } from "@/components/atoms/Separator";
import { Badge } from "@/components/atoms/Badge";
import { Bell, Mail, Smartphone, MessageSquare, Clock, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsSettingsTab() {
 const settingsContext = useSettingsTabDirty();
 const componentId = useMemo(() => `notifications-settings-${Date.now()}`, []);
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
   settings.notifications.email !== savedSettings.notifications.email ||
   settings.notifications.sms !== savedSettings.notifications.sms ||
   settings.notifications.push !== savedSettings.notifications.push ||
   settings.notifications.digestHour !== savedSettings.notifications.digestHour
 );

 const handleSave = async () => {
   if (!settings) return;
   
   setIsSaving(true);
   try {
     await saveSettings(settings);
     setSavedSettings(settings);
     toast.success('Bildirim ayarları kaydedildi');
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
   <motion.div
     initial={{ opacity: 0, y: 10 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.3 }}
     className="max-w-3xl"
   >
     <Card id="notifications" className="border-muted">
       <CardHeader>
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2">
               <Bell className="h-5 w-5 text-primary" />
               Bildirim Tercihleri
             </CardTitle>
             <CardDescription>
               E-posta, SMS ve bildirim ayarları
             </CardDescription>
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
         <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/20 transition-colors">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10">
               <Mail className="h-4 w-4 text-primary" />
             </div>
             <Label className="cursor-pointer">E-posta Bildirimleri</Label>
           </div>
           <Switch
             checked={settings.notifications.email}
             onCheckedChange={(v) =>
               setSettings({
                 ...settings,
                 notifications: { ...settings.notifications, email: !!v }
               })
             }
           />
         </div>
         <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/20 transition-colors">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10">
               <MessageSquare className="h-4 w-4 text-primary" />
             </div>
             <Label className="cursor-pointer">SMS Bildirimleri</Label>
           </div>
           <Switch
             checked={settings.notifications.sms}
             onCheckedChange={(v) =>
               setSettings({
                 ...settings,
                 notifications: { ...settings.notifications, sms: !!v }
               })
             }
           />
         </div>
         <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/20 transition-colors">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10">
               <Smartphone className="h-4 w-4 text-primary" />
             </div>
             <Label className="cursor-pointer">Anlık Bildirimler</Label>
           </div>
           <Switch
             checked={settings.notifications.push}
             onCheckedChange={(v) =>
               setSettings({
                 ...settings,
                 notifications: { ...settings.notifications, push: !!v }
               })
             }
           />
         </div>
         <Separator />
         <div className="p-4 rounded-lg border border-border/40 bg-muted/30">
           <div className="flex items-center gap-2 mb-3">
             <Clock className="h-4 w-4 text-primary" />
             <Label htmlFor="digestHour" className="font-semibold">Günlük Özet Saati</Label>
           </div>
           <div className="grid gap-2 max-w-xs">
             <Input
               id="digestHour"
               type="number"
               min={0}
               max={23}
               value={settings.notifications.digestHour}
               onChange={(e) =>
                 setSettings({
                   ...settings,
                   notifications: { ...settings.notifications, digestHour: Number(e.target.value) }
                 })
               }
             />
             <p className="text-xs text-muted-foreground">
               0-23 arası bir saat belirtin (örn: 9 = sabah 9:00)
             </p>
           </div>
         </div>

         {hasChanges && (
           <div className="flex gap-2 pt-4 border-t">
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
 );
}
