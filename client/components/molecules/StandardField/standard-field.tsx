import { useState, useEffect } from "react";
import { Label } from "@/components/atoms/Label";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { Button } from "@/components/atoms/Button";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/atoms/Badge";

interface StandardFieldProps {
 label: string;
 value?: string;
 detailValue?: string;
 onValueChange?: (value: string) => void;
 onDetailChange?: (detail: string) => void;
 children: React.ReactNode;
 required?: boolean;
 description?: string;
}

export function StandardField({
 label,
 value,
 detailValue,
 onValueChange,
 onDetailChange,
 children,
 required = false,
 description,
}: StandardFieldProps) {
 const [showDetail, setShowDetail] = useState(false);

 useEffect(() => {
 if (detailValue && detailValue.trim()) {
 setShowDetail(true);
 }
 }, [detailValue]);

 return (
 <div className="space-y-2">
 <div className="flex items-start justify-between gap-2">
 <div className="flex-1">
 <Label className="flex items-center gap-1">
 {label}
 {required && <span className="text-red-500">*</span>}
 </Label>
 {description && (
 <p className="text-xs text-muted-foreground mt-1">{description}</p>
 )}
 </div>
 <Button
 type="button"
 variant={showDetail ?"secondary" :"ghost"}
 size="sm"
 onClick={() => setShowDetail(!showDetail)}
 className="shrink-0 relative"
 title={showDetail ?"Detayı gizle" :"Detay ekle"}
 >
 <MessageSquare className="h-4 w-4" />
 {detailValue && detailValue.trim() && !showDetail && (
 <Badge 
 variant="default" 
 className="absolute -top-1 -right-1 h-2 w-2 p-0 rounded-full bg-blue-500"
 >
 <span className="sr-only">Detay mevcut</span>
 </Badge>
 )}
 {showDetail ? (
 <ChevronUp className="h-3 w-3 ml-1" />
 ) : (
 <ChevronDown className="h-3 w-3 ml-1" />
 )}
 </Button>
 </div>

 <div className="space-y-3">
 {children}

 {showDetail && (
 <div className=" slide-in-from-top-2">
 <Label className="text-xs text-muted-foreground">
 Detay & Açıklama (Opsiyonel)
 </Label>
 <Textarea
 value={detailValue ||""}
 onChange={(e) => onDetailChange?.(e.target.value)}
 placeholder="İstediğiniz detayları, gözlemleri veya ek bilgileri buraya yazabilirsiniz..."
 className="mt-1 min-h-[80px] resize-y"
 />
 </div>
 )}
 </div>
 </div>
 );
}
