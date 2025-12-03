
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";
import {
 ChevronDown,
 ChevronRight,
 Plus,
 Pencil,
 Trash2,
 Check,
 X,
 BookOpen,
 GraduationCap,
 School,
 Globe,
 Sparkles,
 RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/utils/toast.utils";
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from "@/components/organisms/AlertDialog";
import {
 StudySubject,
 StudyTopic,
 addSubject,
 addTopic,
 loadSubjectsAsync,
 loadTopicsAsync,
 updateSubject,
 removeSubject,
 removeTopicsBySubject,
 updateTopic,
 removeTopic,
} from "@/lib/storage";
import { apiClient } from "@/lib/api/core/client";

type Category ="LGS" |"TYT" |"AYT" |"YDT" |"Okul";

const CATEGORIES: { id: Category; label: string; icon: any; gradient: string; color: string }[] = [
 { id:"LGS", label:"LGS", icon: BookOpen, gradient:"from-blue-500 to-cyan-500", color:"text-blue-600 dark:text-blue-400" },
 { id:"TYT", label:"TYT", icon: GraduationCap, gradient:"from-purple-500 to-pink-500", color:"text-purple-600 dark:text-purple-400" },
 { id:"AYT", label:"AYT", icon: Sparkles, gradient:"from-orange-500 to-red-500", color:"text-orange-600 dark:text-orange-400" },
 { id:"YDT", label:"YDT", icon: Globe, gradient:"from-green-500 to-emerald-500", color:"text-green-600 dark:text-green-400" },
 { id:"Okul", label:"Okul", icon: School, gradient:"from-slate-500 to-gray-600", color:"text-slate-600 dark:text-slate-400" },
];

export default function Courses() {
 const { toast } = useToast();
 const [selectedCategory, setSelectedCategory] = useState<Category>("LGS");
 const [subjects, setSubjects] = useState<StudySubject[]>([]);
 const [topics, setTopics] = useState<StudyTopic[]>([]);
 const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
 new Set()
 );
 const [resetDialogOpen, setResetDialogOpen] = useState(false);
 const [loadError, setLoadError] = useState<string | null>(null);

 useEffect(() => {
 refreshData();
 }, []);

 async function refreshData() {
 try {
 setLoadError(null);
 const [subjectsData, topicsData] = await Promise.all([
 loadSubjectsAsync(),
 loadTopicsAsync(),
 ]);
 setSubjects(subjectsData);
 setTopics(topicsData);
 } catch (error) {
 const errorMsg = error instanceof Error ? error.message : 'Veriler yüklenirken bir hata oluştu';
 setLoadError(errorMsg);
 toast({
 title: 'Hata',
 description: errorMsg,
 variant: 'destructive',
 });
 }
 }

 const handleReset = async () => {
 try {
 await apiClient.post<{ success: boolean; message?: string; error?: string }>('/api/subjects/reset', {}, {
 showErrorToast: false,
 });

 await refreshData();
 toast({
 title: 'Başarılı',
 description: 'Dersler ve konular varsayılan değerlere sıfırlandı',
 });
 } catch (error) {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error.message : 'Sıfırlama sırasında bir hata oluştu',
 variant: 'destructive',
 });
 } finally {
 setResetDialogOpen(false);
 }
 };

 const filteredSubjects = useMemo(() => {
 if (selectedCategory === "Okul") {
 return subjects.filter((s) => s.category === "Okul" || !s.category);
 }
 return subjects.filter((s) => s.category === selectedCategory);
 }, [subjects, selectedCategory]);

 const toggleSubject = (id: string) => {
 setExpandedSubjects((prev) => {
 const next = new Set(prev);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
 return next;
 });
 };

 const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);

 if (loadError) {
 return (
 <div className="w-full max-w-7xl mx-auto py-8 px-4">
 <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
 <p className="font-semibold">Hata</p>
 <p className="text-sm mt-1">{loadError}</p>
 <Button 
 variant="outline" 
 size="sm" 
 onClick={() => refreshData()}
 className="mt-3"
 >
 Yeniden Yükle
 </Button>
 </div>
 </div>
 );
 }

 return (
 <div className="w-full max-w-7xl mx-auto py-8 px-4 space-y-8">
 {/* Header Section */}
 <div className="flex items-start justify-between">
 <div className="space-y-3">
 <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
 Dersler & Konular
 </h1>
 <p className="text-muted-foreground text-lg">
 Ders ve konu yönetimi ile çalışma planınızı organize edin
 </p>
 </div>
 <Button variant="outline" size="sm" onClick={() => setResetDialogOpen(true)}>
 <RotateCcw className="h-4 w-4 mr-1" />
 Varsayılana Sıfırla
 </Button>
 </div>

 {/* Category Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
 {CATEGORIES.map((cat) => {
 const Icon = cat.icon;
 const isSelected = selectedCategory === cat.id;
 
 return (
 <button
 key={cat.id}
 onClick={() => setSelectedCategory(cat.id)}
 className={`
 group relative overflow-hidden rounded-2xl p-6 
 ${isSelected 
 ? 'bg-gradient-to-br ' + cat.gradient + ' text-white'
 : 'bg-card border-2 border-border'
 }
 `}
 >
 <div className="relative z-10 flex flex-col items-center gap-3">
 <div className={`
 p-3 rounded-xl 
 ${isSelected 
 ? 'bg-white/20'
 : 'bg-primary/10'
 }
 `}>
 <Icon className={`
 h-7 w-7 
 ${isSelected ? 'text-white' : cat.color}
 `} />
 </div>
 <span className={`
 text-base font-semibold 
 ${isSelected ? 'text-white' : 'text-foreground'}
 `}>
 {cat.label}
 </span>
 </div>
 </button>
 );
 })}
 </div>

 {/* Subject Management Section */}
 <div className="space-y-6">
 <div className="flex items-center gap-4 pb-4 border-b">
 <div className={`
 p-2.5 rounded-xl bg-gradient-to-br ${selectedCategoryData?.gradient}
 `}>
 {selectedCategoryData && (
 <selectedCategoryData.icon className="h-6 w-6 text-white" />
 )}
 </div>
 <div className="flex-1">
 <h2 className="text-2xl font-semibold">
 {selectedCategoryData?.label} Dersleri
 </h2>
 <p className="text-sm text-muted-foreground">
 {filteredSubjects.length} ders, {topics.filter(t => filteredSubjects.some(s => s.id === t.subjectId)).length} konu
 </p>
 </div>
 </div>

 <AddSubjectForm category={selectedCategory} onAdd={refreshData} />

 {filteredSubjects.length === 0 ? (
 <div className="text-center py-20 px-4">
 <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
 <BookOpen className="h-16 w-16 text-primary/40" />
 </div>
 <h3 className="text-xl font-semibold mb-2">Henüz ders bulunmuyor</h3>
 <p className="text-muted-foreground max-w-md mx-auto">
 Bu kategoride henüz ders eklenmemiş. Yukarıdaki butonu kullanarak yeni bir ders ekleyebilirsiniz.
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {filteredSubjects.map((subject) => (
 <SubjectAccordion
 key={subject.id}
 subject={subject}
 topics={topics.filter((t) => t.subjectId === subject.id)}
 isExpanded={expandedSubjects.has(subject.id)}
 onToggle={() => toggleSubject(subject.id)}
 onRefresh={refreshData}
 />
 ))}
 </div>
 )}
 </div>

 <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Varsayılana Sıfırla</AlertDialogTitle>
 <AlertDialogDescription>
 Tüm özelleştirmeleriniz silinecek ve dersler/konular MEB varsayılan değerlerine geri dönecektir. Emin misiniz?
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
 </div>
 );
}

