﻿/**
 * Unified Identity Section
 * Temel kimlik bilgileri, veli iletişim, adres bilgileri
 * Manuel kaydetme özelliği ile yenilenmiş versiyon.
 */

import { useEffect, useMemo, useCallback, useState } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/atoms/Select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/organisms/Form";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFormDirty } from "@/pages/StudentProfile/StudentProfile";
import { toast } from "sonner";
import {
    User,
    Phone,
    Mail,
    MapPin,
    GraduationCap,
    Users,
    Calendar,
    Hash,
    Home,
    Briefcase,
} from "lucide-react";
import { SaveButton } from "../SaveButton";

// --- Schema Definition ---

const unifiedIdentitySchema = z.object({
    name: z.string().min(1, "Ad zorunludur"),
    surname: z.string().min(1, "Soyad zorunludur"),
    tcIdentityNo: z.string().optional(),
    studentNumber: z.string().optional(),
    class: z.string().optional(),
    gender: z.enum(["K", "E"]).optional().or(z.literal("")),
    birthDate: z.string().optional(),
    birthPlace: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Geçerli bir e-posta giriniz").optional().or(z.literal("")),
    province: z.string().optional(),
    district: z.string().optional(),
    address: z.string().optional(),

    motherName: z.string().optional(),
    motherEducation: z.string().optional(),
    motherOccupation: z.string().optional(),
    motherEmail: z.string().email("Geçerli bir e-posta giriniz").optional().or(z.literal("")),
    motherPhone: z.string().optional(),
    motherVitalStatus: z.enum(["Sağ", "Vefat Etmiş"]).optional().or(z.literal("")),
    motherLivingStatus: z.enum(["Birlikte", "Ayrı"]).optional().or(z.literal("")),

    fatherName: z.string().optional(),
    fatherEducation: z.string().optional(),
    fatherOccupation: z.string().optional(),
    fatherEmail: z.string().email("Geçerli bir e-posta giriniz").optional().or(z.literal("")),
    fatherPhone: z.string().optional(),
    fatherVitalStatus: z.enum(["Sağ", "Vefat Etmiş"]).optional().or(z.literal("")),
    fatherLivingStatus: z.enum(["Birlikte", "Ayrı"]).optional().or(z.literal("")),

    guardianName: z.string().optional(),
    guardianRelation: z.string().optional(),
    guardianPhone: z.string().optional(),
    guardianEmail: z.string().email("Geçerli bir e-posta giriniz").optional().or(z.literal("")),

    numberOfSiblings: z.number().optional(),

    livingWith: z.string().optional(),
    homeRentalStatus: z.string().optional(),
    homeHeatingType: z.string().optional(),
    transportationToSchool: z.string().optional(),
    studentWorkStatus: z.string().optional(),
});

type UnifiedIdentityFormValues = z.infer<typeof unifiedIdentitySchema>;

// --- Field Groups for Cards ---
// Hangi kartta hangi alanların olduğunu tanımlıyoruz ki o kartta değişiklik olunca butonu gösterelim.

const CARD_FIELDS = {
    IDENTITY: ['name', 'surname', 'tcIdentityNo', 'studentNumber', 'class', 'gender', 'birthDate', 'birthPlace'],
    CONTACT: ['phone', 'email', 'province', 'district', 'address'],
    MOTHER: ['motherName', 'motherEducation', 'motherOccupation', 'motherEmail', 'motherPhone', 'motherVitalStatus', 'motherLivingStatus'],
    FATHER: ['fatherName', 'fatherEducation', 'fatherOccupation', 'fatherEmail', 'fatherPhone', 'fatherVitalStatus', 'fatherLivingStatus'],
    GUARDIAN: ['guardianName', 'guardianRelation', 'guardianPhone', 'guardianEmail'],
    OTHER: ['numberOfSiblings', 'livingWith', 'homeRentalStatus', 'homeHeatingType', 'transportationToSchool', 'studentWorkStatus']
};

interface UnifiedIdentitySectionProps {
    student: Student;
    onUpdate: () => void;
}

