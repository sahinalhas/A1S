import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, Check, X, Download, Upload, RotateCcw, Loader2, BookOpen, Users, User } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { useToast } from '@/hooks/utils/toast.utils';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from '@/components/organisms/AlertDialog';
import type { GuidanceCategory, GuidanceItem, GuidanceStandard } from '../../../../shared/types/index.js';
import { useSettingsTabDirty } from '@/pages/Settings';

// Hook wrapper that safely handles missing context
const useSettingsContext = () => {
 try {
 return useSettingsTabDirty();
 } catch {
 return null;
 }
};

export default function GuidanceStandardsTab() {
 const { toast } = useToast();
 const settingsContext = useSettingsContext();
 const componentId = useMemo(() => `guidance-standards-${Date.now()}`, []);

 const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual');
 const [standards, setStandards] = useState<GuidanceStandard | null>(null);
 const [loading, setLoading] = useState(true);
 const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
 const [editingItemId, setEditingItemId] = useState<string | null>(null);
 const [editingValue, setEditingValue] = useState('');
 const [addingToCategoryId, setAddingToCategoryId] = useState<string | null>(null);
 const [newItemTitle, setNewItemTitle] = useState('');
 const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
 const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
 const [resetDialogOpen, setResetDialogOpen] = useState(false);

 useEffect(() => {
 loadStandards();
 }, []);

 // Register save handler with parent context (if available)
 // GuidanceStandardsTab items are saved immediately on add/edit/delete
 // When used in Settings.tsx, this provides context for form submission
 // When used standalone (ContentManagement), this is optional
 useEffect(() => {
 if (!settingsContext?.registerTabSubmit) return;
 
 settingsContext.registerTabSubmit(componentId, async () => {
 // Items are already saved as they're added/edited/deleted
 // Just confirm by reloading standards to ensure consistency
 await loadStandards();
 });

 return () => {
 if (settingsContext?.unregisterTabSubmit) {
 settingsContext.unregisterTabSubmit(componentId);
 }
 };
 }, [componentId, settingsContext]);

 const loadStandards = async () => {
 try {
 setLoading(true);
 const response = await fetchWithSchool('/api/guidance-standards');
 const data = await response.json();
 
 if (data.success) {
 setStandards(data.data.standards);
 } else {
 throw new Error('Veri yüklenemedi');
 }
 } catch (error) {
 toast({
 title: 'Hata',
 description: 'Rehberlik standartları yüklenirken bir hata oluştu',
 variant: 'destructive',
 });
 } finally {
 setLoading(false);
 }
 };

 const toggleCategory = (categoryId: string) => {
 const newExpanded = new Set(expandedCategories);
 if (newExpanded.has(categoryId)) {
 newExpanded.delete(categoryId);
 } else {
 newExpanded.add(categoryId);
 }
 setExpandedCategories(newExpanded);
 };

 const handleAddItem = async (categoryId: string) => {
 if (!newItemTitle.trim()) return;

 try {
 const response = await fetchWithSchool('/api/guidance-standards/item', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 title: newItemTitle.trim(),
 categoryId,
 }),
 });

 const data = await response.json();

 if (data.success) {
 await loadStandards();
 setNewItemTitle('');
 setAddingToCategoryId(null);
 toast({
 title: 'Başarılı',
 description: 'Konu eklendi',
 });
 } else {
 throw new Error(data.error);
 }
 } catch (error) {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error.message : 'Konu eklenirken bir hata oluştu',
 variant: 'destructive',
 });
 }
 };

 const handleEditItem = (item: GuidanceItem) => {
 setEditingItemId(item.id);
 setEditingValue(item.title);
 };

 const handleSaveEdit = async (itemId: string) => {
 if (!editingValue.trim()) return;

 try {
 const response = await fetchWithSchool(`/api/guidance-standards/item/${itemId}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ title: editingValue.trim() }),
 });

 const data = await response.json();

 if (data.success) {
 await loadStandards();
 setEditingItemId(null);
 setEditingValue('');
 toast({
 title: 'Başarılı',
 description: 'Konu güncellendi',
 });
 } else {
 throw new Error(data.error);
 }
 } catch (error) {
 toast({
 title: 'Hata',
 description: 'Konu güncellenirken bir hata oluştu',
 variant: 'destructive',
 });
 }
 };

 const handleDeleteItem = (item: GuidanceItem) => {
 setItemToDelete({ id: item.id, title: item.title });
 setDeleteDialogOpen(true);
 };

 const confirmDelete = async () => {
 if (!itemToDelete) return;

 try {
 const response = await fetchWithSchool(`/api/guidance-standards/item/${itemToDelete.id}`, {
 method: 'DELETE',
 });

 const data = await response.json();

 if (data.success) {
 await loadStandards();
 toast({
 title: 'Başarılı',
 description: 'Konu silindi',
 });
 } else {
 throw new Error(data.error);
 }
 } catch (error) {
 toast({
 title: 'Hata',
 description: 'Konu silinirken bir hata oluştu',
 variant: 'destructive',
 });
 } finally {
 setDeleteDialogOpen(false);
 setItemToDelete(null);
 }
 };

 const handleExport = async () => {
 try {
 const response = await fetchWithSchool('/api/guidance-standards/export');
 const data = await response.json();
 
 const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = 'rehberlik-standartlari.json';
 a.click();
 URL.revokeObjectURL(url);

 toast({
 title: 'Başarılı',
 description: 'Standartlar dışa aktarıldı',
 });
 } catch (error) {
 toast({
 title: 'Hata',
 description: 'Dışa aktarma sırasında bir hata oluştu',
 variant: 'destructive',
 });
 }
 };

 const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0];
 if (!file) return;

 try {
 const text = await file.text();
 const data = JSON.parse(text);

 const response = await fetchWithSchool('/api/guidance-standards/import', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(data),
 });

 const result = await response.json();

 if (result.success) {
 await loadStandards();
 toast({
 title: 'Başarılı',
 description: 'Standartlar içe aktarıldı',
 });
 } else {
 throw new Error(result.error);
 }
 } catch (error) {
 toast({
 title: 'Hata',
 description: 'İçe aktarma sırasında bir hata oluştu',
 variant: 'destructive',
 });
 }

 event.target.value = '';
 };

 const handleReset = async () => {
 try {
 const response = await fetchWithSchool('/api/guidance-standards/reset', {
 method: 'POST',
 });

 const data = await response.json();

 if (data.success) {
 await loadStandards();
 toast({
 title: 'Başarılı',
 description: 'Standartlar varsayılana sıfırlandı',
 });
 } else {
 throw new Error(data.error);
 }
 } catch (error) {
 toast({
 title: 'Hata',
 description: 'Sıfırlama sırasında bir hata oluştu',
 variant: 'destructive',
 });
 } finally {
 setResetDialogOpen(false);
 }
 };

 const renderCategory = (category: GuidanceCategory, depth = 0) => {
 const isExpanded = expandedCategories.has(category.id);
 const hasChildren = (category.children && category.children.length > 0);
 const hasItems = (category.items && category.items.length > 0);
 const isAddingToThis = addingToCategoryId === category.id;

 return (
 <div key={category.id} className="mb-2">
 <div
 className="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer"
 style={{ paddingLeft: `${depth * 24 + 12}px` }}
 onClick={() => toggleCategory(category.id)}
 >
 {(hasChildren || hasItems || isAddingToThis) ? (
 isExpanded ? (
 <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
 ) : (
 <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
 )
 ) : (
 <div className="w-4 h-4 flex-shrink-0" />
 )}
 <span className="font-medium text-sm">{category.title}</span>
 </div>

 {isExpanded && (
 <div className="ml-4">
 {hasChildren && category.children!.map((child) => renderCategory(child, depth + 1))}
 
 {hasItems && (
 <div className="space-y-1 mt-2" style={{ paddingLeft: `${depth * 24 + 12}px` }}>
 {category.items!.map((item) => (
 <div
 key={item.id}
 className="group flex items-center gap-2 py-2 px-3 rounded-lg"
 >
 <div className="w-4 h-4 flex-shrink-0" />
 
 {editingItemId === item.id ? (
 <>
 <input
 type="text"
 value={editingValue}
 onChange={(e) => setEditingValue(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter') handleSaveEdit(item.id);
 if (e.key === 'Escape') {
 setEditingItemId(null);
 setEditingValue('');
 }
 }}
 className="flex-1 px-2 py-1 text-sm border rounded"
 autoFocus
 />
 <Button
 size="sm"
 variant="ghost"
 onClick={() => handleSaveEdit(item.id)}
 className="h-7 w-7 p-0"
 >
 <Check className="h-3.5 w-3.5" />
 </Button>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => {
 setEditingItemId(null);
 setEditingValue('');
 }}
 className="h-7 w-7 p-0"
 >
 <X className="h-3.5 w-3.5" />
 </Button>
 </>
 ) : (
 <>
 <span className="flex-1 text-sm text-muted-foreground">{item.title}</span>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => handleEditItem(item)}
 className="h-7 w-7 p-0 opacity-0 group-"
 >
 <Edit2 className="h-3.5 w-3.5" />
 </Button>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => handleDeleteItem(item)}
 className="h-7 w-7 p-0 opacity-0 group- text-destructive"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </Button>
 </>
 )}
 </div>
 ))}
 </div>
 )}

 {!hasChildren && isAddingToThis && (
 <div
 className="flex items-center gap-2 py-2 px-3 mt-1"
 style={{ paddingLeft: `${depth * 24 + 28}px` }}
 >
 <input
 type="text"
 value={newItemTitle}
 onChange={(e) => setNewItemTitle(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter') handleAddItem(category.id);
 if (e.key === 'Escape') {
 setAddingToCategoryId(null);
 setNewItemTitle('');
 }
 }}
 placeholder="Yeni konu başlığı..."
 className="flex-1 px-2 py-1 text-sm border rounded"
 autoFocus
 />
 <Button
 size="sm"
 variant="ghost"
 onClick={() => handleAddItem(category.id)}
 className="h-7 w-7 p-0"
 >
 <Check className="h-3.5 w-3.5" />
 </Button>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => {
 setAddingToCategoryId(null);
 setNewItemTitle('');
 }}
 className="h-7 w-7 p-0"
 >
 <X className="h-3.5 w-3.5" />
 </Button>
 </div>
 )}

 {!hasChildren && isExpanded && !isAddingToThis && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setAddingToCategoryId(category.id)}
 className="ml-4 mt-1 text-xs text-muted-foreground"
 style={{ paddingLeft: `${depth * 24 + 28}px` }}
 >
 <Plus className="h-3.5 w-3.5 mr-1" />
 Yeni konu ekle...
 </Button>
 )}
 </div>
 )}
 </div>
 );
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center py-12">
 <Loader2 className="h-8 w-8 text-muted-foreground" />
 </div>
 );
 }

 if (!standards) {
 return (
 <div className="text-center py-12 text-muted-foreground">
 Veri yüklenemedi
 </div>
 );
 }

 return (
 <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="space-y-4"
 >
  <Card className="border-muted">
   <CardHeader>
    <div className="flex items-center justify-between">
     <div>
      <CardTitle className="flex items-center gap-2">
       <BookOpen className="h-5 w-5 text-primary" />
       Rehberlik Standartları
      </CardTitle>
      <CardDescription>
       Bireysel ve grup çalışmalarınız için standart kategorileri yönetin
      </CardDescription>
     </div>
     <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleExport}>
       <Download className="h-4 w-4" />
       Dışa Aktar
      </Button>
      <label htmlFor="import-file">
       <Button variant="outline" size="sm" asChild>
        <span className="gap-2 cursor-pointer">
         <Upload className="h-4 w-4" />
         İçe Aktar
        </span>
       </Button>
      </label>
      <input
       id="import-file"
       type="file"
       accept=".json"
       className="hidden"
       onChange={handleImport}
      />
      <Button variant="outline" size="sm" onClick={() => setResetDialogOpen(true)}>
       <RotateCcw className="h-4 w-4" />
       Varsayılana Sıfırla
      </Button>
     </div>
    </div>
   </CardHeader>
   <CardContent>

    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'individual' | 'group')}>
     <TabsList variant="nested">
      <TabsTrigger value="individual" variant="nested">
       <User className="h-4 w-4" />
       Bireysel Çalışmalar
      </TabsTrigger>
      <TabsTrigger value="group" variant="nested">
       <Users className="h-4 w-4" />
       Grup Çalışmaları
      </TabsTrigger>
     </TabsList>

     <TabsContent value="individual" className="mt-4 border border-border/40 rounded-lg p-4 bg-muted/20">
      <div className="space-y-2">
       {standards.individual.map((category) => renderCategory(category))}
      </div>
     </TabsContent>

     <TabsContent value="group" className="mt-4 border border-border/40 rounded-lg p-4 bg-muted/20">
      <div className="space-y-2">
       {standards.group.map((category) => renderCategory(category))}
      </div>
     </TabsContent>
    </Tabs>
   </CardContent>
  </Card>

 <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
 <AlertDialogDescription>
"{itemToDelete?.title}" konusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>İptal</AlertDialogCancel>
 <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
 Sil
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>

 <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Varsayılana Sıfırla</AlertDialogTitle>
 <AlertDialogDescription>
 Tüm özelleştirmeleriniz silinecek ve standartlar MEB varsayılan değerlerine geri dönecektir. Emin misiniz?
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>İptal</AlertDialogCancel>
 <AlertDialogAction onClick={handleReset} className="bg-destructive">
 Sıfırla
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </motion.div>
 );
}
