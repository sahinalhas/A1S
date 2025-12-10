import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Slider } from "@/components/atoms/Slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { MultiSelect } from "@/components/molecules/MultiSelect";
import { Heart } from "lucide-react";
import TAXONOMY from "@shared/data/student-profile-taxonomy.json";
const { SOCIAL_SKILLS } = TAXONOMY;
import { useStandardizedProfileSection } from "@/hooks/state/standardized-profile-section.state";
import { useFormDirty } from "@/pages/StudentProfile/StudentProfile";

const socialEmotionalSchema = z.object({
    assessmentDate: z.string(),
    strongSocialSkills: z.array(z.string()),
    developingSocialSkills: z.array(z.string()),
    empathyLevel: z.number().min(1).max(10),
    selfAwarenessLevel: z.number().min(1).max(10),
    emotionRegulationLevel: z.number().min(1).max(10),
    conflictResolutionLevel: z.number().min(1).max(10),
    leadershipLevel: z.number().min(1).max(10),
    teamworkLevel: z.number().min(1).max(10),
    communicationLevel: z.number().min(1).max(10),
    friendCircleSize: z.enum(['YOK', 'AZ', 'ORTA', 'GENİŞ']).optional(),
    friendCircleQuality: z.enum(['ZAYIF', 'ORTA', 'İYİ', 'ÇOK_İYİ']).optional(),
    socialRole: z.enum(['LİDER', 'AKTİF_ÜYE', 'TAKİPÇİ', 'GÖZLEMCİ', 'İZOLE']).optional(),
    bullyingStatus: z.enum(['YOK', 'MAĞDUR', 'FAİL', 'HER_İKİSİ', 'GÖZLEMCİ']).optional(),
    identifiedRiskFactors: z.array(z.string()).optional(),
    protectiveFactors: z.array(z.string()).optional(),
    recommendedInterventions: z.array(z.string()).optional(),
    additionalNotes: z.string().optional(),
});

type SocialEmotionalFormValues = z.infer<typeof socialEmotionalSchema>;

interface StandardizedSocialEmotionalSectionProps {
    studentId: string;
    socialEmotionalData?: any;
    onUpdate: () => void;
}