function AddSubjectForm({
 category,
 onAdd,
}: {
 category: Category;
 onAdd: () => void;
}) {
 const { toast } = useToast();
 const [isAdding, setIsAdding] = useState(false);
 const [name, setName] = useState("");

 const handleAdd = async () => {
 const trimmedName = name.trim();
 if (!trimmedName) {
 toast({ title:"Ders adı gerekli", variant:"destructive" });
 return;
 }

 const newSubject: StudySubject = {
 id: crypto.randomUUID(),
 name: trimmedName,
 category: category,
 };

 try {
 await addSubject(newSubject);
 setName("");
 setIsAdding(false);
 onAdd();
 toast({ title:"✓ Ders eklendi", description: trimmedName });
 } catch (error) {
 toast({
 title:"Hata",
 description:"Ders eklenemedi",
 variant:"destructive",
 });
 }
 };

 if (!isAdding) {
 return (
 <Button
 variant="outline"
 size="lg"
 className="w-full h-14 border-2 border-dashed border-primary/30"
 onClick={() => setIsAdding(true)}
 >
 <Plus className="h-5 w-5 mr-2" />
 <span className="font-medium">Yeni Ders Ekle</span>
 </Button>
 );
 }

 return (
 <div className="flex gap-3 p-4 border-2 border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 to-transparent">
 <Input
 placeholder="Ders adı girin..."
 value={name}
 onChange={(e) => setName(e.target.value)}
 onKeyDown={(e) => {
 if (e.key ==="Enter") handleAdd();
 if (e.key ==="Escape") {
 setIsAdding(false);
 setName("");
 }
 }}
 className="flex-1 h-11 border-2"
 autoFocus
 />
 <Button onClick={handleAdd} size="lg" className="h-11 px-6">
 <Check className="h-5 w-5 mr-2" />
 Ekle
 </Button>
 <Button
 variant="outline"
 size="lg"
 className="h-11 px-6"
 onClick={() => {
 setIsAdding(false);
 setName("");
 }}
 >
 <X className="h-5 w-5" />
 </Button>
 </div>
 );
}

