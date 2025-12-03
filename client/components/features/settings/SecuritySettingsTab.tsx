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
import { Checkbox } from "@/components/atoms/Checkbox";
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger,
} from "@/components/organisms/AlertDialog";
import { Shield, Lock, RotateCcw, Download, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/atoms/Badge";

interface SecuritySettingsTabProps {
 onReset: () => void;
 onExport: () => void;
}

export default function SecuritySettingsTab({
 onReset,
 onExport,
}: SecuritySettingsTabProps) {
 const settingsContext = useSettingsTabDirty();
 const componentId = useMemo(() => `security-settings-${Date.now()}`, []);
 const saveSettingsRef = useRef<() => Promise<void>>();

 const [settings, setSettings] = useState<AppSettings | null>(null);
 const [savedSettings, setSavedSettings] = useState<AppSettings | null>(null);
 const [isSaving, setIsSaving] = useState(false);
 const [ack1, setAck1] = useState(false);
 const [ack2, setAck2] = useState(false);
 const [confirmEmail, setConfirmEmail] = useState("");
 const [confirmCode, setConfirmCode] = useState("");

 useEffect(() => {
   loadSettings().then(loaded => {
     setSettings(loaded);
     setSavedSettings(loaded);
   });
 }, []);

 const hasChanges = settings && savedSettings && (
   settings.privacy.analyticsEnabled !== savedSettings.privacy.analyticsEnabled ||
   settings.privacy.dataSharingEnabled !== savedSettings.privacy.dataSharingEnabled
 );

 const handleSave = async () => {
   if (!settings) return;
   
   setIsSaving(true);
   try {
     await saveSettings(settings);
     setSavedSettings(settings);
     toast.success('Gizlilik ayarları kaydedildi');
   } catch (error) {
     toast.error('Ayarlar kaydedilemedi');
   } finally {
     setIsSaving(false);
   }
 };

 const handleReset = async () => {
   onReset();
   setAck1(false);
   setAck2(false);
   setConfirmEmail("");
   setConfirmCode("");
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
       <Card className="border-muted">
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle className="flex items-center gap-2">
                 <Shield className="h-5 w-5 text-primary" />
                 Gizlilik ve Güvenlik
               </CardTitle>
               <CardDescription>Analitik ve veri paylaşımı</CardDescription>
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
           <div className="flex items-center gap-2">
             <Checkbox
               id="analytics"
               checked={settings.privacy.analyticsEnabled}
               onCheckedChange={(v) =>
                 setSettings({
                   ...settings,
                   privacy: { ...settings.privacy, analyticsEnabled: !!v }
                 })
               }
             />
             <Label htmlFor="analytics">
               Kullanım analitiklerini etkinleştir
             </Label>
           </div>
           <div className="flex items-center gap-2">
             <Checkbox
               id="share"
               checked={settings.privacy.dataSharingEnabled}
               onCheckedChange={(v) =>
                 setSettings({
                   ...settings,
                   privacy: { ...settings.privacy, dataSharingEnabled: !!v }
                 })
               }
             />
             <Label htmlFor="share">
               Anonim veri paylaşımını etkinleştir
             </Label>
           </div>

           {hasChanges && (
             <div className="flex gap-2 pt-4 border-t">
               <Button
                 variant="outline"
                 onClick={() => setSettings(savedSettings)}
                 disabled={isSaving}
                 className="flex-1"
               >
                 İptal
               </Button>
               <Button
                 onClick={handleSave}
                 disabled={isSaving}
                 className="flex-1 bg-green-600 hover:bg-green-700"
               >
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
       <Card id="secure-reset" className="border-muted">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Lock className="h-5 w-5 text-primary" />
             Güvenli Sıfırlama
           </CardTitle>
           <CardDescription>
             Ayarları varsayılana döndürmeden önce ek onay gereklidir.
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="p-3 rounded-lg border border-border/40 bg-muted/30">
             <Button type="button" variant="outline" onClick={onExport} className="gap-2">
               <Download className="h-4 w-4" />
               Dışa Aktar (JSON)
             </Button>
             <p className="text-xs text-muted-foreground mt-2">
               İşlemden önce ayarlarınızı yedekleyin.
             </p>
           </div>
           <div className="flex items-center gap-2">
             <Checkbox
               id="ack1"
               checked={ack1}
               onCheckedChange={(v) => setAck1(!!v)}
             />
             <Label htmlFor="ack1">
               Tüm ayarların sıfırlanacağını onaylıyorum
             </Label>
           </div>
           <div className="flex items-center gap-2">
             <Checkbox
               id="ack2"
               checked={ack2}
               onCheckedChange={(v) => setAck2(!!v)}
             />
             <Label htmlFor="ack2">
               Bu işlemin geri alınamayacağını anladım
             </Label>
           </div>
           <div className="grid gap-2 max-w-sm">
             <Label htmlFor="confirmEmail">E-posta ile doğrula</Label>
             <Input
               id="confirmEmail"
               placeholder={settings.account.email || "user@example.com"}
               value={confirmEmail}
               onChange={(e) => setConfirmEmail(e.target.value)}
             />
             <p className="text-xs text-muted-foreground">
               Kayıtlı e-posta adresinizi tam olarak yazın.
             </p>
           </div>
           <div className="grid gap-2 max-w-sm">
             <Label htmlFor="confirmCode">Onay ifadesi</Label>
             <Input
               id="confirmCode"
               placeholder="SIFIRLA"
               value={confirmCode}
               onChange={(e) => setConfirmCode(e.target.value)}
             />
             <p className="text-xs text-muted-foreground">
               Devam etmek için SIFIRLA yazın.
             </p>
           </div>
           <AlertDialog>
             <AlertDialogTrigger asChild>
               <Button
                 type="button"
                 variant="destructive"
                 disabled={
                   !(
                     ack1 &&
                     ack2 &&
                     (confirmEmail || "") === (settings.account.email || "") &&
                     (confirmCode || "").toUpperCase() === "SIFIRLA"
                   )
                 }
               >
                 Varsayılana Döndür
               </Button>
             </AlertDialogTrigger>
             <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>
                   Ayarlara geri dönülsün mü?
                 </AlertDialogTitle>
                 <AlertDialogDescription>
                   Tüm ayarlar varsayılana dönecek ve bu işlem geri alınamaz.
                   Emin misiniz?
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                 <AlertDialogAction onClick={handleReset}>
                   Evet, sıfırla
                 </AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>
         </CardContent>
       </Card>
     </motion.div>
   </div>
 );
}