export default function StandardizedSocialEmotionalSection({
    studentId,
    socialEmotionalData,
    onUpdate
}: StandardizedSocialEmotionalSectionProps) {
    const { setIsDirty, registerFormSubmit, unregisterFormSubmit } = useFormDirty();
    const componentId = useMemo(() => crypto.randomUUID(), []);
    const formDefaultValues = {
        assessmentDate: new Date().toISOString().slice(0, 10),
        strongSocialSkills: [],
        developingSocialSkills: [],
        empathyLevel: 5,
        selfAwarenessLevel: 5,
        emotionRegulationLevel: 5,
        conflictResolutionLevel: 5,
        leadershipLevel: 5,
        teamworkLevel: 5,
        communicationLevel: 5,
        friendCircleSize: undefined,
        friendCircleQuality: undefined,
        socialRole: undefined,
        bullyingStatus: undefined,
        identifiedRiskFactors: [],
        protectiveFactors: [],
        recommendedInterventions: [],
        additionalNotes: "",
    };

    const form = useForm<SocialEmotionalFormValues>({
        resolver: zodResolver(socialEmotionalSchema),
        defaultValues: formDefaultValues,
    });

    useEffect(() => {
        const subscription = form.watch(() => {
            setIsDirty(true);
        });
        return () => subscription.unsubscribe();
    }, [form, setIsDirty]);

    const { isSubmitting, onSubmit } = useStandardizedProfileSection({
        studentId,
        sectionName: 'Sosyal-duygusal profil',
        apiEndpoint: 'social-emotional',
        form,
        defaultValues: formDefaultValues,
        onUpdate,
    });

    const onSubmitRef = useRef(onSubmit);
    useEffect(() => {
        onSubmitRef.current = onSubmit;
    }, [onSubmit]);

    useEffect(() => {
        registerFormSubmit(componentId, async () => {
            const isValid = await form.trigger();
            if (isValid) {
                await form.handleSubmit(onSubmitRef.current)();
            }
        });
        return () => unregisterFormSubmit(componentId);
    }, [form, componentId, registerFormSubmit, unregisterFormSubmit]);

    const riskFactorOptions = [
        { value: 'DÜŞÜK_AKADEMİK_BAŞARI', label: 'Düşük Akademik Başarı', category: 'Akademik' },
        { value: 'DEVAMSIZLIK', label: 'Yüksek Devamsızlık', category: 'Akademik' },
        { value: 'ÖĞRENİM_GÜÇLÜGü', label: 'Öğrenim Güçlüğü', category: 'Akademik' },
        { value: 'AİLE_ÇATIŞMASI', label: 'Aile İçi Çatışma', category: 'Ailesel' },
        { value: 'İHMAL', label: 'İhmal/İstismar', category: 'Ailesel' },
        { value: 'EKONOMİK_ZORLUK', label: 'Ekonomik Zorluk', category: 'Ailesel' },
        { value: 'MADDE_KULLANIMI', label: 'Madde Kullanımı', category: 'Davranışsal' },
        { value: 'ŞİDDET', label: 'Şiddet Eğilimi', category: 'Davranışsal' },
        { value: 'AKRAN_BASKI', label: 'Olumsuz Akran Baskısı', category: 'Sosyal' },
        { value: 'İZOLASYON', label: 'Sosyal İzolasyon', category: 'Sosyal' },
        { value: 'DEPRESYON', label: 'Depresyon Belirtileri', category: 'Duygusal' },
        { value: 'KAYGI', label: 'Yüksek Kaygı', category: 'Duygusal' },
        { value: 'TRAVMA', label: 'Travma Öyküsü', category: 'Duygusal' },
    ];

    const protectiveFactorOptions = [
        { value: 'AİLE_DESTEĞİ', label: 'Güçlü Aile Desteği', category: 'Ailesel' },
        { value: 'OLUMLU_ROL_MODEL', label: 'Olumlu Rol Model', category: 'Ailesel' },
        { value: 'AKADEMİK_YETKİNLİK', label: 'Akademik Yetkinlik', category: 'Akademik' },
        { value: 'OKUL_BAĞLILIĞI', label: 'Okul Bağlılığı', category: 'Akademik' },
        { value: 'SOSYAL_BECERİLER', label: 'İyi Sosyal Beceriler', category: 'Sosyal' },
        { value: 'OLUMLU_AKRAN_İLİŞKİLERİ', label: 'Olumlu Akran İlişkileri', category: 'Sosyal' },
        { value: 'PROBLEM_ÇÖZME', label: 'Problem Çözme Becerisi', category: 'Bireysel' },
        { value: 'ÖZ_YETERLİLİK', label: 'Yüksek Öz-yeterlilik', category: 'Bireysel' },
        { value: 'BASAMSAL_İNANÇ', label: 'Olumlu Gelecek İnancı', category: 'Bireysel' },
        { value: 'TOPLULUK_DESTEĞİ', label: 'Topluluk/Kurum Desteği', category: 'Çevresel' },
    ];

    const interventionOptions = [
        { value: 'BİREYSEL_DANIŞMANLIK', label: 'Bireysel Danışmanlık', category: 'Psikolojik Destek' },
        { value: 'GRUP_DANIŞMANLIK', label: 'Grup Danışmanlığı', category: 'Psikolojik Destek' },
        { value: 'AİLE_DANIŞMANLIK', label: 'Aile Danışmanlığı', category: 'Psikolojik Destek' },
        { value: 'AKADEMİK_DESTEK', label: 'Akademik Destek Programı', category: 'Akademik' },
        { value: 'DERS_ÇALIŞMA_BECERİLERİ', label: 'Ders Çalışma Becerileri', category: 'Akademik' },
        { value: 'SOSYAL_BECERİ_EĞİTİMİ', label: 'Sosyal Beceri Eğitimi', category: 'Sosyal-Duygusal' },
        { value: 'ÖFKE_YÖNETİMİ', label: 'Öfke Yönetimi', category: 'Sosyal-Duygusal' },
        { value: 'STRES_YÖNETİMİ', label: 'Stres Yönetimi', category: 'Sosyal-Duygusal' },
        { value: 'MENTOR_PROGRAMI', label: 'Mentor Programı', category: 'Destek Sistemleri' },
        { value: 'OKUL_DIŞI_ETKİNLİK', label: 'Okul Dışı Etkinlik', category: 'Destek Sistemleri' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Sosyal-Duygusal Profil
                </CardTitle>
                <CardDescription>
                    Ölçülebilir SEL yetkinlikleri ve sosyal etkileşim becerileri
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="assessmentDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Değerlendirme Tarihi</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4 border-t pt-6">
                            <h4 className="text-sm font-semibold text-muted-foreground">
                                Sosyal Beceriler ve Sosyal Roller
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="strongSocialSkills"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Güçlü Sosyal Beceriler</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={SOCIAL_SKILLS}
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Güçlü becerileri seçin"
                                                    groupByCategory
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="developingSocialSkills"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Geliştirilmesi Gereken Beceriler</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={SOCIAL_SKILLS}
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Gelişim alanlarını seçin"
                                                    groupByCategory
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="friendCircleSize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Arkadaş Çevresi Büyüklüğü</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seçiniz" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="YOK">Yok</SelectItem>
                                                    <SelectItem value="AZ">Az (1-2 arkadaş)</SelectItem>
                                                    <SelectItem value="ORTA">Orta (3-5 arkadaş)</SelectItem>
                                                    <SelectItem value="GENİŞ">Geniş (6+ arkadaş)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="friendCircleQuality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Arkadaşlık İlişkisi Kalitesi</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seçiniz" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ZAYIF">Zayıf</SelectItem>
                                                    <SelectItem value="ORTA">Orta</SelectItem>
                                                    <SelectItem value="İYİ">İyi</SelectItem>
                                                    <SelectItem value="ÇOK_İYİ">Çok İyi</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="socialRole"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sosyal Rol</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seçiniz" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="LİDER">Lider</SelectItem>
                                                    <SelectItem value="AKTİF_ÜYE">Aktif Üye</SelectItem>
                                                    <SelectItem value="TAKİPÇİ">Takipçi</SelectItem>
                                                    <SelectItem value="GÖZLEMCİ">Gözlemci</SelectItem>
                                                    <SelectItem value="İZOLE">İzole</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="bullyingStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Zorbalık Durumu</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seçiniz" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="YOK">Yok</SelectItem>
                                                    <SelectItem value="MAĞDUR">Mağdur</SelectItem>
                                                    <SelectItem value="FAİL">Fail</SelectItem>
                                                    <SelectItem value="HER_İKİSİ">Her İkisi</SelectItem>
                                                    <SelectItem value="GÖZLEMCİ">Gözlemci</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4 mt-6">
                                <h4 className="text-sm font-semibold text-muted-foreground">
                                    Risk ve Koruyucu Faktörler
                                </h4>

                                <FormField
                                    control={form.control}
                                    name="identifiedRiskFactors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tespit Edilen Risk Faktörleri</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={riskFactorOptions}
                                                    selected={field.value || []}
                                                    onChange={field.onChange}
                                                    placeholder="Risk faktörlerini seçin"
                                                    groupByCategory
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="protectiveFactors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Koruyucu Faktörler</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={protectiveFactorOptions}
                                                    selected={field.value || []}
                                                    onChange={field.onChange}
                                                    placeholder="Koruyucu faktörleri seçin"
                                                    groupByCategory
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="recommendedInterventions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Önerilen Müdahaleler</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={interventionOptions}
                                                    selected={field.value || []}
                                                    onChange={field.onChange}
                                                    placeholder="Müdahaleleri seçin"
                                                    groupByCategory
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="additionalNotes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ek Notlar</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Sosyal-duygusal gelişim hakkında ek gözlemler..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}