import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { toast } from 'sonner';

interface UseStandardizedProfileSectionOptions<T extends FieldValues> {
 studentId: string;
 sectionName: string;
 apiEndpoint: string;
 form: UseFormReturn<T>;
 defaultValues: T;
 onUpdate?: () => void;
}

export function useStandardizedProfileSection<T extends FieldValues>({
 studentId,
 sectionName,
 apiEndpoint,
 form,
 defaultValues,
 onUpdate,
}: UseStandardizedProfileSectionOptions<T>) {
 const [isSubmitting, setIsSubmitting] = useState(false);

 const { data: savedData, refetch } = useQuery({
 queryKey: [`/api/standardized-profile/${sectionName}`, studentId],
 queryFn: async () => {
 const response = await fetch(`/api/standardized-profile/${studentId}/${apiEndpoint}`, {
   credentials: 'include'
 });
 if (!response.ok) {
 if (response.status === 404) return null;
 throw new Error(`Failed to fetch ${sectionName} data`);
 }
 return response.json();
 },
 enabled: !!studentId,
 });

 useEffect(() => {
 if (savedData && Object.keys(savedData).length > 0) {
 const formattedData: any = {};

 Object.keys(defaultValues).forEach((key) => {
 const value = savedData[key];
 
 if (value === null || value === undefined) {
 formattedData[key] = defaultValues[key];
 } else if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
 try {
 formattedData[key] = JSON.parse(value);
 } catch {
 formattedData[key] = value;
 }
 } else {
 formattedData[key] = value;
 }
 });

 form.reset(formattedData);
 }
 }, [savedData, form, defaultValues]);

 const onSubmit = async (data: T) => {
 setIsSubmitting(true);
 try {
 const payload = {
 id: savedData?.id || self.crypto.randomUUID(),
 studentId,
 ...data,
 };

 const response = await fetch(`/api/standardized-profile/${studentId}/${apiEndpoint}`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 credentials: 'include',
 body: JSON.stringify(payload),
 });

 if (!response.ok) throw new Error('Failed to save');

 toast.success(`${sectionName} kaydedildi`);
 await refetch();
 onUpdate?.();
 } catch (error) {
 toast.error("Kayıt sırasında hata oluştu");
 console.error(`Error saving ${sectionName}:`, error);
 } finally {
 setIsSubmitting(false);
 }
 };

 return {
 savedData,
 isSubmitting,
 onSubmit,
 refetch,
 };
}
