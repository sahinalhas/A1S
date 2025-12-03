import { Card, CardContent } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from "@/components/organisms/Dialog";
import { FileText, CheckCircle2, Tag } from "lucide-react";
import { SurveyTemplate } from "@/lib/survey-types";
import { motion, AnimatePresence } from "framer-motion";

interface TemplateSelectorProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 templates: SurveyTemplate[];
 onSelect: (template: SurveyTemplate) => void;
}

export default function TemplateSelector({ open, onOpenChange, templates, onSelect }: TemplateSelectorProps) {
 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
 <DialogHeader className="border-b pb-4">
 <DialogTitle className="text-2xl font-bold">Anket Şablonu Seçin</DialogTitle>
 <DialogDescription className="text-base">
 Dağıtım için bir anket şablonu seçin. Seçtiğiniz şablon ile sınıflara dağıtım yapabilirsiniz.
 </DialogDescription>
 </DialogHeader>
 
 <div className="flex-1 overflow-y-auto px-1 py-4">
 {templates.length === 0 ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="text-center py-16"
 >
 <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
 <FileText className="h-12 w-12 text-muted-foreground" />
 </div>
 <h3 className="text-xl font-semibold mb-2">Henüz anket şablonu bulunmuyor</h3>
 <p className="text-muted-foreground">Önce bir anket şablonu oluşturun</p>
 </motion.div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <AnimatePresence mode="popLayout">
 {templates.map((template) => (
 <motion.div
 key={template.id}
 layout
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ duration: 0.2 }}
 >
 <Card 
 className="group cursor-pointer h-full"
 onClick={() => onSelect(template)}
 >
 <CardContent className="p-6">
 <div className="flex flex-col h-full">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <h4 className="font-semibold text-lg mb-2 group-">
 {template.title}
 </h4>
 {template.description && (
 <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
 {template.description}
 </p>
 )}
 </div>
 <div className="ml-4 flex-shrink-0">
 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group- group-">
 <FileText className="h-5 w-5" />
 </div>
 </div>
 </div>
 
 <div className="flex flex-wrap items-center gap-2 mt-auto">
 {template.tags && template.tags.length > 0 && (
 <>
 {template.tags.slice(0, 3).map((tag) => (
 <Badge 
 key={tag} 
 variant="secondary"
 className="gap-1"
 >
 <Tag className="h-3 w-3" />
 {tag}
 </Badge>
 ))}
 {template.tags.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{template.tags.length - 3} daha
 </Badge>
 )}
 </>
 )}
 </div>

 <div className="mt-4 pt-4 border-t">
 <Button 
 variant="outline" 
 size="sm"
 className="w-full group- group- group-"
 >
 Bu Şablonu Seç
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 )}
 </div>
 </DialogContent>
 </Dialog>
 );
}