function SubjectAccordion({
 subject,
 topics,
 isExpanded,
 onToggle,
 onRefresh,
}: {
 subject: StudySubject;
 topics: StudyTopic[];
 isExpanded: boolean;
 onToggle: () => void;
 onRefresh: () => void;
}) {
 const { toast } = useToast();
 const [isEditing, setIsEditing] = useState(false);
 const [editName, setEditName] = useState(subject.name);

 const handleUpdate = async () => {
 const trimmedName = editName.trim();
 if (!trimmedName) return;

 try {
 await updateSubject(subject.id, { name: trimmedName });
 setIsEditing(false);
 onRefresh();
 toast({ title:"✓ Ders güncellendi" });
 } catch (error) {
 toast({
 title:"Hata",
 description:"Ders güncellenemedi",
 variant:"destructive",
 });
 }
 };

 const handleDelete = async () => {
 const confirmText = window.prompt(
 `Silmek için ders adını yazın: ${subject.name}`
 );
 if (confirmText !== subject.name) return;

 if (topics.length > 0) {
 const sure = window.confirm(
 `${topics.length} konu da silinecek. Devam edilsin mi?`
 );
 if (!sure) return;
 await removeTopicsBySubject(subject.id);
 }

 try {
 await removeSubject(subject.id);
 onRefresh();
 toast({ title:"✓ Ders silindi" });
 } catch (error) {
 toast({
 title:"Hata",
 description:"Ders silinemedi",
 variant:"destructive",
 });
 }
 };

 return (
 <div className="border-2 rounded-xl bg-card overflow-hidden">
 <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/5 to-transparent">
 <div className="flex items-center gap-3 flex-1">
 <button
 onClick={onToggle}
 className="p-2 rounded-lg"
 >
 {isExpanded ? (
 <ChevronDown className="h-5 w-5 text-primary" />
 ) : (
 <ChevronRight className="h-5 w-5 text-muted-foreground" />
 )}
 </button>

 {isEditing ? (
 <div className="flex gap-2 flex-1">
 <Input
 value={editName}
 onChange={(e) => setEditName(e.target.value)}
 onKeyDown={(e) => {
 if (e.key ==="Enter") handleUpdate();
 if (e.key ==="Escape") {
 setIsEditing(false);
 setEditName(subject.name);
 }
 }}
 className="max-w-md h-10 border-2"
 autoFocus
 />
 <Button onClick={handleUpdate} size="sm" >
 <Check className="h-4 w-4" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 setIsEditing(false);
 setEditName(subject.name);
 }}
 >
 <X className="h-4 w-4" />
 </Button>
 </div>
 ) : (
 <button onClick={onToggle} className="flex-1 text-left flex items-center gap-3">
 <span className="text-lg font-semibold">{subject.name}</span>
 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
 {topics.length} konu
 </span>
 </button>
 )}
 </div>

 {!isEditing && (
 <div className="flex gap-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setIsEditing(true)}
 className=""
 >
 <Pencil className="h-4 w-4" />
 </Button>
 <Button 
 variant="ghost" 
 size="sm" 
 onClick={handleDelete}
 className=""
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 )}
 </div>

 {isExpanded && (
 <div className="border-t-2">
 <TopicsTable
 subjectId={subject.id}
 topics={topics}
 onRefresh={onRefresh}
 />
 </div>
 )}
 </div>
 );
}

