import { useState, useMemo } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Badge } from "@/components/atoms/Badge";
import { FileText, Grid3x3, List, Search, Filter, X, MoreVertical, Edit, Copy, Trash2 } from "lucide-react";
import {
 DropdownMenu,
 DropdownMenuTrigger,
 DropdownMenuContent,
 DropdownMenuCheckboxItem,
 DropdownMenuSeparator,
 DropdownMenuLabel,
 DropdownMenuItem,
} from "@/components/organisms/DropdownMenu";
import { SurveyTemplate, TargetAudience } from "@/lib/survey-types";
import SurveyTemplateCard from "./SurveyTemplateCard";
import { motion, AnimatePresence } from "framer-motion";

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
 STUDENT: 'bg-blue-50 text-blue-700 border-blue-200',
 PARENT: 'bg-green-50 text-green-700 border-green-200',
 TEACHER: 'bg-purple-50 text-purple-700 border-purple-200',
 ADMINISTRATOR: 'bg-orange-50 text-orange-700 border-orange-200',
 STAFF: 'bg-yellow-50 text-yellow-700 border-yellow-200',
 ALUMNI: 'bg-pink-50 text-pink-700 border-pink-200',
 EXTERNAL_STAKEHOLDER: 'bg-gray-50 text-gray-700 border-gray-200',
};

interface TemplatesListProps {
 templates: SurveyTemplate[];
 onDistribute: (template: SurveyTemplate) => void;
 onEdit: (template: SurveyTemplate) => void;
 onDuplicate: (template: SurveyTemplate) => void;
 onDelete: (template: SurveyTemplate) => void;
}

export default function TemplatesList({ 
 templates, 
 onDistribute, 
 onEdit, 
 onDuplicate, 
 onDelete 
}: TemplatesListProps) {
 const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedAudiences, setSelectedAudiences] = useState<Set<TargetAudience>>(new Set());

 const filteredTemplates = useMemo(() => {
 return templates.filter(template => {
 const matchesSearch = searchQuery === '' || 
 template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

 const matchesAudience = selectedAudiences.size === 0 || 
 selectedAudiences.has(template.targetAudience);

 return matchesSearch && matchesAudience;
 });
 }, [templates, searchQuery, selectedAudiences]);

 const toggleAudience = (audience: TargetAudience) => {
 const newSet = new Set(selectedAudiences);
 if (newSet.has(audience)) {
 newSet.delete(audience);
 } else {
 newSet.add(audience);
 }
 setSelectedAudiences(newSet);
 };

 const clearFilters = () => {
 setSearchQuery('');
 setSelectedAudiences(new Set());
 };

 const hasActiveFilters = searchQuery !== '' || selectedAudiences.size > 0;

 return (
 <div className="space-y-5">
 {/* Modern Search & Filter Bar */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
 <div className="flex-1">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Anket ara..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10 h-10 bg-background/60 border-border/60"
 />
 </div>
 </div>

 <div className="flex items-center gap-2">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="outline" size="sm" className="h-10 gap-2">
 <Filter className="h-4 w-4" />
 <span className="hidden sm:inline">Filtre</span>
 {selectedAudiences.size > 0 && (
 <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 text-xs">
 {selectedAudiences.size}
 </Badge>
 )}
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56">
 <DropdownMenuLabel>Hedef Kitle</DropdownMenuLabel>
 <DropdownMenuSeparator />
 {(Object.entries(targetAudienceLabels) as [TargetAudience, string][]).map(([value, label]) => (
 <DropdownMenuCheckboxItem
 key={value}
 checked={selectedAudiences.has(value)}
 onCheckedChange={() => toggleAudience(value)}
 >
 {label}
 </DropdownMenuCheckboxItem>
 ))}
 </DropdownMenuContent>
 </DropdownMenu>

 <div className="flex border rounded-lg p-0.5 bg-muted/50">
 <Button
 variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
 size="sm"
 onClick={() => setViewMode('grid')}
 className="h-9 px-3"
 >
 <Grid3x3 className="h-4 w-4" />
 </Button>
 <Button
 variant={viewMode === 'list' ? 'secondary' : 'ghost'}
 size="sm"
 onClick={() => setViewMode('list')}
 className="h-9 px-3"
 >
 <List className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </div>

 {/* Active Filters Display */}
 {hasActiveFilters && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex items-center justify-between px-4 py-2.5 bg-primary/5 border border-primary/10 rounded-lg"
 >
 <div className="flex items-center gap-2">
 <span className="text-sm font-medium text-primary">
 {filteredTemplates.length} anket bulundu
 </span>
 {selectedAudiences.size > 0 && (
 <div className="flex gap-1">
 {Array.from(selectedAudiences).map(audience => (
 <Badge key={audience} variant="secondary" className="text-xs">
 {targetAudienceLabels[audience]}
 </Badge>
 ))}
 </div>
 )}
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={clearFilters}
 className="h-7 text-xs gap-1"
 >
 <X className="h-3 w-3" />
 Temizle
 </Button>
 </motion.div>
 )}

 {/* Templates Display */}
 <div className="min-h-[400px]">
 {filteredTemplates.length === 0 ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex flex-col items-center justify-center py-20 px-4"
 >
 <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-5">
 <FileText className="h-10 w-10 text-primary" />
 </div>
 <h3 className="text-xl font-semibold mb-2 text-foreground">
 {hasActiveFilters ? 'Sonuç bulunamadı' : 'Henüz anket yok'}
 </h3>
 <p className="text-muted-foreground text-sm text-center max-w-sm">
 {hasActiveFilters 
 ? 'Arama kriterlerinize uygun anket bulunamadı. Filtreleri değiştirmeyi deneyin.'
 : 'İlk anket şablonunuzu oluşturarak başlayın.'
 }
 </p>
 </motion.div>
 ) : viewMode === 'grid' ? (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
 <AnimatePresence mode="popLayout">
 {filteredTemplates.map((template, index) => (
 <motion.div
 key={template.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ delay: index * 0.05 }}
 >
 <SurveyTemplateCard
 template={template}
 onDistribute={onDistribute}
 onEdit={onEdit}
 onDuplicate={onDuplicate}
 onDelete={onDelete}
 />
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 ) : (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="space-y-3"
 >
 {filteredTemplates.map((template, index) => (
 <motion.div
 key={template.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.03 }}
 className="group bg-card border rounded-lg p-4"
 >
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(template)}>
 <div className="flex items-start gap-3 mb-2">
 <div className="flex-shrink-0 mt-0.5">
 <FileText className="h-5 w-5 text-primary" />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="font-semibold text-base mb-1 group-">
 {template.title}
 </h3>
 {template.description && (
 <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
 {template.description}
 </p>
 )}
 </div>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <Badge 
 variant="secondary"
 className={audienceColorMap[template.targetAudience]}
 >
 {targetAudienceLabels[template.targetAudience]}
 </Badge>
 {template.tags && template.tags.length > 0 && (
 <>
 {template.tags.slice(0, 3).map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {template.tags.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{template.tags.length - 3}
 </Badge>
 )}
 </>
 )}
 </div>
 </div>
 <div className="flex items-center gap-2 flex-shrink-0">
 <Button
 variant="outline"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDistribute(template);
 }}
 className="h-9"
 >
 Dağıt
 </Button>
 <DropdownMenu>
 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-9 w-9 p-0"
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
 </div>
 </motion.div>
 ))}
 </motion.div>
 )}
 </div>
 </div>
 );
}