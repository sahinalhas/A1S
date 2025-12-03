import { Button } from "@/components/atoms/Button";
import { useState, FormEvent } from "react";

interface FormSectionProps {
 onSubmit: (data: FormData) => void | Promise<void>;
 onCancel?: () => void;
 children: React.ReactNode;
 submitLabel?: string;
 cancelLabel?: string;
}

export default function FormSection({ 
 onSubmit, 
 onCancel, 
 children, 
 submitLabel ="Kaydet",
 cancelLabel ="İptal"
}: FormSectionProps) {
 const [isSubmitting, setIsSubmitting] = useState(false);

 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setIsSubmitting(true);
 
 const formData = new FormData(e.currentTarget);
 
 try {
 await onSubmit(formData);
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-4">
 {children}
 <div className="flex gap-2">
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting ?"Kaydediliyor..." : submitLabel}
 </Button>
 {onCancel && (
 <Button type="button" variant="outline" onClick={onCancel}>
 {cancelLabel}
 </Button>
 )}
 </div>
 </form>
 );
}