function TopicsTable({
 subjectId,
 topics,
 onRefresh,
}: {
 subjectId: string;
 topics: StudyTopic[];
 onRefresh: () => void;
}) {
 const [isAdding, setIsAdding] = useState(false);

 return (
 <div className="p-4 space-y-3">
 {topics.length > 0 && (
 <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-semibold text-muted-foreground bg-muted/30 rounded-lg">
 <div className="col-span-5">KONU ADI</div>
 <div className="col-span-1 text-center">SÜRE</div>
 <div className="col-span-2 text-center">ENERJİ</div>
 <div className="col-span-1 text-center">ZORLUK</div>
 <div className="col-span-1 text-center">ÖNCELİK</div>
 <div className="col-span-1 text-center">TARİH</div>
 <div className="col-span-1"></div>
 </div>
 )}

 {topics.length === 0 ? (
 <div className="text-center py-8 px-4">
 <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-3">
 <BookOpen className="h-8 w-8 text-primary/40" />
 </div>
 <p className="text-xs text-muted-foreground">Henüz konu eklenmemiş</p>
 </div>
 ) : (
 <div className="space-y-1">
 {topics.map((topic) => (
 <TopicRow key={topic.id} topic={topic} onRefresh={onRefresh} />
 ))}
 </div>
 )}

 {isAdding ? (
 <AddTopicForm
 subjectId={subjectId}
 onAdd={() => {
 setIsAdding(false);
 onRefresh();
 }}
 onCancel={() => setIsAdding(false)}
 />
 ) : (
 <Button
 variant="outline"
 size="sm"
 className="w-full h-9 border-2 border-dashed border-primary/30 text-xs"
 onClick={() => setIsAdding(true)}
 >
 <Plus className="h-4 w-4 mr-1.5" />
 <span className="font-medium">Yeni Konu Ekle</span>
 </Button>
 )}
 </div>
 );
}

