import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/organisms/Dialog";
import {
 Form,
 FormControl,
 FormDescription,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";
import { SurveyDistribution } from "@/lib/survey-types";
import { useToast } from "@/hooks/utils/toast.utils";
import { useUpdateDistribution } from "@/hooks/features/surveys";

const editSchema = z.object({
 title: z.string().min(1,"Başlık gereklidir"),
 description: z.string().optional(),
 status: z.enum(["DRAFT","ACTIVE","CLOSED","ARCHIVED"]),
 startDate: z.string().optional(),
 endDate: z.string().optional(),
 allowAnonymous: z.boolean(),
 maxResponses: z.number().optional(),
});

type EditForm = z.infer<typeof editSchema>;

interface SurveyDistributionEditDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 distribution: SurveyDistribution;
 onEditComplete?: () => void;
}

export default function SurveyDistributionEditDialog({
 open,
 onOpenChange,
 distribution,
 onEditComplete
}: SurveyDistributionEditDialogProps) {
 const { toast } = useToast();
 const updateDistribution = useUpdateDistribution();

 const form = useForm<EditForm>({
 resolver: zodResolver(editSchema),
 defaultValues: {
 title: distribution.title,
 description: distribution.description ||"",
 status: distribution.status,
 startDate: distribution.startDate ? new Date(distribution.startDate).toISOString().split('T')[0] :"",
 endDate: distribution.endDate ? new Date(distribution.endDate).toISOString().split('T')[0] :"",
 allowAnonymous: distribution.allowAnonymous || false,
 maxResponses: distribution.maxResponses,
 },
 });

 useEffect(() => {
 if (open && distribution) {
 form.reset({
 title: distribution.title,
 description: distribution.description ||"",
 status: distribution.status,
 startDate: distribution.startDate ? new Date(distribution.startDate).toISOString().split('T')[0] :"",
 endDate: distribution.endDate ? new Date(distribution.endDate).toISOString().split('T')[0] :"",
 allowAnonymous: distribution.allowAnonymous || false,
 maxResponses: distribution.maxResponses,
 });
 }
 }, [open, distribution, form]);

 const onSubmit = async (data: EditForm) => {
 try {
 await updateDistribution.mutateAsync({
 id: distribution.id,
 data: {
 ...data,
 startDate: data.startDate || undefined,
 endDate: data.endDate || undefined,
 }
 });

 onOpenChange(false);
 if (onEditComplete) {
 onEditComplete();
 }
 } catch (error) {
 console.error("Error updating distribution:", error);
 toast({
 title:"Hata",
 description:"Anket dağıtımı güncellenemedi",
 variant:"destructive"
 });
 }
 };

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle>Anket Dağıtımını Düzenle</DialogTitle>
 <DialogDescription>
 Anket dağıtımının temel bilgilerini güncelleyin
 </DialogDescription>
 </DialogHeader>

 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
 <FormField
 control={form.control}
 name="title"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Başlık</FormLabel>
 <FormControl>
 <Input {...field} placeholder="Anket dağıtım başlığı" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="description"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Açıklama</FormLabel>
 <FormControl>
 <Textarea {...field} placeholder="Dağıtım açıklaması (opsiyonel)" rows={3} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="status"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Durum</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Durum seçin" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="DRAFT">Taslak</SelectItem>
 <SelectItem value="ACTIVE">Aktif</SelectItem>
 <SelectItem value="CLOSED">Kapalı</SelectItem>
 <SelectItem value="ARCHIVED">Arşivlenmiş</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="grid grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="startDate"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Başlangıç Tarihi</FormLabel>
 <FormControl>
 <Input type="date" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="endDate"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Bitiş Tarihi</FormLabel>
 <FormControl>
 <Input type="date" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 name="maxResponses"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Maksimum Yanıt Sayısı</FormLabel>
 <FormControl>
 <Input 
 type="number" 
 {...field} 
 onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
 value={field.value ||""}
 placeholder="Sınırsız için boş bırakın"
 />
 </FormControl>
 <FormDescription>
 Boş bırakılırsa sınırsız yanıt kabul edilir
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <DialogFooter>
 <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
 İptal
 </Button>
 <Button type="submit">
 Güncelle
 </Button>
 </DialogFooter>
 </form>
 </Form>
 </DialogContent>
 </Dialog>
 );
}
