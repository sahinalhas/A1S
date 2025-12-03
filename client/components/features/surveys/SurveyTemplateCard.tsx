
import React from "react";
import { Card, CardHeader } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { FileText, MoreVertical, Edit, Copy, Trash2 } from "lucide-react";
import {
 DropdownMenu,
 DropdownMenuTrigger,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
} from "@/components/organisms/DropdownMenu";
import { SurveyTemplate, TargetAudience } from "@/lib/survey-types";
import { motion } from "framer-motion";

const targetAudienceLabels: Record<TargetAudience, string> = {
 STUDENT:"Öğrenci",
 PARENT:"Veli",
 TEACHER:"Öğretmen",
 ADMINISTRATOR:"İdareci",
 STAFF:"Personel",
 ALUMNI:"Mezun",
 EXTERNAL_STAKEHOLDER:"Kurum Dışı Paydaş"
};

const audienceColorMap: Record<TargetAudience, string> = {
 STUDENT:"bg-blue-50 text-blue-700 border-blue-200",
 PARENT:"bg-green-50 text-green-700 border-green-200",
 TEACHER:"bg-purple-50 text-purple-700 border-purple-200",
 ADMINISTRATOR:"bg-orange-50 text-orange-700 border-orange-200",
 STAFF:"bg-yellow-50 text-yellow-700 border-yellow-200",
 ALUMNI:"bg-pink-50 text-pink-700 border-pink-200",
 EXTERNAL_STAKEHOLDER:"bg-gray-50 text-gray-700 border-gray-200"
};

interface SurveyTemplateCardProps {
 template: SurveyTemplate;
 onDistribute: (template: SurveyTemplate) => void;
 onEdit: (template: SurveyTemplate) => void;
 onDuplicate: (template: SurveyTemplate) => void;
 onDelete: (template: SurveyTemplate) => void;
}

const SurveyTemplateCard = React.forwardRef<HTMLDivElement, SurveyTemplateCardProps>(({ 
 template, 
 onDistribute, 
 onEdit, 
 onDuplicate, 
 onDelete 
}, ref) => {
 return (
 <motion.div
 ref={ref}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3, ease:"easeOut" }}
 className="h-full"
 >
 <Card 
 className="h-full flex flex-col overflow-hidden ease-out cursor-pointer group"
 onClick={() => onEdit(template)}
 >
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between gap-2 mb-3">
 <div className="flex items-start gap-2 flex-1 min-w-0">
 <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
 <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-">
 {template.title}
 </h3>
 </div>
 
 <DropdownMenu>
 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-8 w-8 p-0 flex-shrink-0"
 >
 <MoreVertical className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
 <DropdownMenuItem onClick={(e) => {
 e.stopPropagation();
 onEdit(template);
 }}>
 <Edit className="h-4 w-4 mr-2" />
 Düzenle
 </DropdownMenuItem>
 <DropdownMenuItem onClick={(e) => {
 e.stopPropagation();
 onDuplicate(template);
 }}>
 <Copy className="h-4 w-4 mr-2" />
 Kopyala
 </DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem 
 className="text-destructive focus:text-destructive"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(template);
 }}
 >
 <Trash2 className="h-4 w-4 mr-2" />
 Sil
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 {template.description && (
 <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
 {template.description}
 </p>
 )}

 <div className="flex flex-wrap items-center gap-2 mb-3">
 <Badge 
 variant="secondary"
 className={audienceColorMap[template.targetAudience]}
 >
 {targetAudienceLabels[template.targetAudience]}
 </Badge>
 {template.tags && template.tags.length > 0 && (
 <>
 {template.tags.slice(0, 2).map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {template.tags.length > 2 && (
 <Badge variant="outline" className="text-xs">
 +{template.tags.length - 2}
 </Badge>
 )}
 </>
 )}
 </div>

 <div className="flex items-center justify-between pt-2 border-t">
 <Button
 variant="outline"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDistribute(template);
 }}
 className="h-8 flex-1"
 >
 Dağıt
 </Button>
 </div>
 </CardHeader>
 </Card>
 </motion.div>
 );
});

SurveyTemplateCard.displayName = 'SurveyTemplateCard';

export default SurveyTemplateCard;