function TopicRow({
 topic,
 onRefresh,
}: {
 topic: StudyTopic;
 onRefresh: () => void;
}) {
 const { toast } = useToast();
 const [isEditing, setIsEditing] = useState(false);
 const [formData, setFormData] = useState({
 name: topic.name,
 avgMinutes: String(topic.avgMinutes || 60),
 energyLevel: topic.energyLevel ||"medium",
 difficultyScore: topic.difficultyScore ? String(topic.difficultyScore) :"",
 priority: topic.priority ? String(topic.priority) :"",
 deadline: topic.deadline ||"",
 });

 const handleUpdate = async () => {
 const trimmedName = formData.name.trim();
 if (!trimmedName) {
 toast({ title:"Konu adı gerekli", variant:"destructive" });
 return;
 }

 try {
 await updateTopic(topic.id, {
 name: trimmedName,
 avgMinutes: Number(formData.avgMinutes) || 60,
 energyLevel: formData.energyLevel as"high" |"medium" |"low",
 difficultyScore: formData.difficultyScore
 ? Number(formData.difficultyScore)
 : undefined,
 priority: formData.priority ? Number(formData.priority) : undefined,
 deadline: formData.deadline || undefined,
 });
 setIsEditing(false);
 onRefresh();
 toast({ title:"✓ Konu güncellendi" });
 } catch (error) {
 toast({
 title:"Hata",
 description:"Konu güncellenemedi",
 variant:"destructive",
 });
 }
 };

 const handleDelete = async () => {
 if (!window.confirm(`"${topic.name}" konusunu silmek istediğinize emin misiniz?`)) {
 return;
 }

 try {
 await removeTopic(topic.id);
 onRefresh();
 toast({ title:"✓ Konu silindi" });
 } catch (error) {
 toast({
 title:"Hata",
 description:"Konu silinemedi",
 variant:"destructive",
 });
 }
 };

 const getEnergyLabel = (level?: string) => {
 if (level ==="high") return"🔥 Yüksek";
 if (level ==="low") return"🌙 Düşük";
 return"⚡ Orta";
 };

 if (isEditing) {
 return (
 <div className="grid grid-cols-12 gap-2 p-3 border-2 border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 to-transparent">
 <Input
 value={formData.name}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, name: e.target.value }))
 }
 placeholder="Konu adı"
 className="col-span-5 h-8 text-sm"
 />
 <Input
 type="number"
 value={formData.avgMinutes}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, avgMinutes: e.target.value }))
 }
 placeholder="dk"
 className="col-span-1 h-8 text-xs"
 />
 <Select
 value={formData.energyLevel}
 onValueChange={(v) =>
 setFormData((prev) => ({ ...prev, energyLevel: v as"high" |"medium" |"low" }))
 }
 >
 <SelectTrigger className="col-span-2 h-8 text-xs">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="high">🔥 Yüksek</SelectItem>
 <SelectItem value="medium">⚡ Orta</SelectItem>
 <SelectItem value="low">🌙 Düşük</SelectItem>
 </SelectContent>
 </Select>
 <Input
 type="number"
 min="1"
 max="10"
 value={formData.difficultyScore}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, difficultyScore: e.target.value }))
 }
 placeholder="1-10"
 className="col-span-1 h-8 text-xs"
 />
 <Input
 type="number"
 min="1"
 max="10"
 value={formData.priority}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, priority: e.target.value }))
 }
 placeholder="1-10"
 className="col-span-1 h-8 text-xs"
 />
 <Input
 type="date"
 value={formData.deadline}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, deadline: e.target.value }))
 }
 className="col-span-1 h-8 text-xs"
 />
 <div className="col-span-1 flex gap-0.5">
 <Button onClick={handleUpdate} size="sm"  className="h-7 w-7 p-0">
 <Check className="h-3.5 w-3.5" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 className="h-7 w-7 p-0"
 onClick={() => {
 setIsEditing(false);
 setFormData({
 name: topic.name,
 avgMinutes: String(topic.avgMinutes || 60),
 energyLevel: topic.energyLevel ||"medium",
 difficultyScore: topic.difficultyScore
 ? String(topic.difficultyScore)
 :"",
 priority: topic.priority ? String(topic.priority) :"",
 deadline: topic.deadline ||"",
 });
 }}
 >
 <X className="h-3.5 w-3.5" />
 </Button>
 </div>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-12 gap-2 px-3 py-2 rounded-md group border border-transparent">
 <div className="col-span-5 flex items-center text-sm font-medium truncate">{topic.name}</div>
 <div className="col-span-1 text-center flex items-center justify-center">
 <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
 {topic.avgMinutes ||"-"}dk
 </span>
 </div>
 <div className="col-span-2 text-center flex items-center justify-center text-xs">
 {getEnergyLabel(topic.energyLevel)}
 </div>
 <div className="col-span-1 text-center flex items-center justify-center">
 <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
 {topic.difficultyScore ||"-"}
 </span>
 </div>
 <div className="col-span-1 text-center flex items-center justify-center">
 <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
 {topic.priority ||"-"}
 </span>
 </div>
 <div className="col-span-1 text-center flex items-center justify-center text-[10px] text-muted-foreground">
 {topic.deadline
 ? new Date(topic.deadline).toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit' })
 :"-"}
 </div>
 <div className="col-span-1 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100">
 <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-7 w-7 p-0">
 <Pencil className="h-3.5 w-3.5" />
 </Button>
 <Button variant="ghost" size="sm" onClick={handleDelete} className="h-7 w-7 p-0">
 <Trash2 className="h-3.5 w-3.5" />
 </Button>
 </div>
 </div>
 );
}