export default function UnifiedIdentitySection({ student, onUpdate }: UnifiedIdentitySectionProps) {
    const { registerFormSubmit, unregisterFormSubmit } = useFormDirty();
    const componentId = useMemo(() => crypto.randomUUID(), []);

    // Form State
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const form = useForm<UnifiedIdentityFormValues>({
        resolver: zodResolver(unifiedIdentitySchema),
        mode: 'onSubmit',
        defaultValues: {
            name: student.name || "",
            surname: student.surname || "",
            tcIdentityNo: student.tcIdentityNo || "",
            studentNumber: student.studentNumber || "",
            class: student.class || "",
            gender: student.gender,
            birthDate: student.birthDate || "",
            birthPlace: student.birthPlace || "",
            phone: student.phone || "",
            email: student.email || "",
            province: student.province || "",
            district: student.district || "",
            address: student.address || "",

            motherName: student.motherName || "",
            motherEducation: student.motherEducation || "",
            motherOccupation: student.motherOccupation || "",
            motherEmail: student.motherEmail || "",
            motherPhone: student.motherPhone || "",
            motherVitalStatus: student.motherVitalStatus,
            motherLivingStatus: student.motherLivingStatus,

            fatherName: student.fatherName || "",
            fatherEducation: student.fatherEducation || "",
            fatherOccupation: student.fatherOccupation || "",
            fatherEmail: student.fatherEmail || "",
            fatherPhone: student.fatherPhone || "",
            fatherVitalStatus: student.fatherVitalStatus,
            fatherLivingStatus: student.fatherLivingStatus,

            guardianName: student.guardianName || "",
            guardianRelation: student.guardianRelation || "",
            guardianPhone: student.guardianPhone || "",
            guardianEmail: student.guardianEmail || "",

            numberOfSiblings: student.numberOfSiblings,

            livingWith: student.livingWith || "",
            homeRentalStatus: student.homeRentalStatus || "",
            homeHeatingType: student.homeHeatingType || "",
            transportationToSchool: student.transportationToSchool || "",
            studentWorkStatus: student.studentWorkStatus || "",
        },
    });

    // Dirty fields tracking
    const { dirtyFields } = useFormState({ control: form.control });

    // Helper to check if a specific card has dirty fields
    const isCardDirty = (fieldNames: string[]) => {
        return fieldNames.some(field => dirtyFields[field as keyof UnifiedIdentityFormValues]);
    };

    const onSubmit = useCallback(async (data: UnifiedIdentityFormValues) => {
        setIsSaving(true);
        try {
            const updatedStudent: Student = {
                ...student,
                ...data,
                numberOfSiblings: typeof data.numberOfSiblings === "number" ? data.numberOfSiblings : undefined,
            };
            await upsertStudent(updatedStudent);

            // Reset form with new values to clear dirty state
            form.reset(data);

            setShowSuccess(true);
            toast.success("Bilgiler başarıyla kaydedildi");
            setTimeout(() => setShowSuccess(false), 2000);

            onUpdate();
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Kaydetme sırasında bir hata oluştu");
        } finally {
            setIsSaving(false);
        }
    }, [student, onUpdate, form]);

    const handleSave = form.handleSubmit(onSubmit);

    // Reset form when student prop changes
    useEffect(() => {
        form.reset({
            name: student.name || "",
            surname: student.surname || "",
            tcIdentityNo: student.tcIdentityNo || "",
            studentNumber: student.studentNumber || "",
            class: student.class || "",
            gender: student.gender,
            birthDate: student.birthDate || "",
            birthPlace: student.birthPlace || "",
            phone: student.phone || "",
            email: student.email || "",
            province: student.province || "",
            district: student.district || "",
            address: student.address || "",
            motherName: student.motherName || "",
            motherEducation: student.motherEducation || "",
            motherOccupation: student.motherOccupation || "",
            motherEmail: student.motherEmail || "",
            motherPhone: student.motherPhone || "",
            motherVitalStatus: student.motherVitalStatus,
            motherLivingStatus: student.motherLivingStatus,
            fatherName: student.fatherName || "",
            fatherEducation: student.fatherEducation || "",
            fatherOccupation: student.fatherOccupation || "",
            fatherEmail: student.fatherEmail || "",
            fatherPhone: student.fatherPhone || "",
            fatherVitalStatus: student.fatherVitalStatus,
            fatherLivingStatus: student.fatherLivingStatus,
            guardianName: student.guardianName || "",
            guardianRelation: student.guardianRelation || "",
            guardianPhone: student.guardianPhone || "",
            guardianEmail: student.guardianEmail || "",
            numberOfSiblings: student.numberOfSiblings,
            livingWith: student.livingWith || "",
            homeRentalStatus: student.homeRentalStatus || "",
            homeHeatingType: student.homeHeatingType || "",
            transportationToSchool: student.transportationToSchool || "",
            studentWorkStatus: student.studentWorkStatus || "",
        });
    }, [student, form]);

    return (
        <Form {...form}>
            <div className="space-y-6">

                {/* 1. Temel Kimlik Bilgileri */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="h-5 w-5 text-primary" />
                                    Temel Kimlik Bilgileri
                                </CardTitle>
                                <CardDescription>Öğrencinin temel tanımlayıcı bilgileri</CardDescription>
                            </div>
                            <SaveButton
                                isDirty={isCardDirty(CARD_FIELDS.IDENTITY)}
                                isSaving={isSaving}
                                showSuccess={showSuccess}
                                onSave={handleSave}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Ad *</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="Öğrenci adı" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="surname" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Soyad *</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="Öğrenci soyadı" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="tcIdentityNo" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" />TC Kimlik No</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="11 haneli TC no" maxLength={11} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="studentNumber" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" />Okul No</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="Örn: 101" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="class" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />Sınıf</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="Örn: 9/A" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="gender" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cinsiyet</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="K">Kız</SelectItem>
                                            <SelectItem value="E">Erkek</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="birthDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Doğum Tarihi</FormLabel>
                                    <FormControl><Input type="date" {...field} className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="birthPlace" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Doğum Yeri</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="İl/İlçe" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. İletişim & Adres */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Phone className="h-5 w-5 text-primary" />
                                    İletişim & Adres
                                </CardTitle>
                                <CardDescription>Öğrenci iletişim bilgileri ve ev adresi</CardDescription>
                            </div>
                            <SaveButton
                                isDirty={isCardDirty(CARD_FIELDS.CONTACT)}
                                isSaving={isSaving}
                                showSuccess={showSuccess}
                                onSave={handleSave}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">İletişim Bilgileri</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Telefon</FormLabel>
                                        <FormControl><Input {...field} type="tel" className="h-10" placeholder="+90 5XX..." /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />E-posta</FormLabel>
                                        <FormControl><Input {...field} type="email" className="h-10" placeholder="ornek@email.com" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Adres Bilgileri</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="province" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />İl</FormLabel>
                                        <FormControl><Input {...field} className="h-10" placeholder="Örn: İstanbul" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="district" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5" />İlçe</FormLabel>
                                        <FormControl><Input {...field} className="h-10" placeholder="Örn: Kadıköy" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem className="mt-4">
                                    <FormLabel>Açık Adres</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="Mahalle, sokak, bina no..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Anne Bilgileri */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Users className="h-5 w-5 text-primary" />
                                    Anne Bilgileri
                                </CardTitle>
                            </div>
                            <SaveButton
                                isDirty={isCardDirty(CARD_FIELDS.MOTHER)}
                                isSaving={isSaving}
                                showSuccess={showSuccess}
                                onSave={handleSave}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="motherName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adı Soyadı</FormLabel>
                                    <FormControl><Input {...field} className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="motherPhone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cep Telefonu</FormLabel>
                                    <FormControl><Input {...field} type="tel" className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="motherEmail" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-posta</FormLabel>
                                    <FormControl><Input {...field} type="email" className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="motherEducation" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Öğrenim Durumu</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="İlkokul">İlkokul</SelectItem>
                                            <SelectItem value="Ortaokul">Ortaokul</SelectItem>
                                            <SelectItem value="Lise">Lise</SelectItem>
                                            <SelectItem value="Ön Lisans">Ön Lisans</SelectItem>
                                            <SelectItem value="Lisans">Lisans</SelectItem>
                                            <SelectItem value="Yüksek Lisans">Yüksek Lisans</SelectItem>
                                            <SelectItem value="Doktora">Doktora</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="motherOccupation" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meslek</FormLabel>
                                    <FormControl><Input {...field} className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="motherVitalStatus" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sağlık Durumu</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Sağ">Sağ</SelectItem>
                                            <SelectItem value="Vefat Etmiş">Vefat Etmiş</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="motherLivingStatus" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yaşam Durumu</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Birlikte">Birlikte</SelectItem>
                                            <SelectItem value="Ayrı">Ayrı</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Baba Bilgileri */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Users className="h-5 w-5 text-primary" />
                                    Baba Bilgileri
                                </CardTitle>
                            </div>
                            <SaveButton
                                isDirty={isCardDirty(CARD_FIELDS.FATHER)}
                                isSaving={isSaving}
                                showSuccess={showSuccess}
                                onSave={handleSave}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="fatherName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adı Soyadı</FormLabel>
                                    <FormControl><Input {...field} className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="fatherPhone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cep Telefonu</FormLabel>
                                    <FormControl><Input {...field} type="tel" className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="fatherEmail" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-posta</FormLabel>
                                    <FormControl><Input {...field} type="email" className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="fatherEducation" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Öğrenim Durumu</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="İlkokul">İlkokul</SelectItem>
                                            <SelectItem value="Ortaokul">Ortaokul</SelectItem>
                                            <SelectItem value="Lise">Lise</SelectItem>
                                            <SelectItem value="Ön Lisans">Ön Lisans</SelectItem>
                                            <SelectItem value="Lisans">Lisans</SelectItem>
                                            <SelectItem value="Yüksek Lisans">Yüksek Lisans</SelectItem>
                                            <SelectItem value="Doktora">Doktora</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="fatherOccupation" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meslek</FormLabel>
                                    <FormControl><Input {...field} className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="fatherVitalStatus" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sağlık Durumu</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Sağ">Sağ</SelectItem>
                                            <SelectItem value="Vefat Etmiş">Vefat Etmiş</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="fatherLivingStatus" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yaşam Durumu</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Birlikte">Birlikte</SelectItem>
                                            <SelectItem value="Ayrı">Ayrı</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Vasi Bilgileri */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Phone className="h-5 w-5 text-primary" />
                                    Vasi / Acil İletişim
                                </CardTitle>
                            </div>
                            <SaveButton
                                isDirty={isCardDirty(CARD_FIELDS.GUARDIAN)}
                                isSaving={isSaving}
                                showSuccess={showSuccess}
                                onSave={handleSave}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="guardianName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adı Soyadı</FormLabel>
                                    <FormControl><Input {...field} className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="guardianRelation" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yakınlık Derecesi</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="Örn: Dayı, Teyze..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="guardianPhone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cep Telefonu</FormLabel>
                                    <FormControl><Input {...field} type="tel" className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="guardianEmail" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-posta</FormLabel>
                                    <FormControl><Input {...field} type="email" className="h-10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Diğer Bilgiler */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Home className="h-5 w-5 text-primary" />
                                    Diğer Bilgiler
                                </CardTitle>
                            </div>
                            <SaveButton
                                isDirty={isCardDirty(CARD_FIELDS.OTHER)}
                                isSaving={isSaving}
                                showSuccess={showSuccess}
                                onSave={handleSave}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="numberOfSiblings" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kardeş Sayısı</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            {...field}
                                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="livingWith" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kiminle Yaşıyor?</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="Anne, Baba, Aile..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="homeRentalStatus" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ev Durumu</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Kira">Kira</SelectItem>
                                            <SelectItem value="Kendine Ait">Kendine Ait</SelectItem>
                                            <SelectItem value="Lojman">Lojman</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="homeHeatingType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Isınma Şekli</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="Doğalgaz, Soba..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="transportationToSchool" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Okula Ulaşım</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="Servis, Yürüyerek..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="studentWorkStatus" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Çalışma Durumu</FormLabel>
                                    <FormControl><Input {...field} className="h-10" placeholder="Çalışmıyor / Çalışıyor" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

            </div>
        </Form>
    );
}