function AddTopicForm({
 subjectId,
 onAdd,
 onCancel,
}: {
 subjectId: string;
 onAdd: () => void;
 onCancel: () => void;
}) {
 const { toast } = useToast();
 const [formData, setFormData] = useState({
 name:"",
 avgMinutes:"60",
 energyLevel:"medium",
 difficultyScore:"",
 priority:"",
 deadline:"",
 });

 const handleAdd = async () => {
 const trimmedName = formData.name.trim();
 if (!trimmedName) {
 toast({ title:"Konu adı gerekli", variant:"destructive" });
 return;
 }

 const newTopic: StudyTopic = {
 id: crypto.randomUUID(),
 subjectId,
 name: trimmedName,
 avgMinutes: Number(formData.avgMinutes) || 60,
 energyLevel: formData.energyLevel as"high" |"medium" |"low",
 difficultyScore: formData.difficultyScore
 ? Number(formData.difficultyScore)
 : undefined,
 priority: formData.priority ? Number(formData.priority) : undefined,
 deadline: formData.deadline || undefined,
 };

 try {
 await addTopic(newTopic);
 onAdd();
 toast({ title:"✓ Konu eklendi", description: trimmedName });
 } catch (error) {
 toast({
 title:"Hata",
 description:"Konu eklenemedi",
 variant:"destructive",
 });
 }
 };

 return (
 <div className="grid grid-cols-12 gap-2 p-3 border-2 border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 to-transparent">
 <Input
 value={formData.name}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, name: e.target.value }))
 }
 placeholder="Konu adı girin..."
 className="col-span-5 h-8 text-sm"
 onKeyDown={(e) => {
 if (e.key ==="Enter") handleAdd();
 if (e.key ==="Escape") onCancel();
 }}
 autoFocus
 />
 <Input
 type="number"
 value={formData.avgMinutes}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, avgMinutes: e.target.value }))
 }
 placeholder="dk"
 className="col-span-1 h-8 text-xs"
 />
 <Select
 value={formData.energyLevel}
 onValueChange={(v) =>
 setFormData((prev) => ({ ...prev, energyLevel: v as"high" |"medium" |"low" }))
 }
 >
 <SelectTrigger className="col-span-2 h-8 text-xs">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="high">🔥 Yüksek</SelectItem>
 <SelectItem value="medium">⚡ Orta</SelectItem>
 <SelectItem value="low">🌙 Düşük</SelectItem>
 </SelectContent>
 </Select>
 <Input
 type="number"
 min="1"
 max="10"
 value={formData.difficultyScore}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, difficultyScore: e.target.value }))
 }
 placeholder="1-10"
 className="col-span-1 h-8 text-xs"
 />
 <Input
 type="number"
 min="1"
 max="10"
 value={formData.priority}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, priority: e.target.value }))
 }
 placeholder="1-10"
 className="col-span-1 h-8 text-xs"
 />
 <Input
 type="date"
 value={formData.deadline}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, deadline: e.target.value }))
 }
 className="col-span-1 h-8 text-xs"
 />
 <div className="col-span-1 flex gap-0.5">
 <Button onClick={handleAdd} size="sm"  className="h-7 w-7 p-0">
 <Check className="h-3.5 w-3.5" />
 </Button>
 <Button variant="outline" size="sm" onClick={onCancel} className="h-7 w-7 p-0">
 <X className="h-3.5 w-3.5" />
 </Button>
 </div>
 </div>
 );
}
