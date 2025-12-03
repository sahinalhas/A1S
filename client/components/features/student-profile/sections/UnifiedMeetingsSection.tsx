/**
 * Unified Meetings Section
 * Tüm görüşme kayıtlarını tek bir yerde gösterir
 * - Veli görüşmeleri
 * - Bireysel görüşmeler 
 * - Grup görüşmeleri
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { MessageCircle, Users, Calendar, Info, Plus, Filter } from "lucide-react";
import { useUnifiedMeetings, useMeetingStats } from "@/hooks/features/student-profile";
import { Link } from "react-router-dom";
import { useState } from "react";

interface UnifiedMeetingsSectionProps {
 studentId: string;
 onUpdate?: () => void;
}

export default function UnifiedMeetingsSection({ studentId, onUpdate }: UnifiedMeetingsSectionProps) {
 const { data: meetings = [], isLoading } = useUnifiedMeetings(studentId);
 const stats = useMeetingStats(studentId);
 const [filterType, setFilterType] = useState<"all" |"veli" |"bireysel" |"grup">("all");

 const filteredMeetings = filterType ==="all" 
 ? meetings 
 : meetings.filter(m => m.type === filterType);

 const getTypeBadgeColor = (type: string) => {
 switch (type) {
 case"veli":
 return"bg-blue-100 text-blue-700 border-blue-300";
 case"bireysel":
 return"bg-green-100 text-green-700 border-green-300";
 case"grup":
 return"bg-purple-100 text-purple-700 border-purple-300";
 default:
 return"bg-gray-100 text-gray-700";
 }
 };

 const getTypeLabel = (type: string) => {
 switch (type) {
 case"veli": return"Veli Görüşmesi";
 case"bireysel": return"Bireysel Görüşme";
 case"grup": return"Grup Görüşmesi";
 default: return type;
 }
 };

 if (isLoading) {
 return (
 <Card>
 <CardContent className="p-6">
 <div className="text-center text-muted-foreground">Görüşmeler yükleniyor...</div>
 </CardContent>
 </Card>
 );
 }

 return (
 <div className="space-y-4">
 {/* İstatistikler */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <Card>
 <CardContent className="p-4">
 <div className="text-2xl font-bold">{stats.total}</div>
 <div className="text-sm text-muted-foreground">Toplam Görüşme</div>
 </CardContent>
 </Card>
 
 <Card>
 <CardContent className="p-4">
 <div className="text-2xl font-bold text-blue-600">{stats.byType.veli}</div>
 <div className="text-sm text-muted-foreground">Veli Görüşmesi</div>
 </CardContent>
 </Card>
 
 <Card>
 <CardContent className="p-4">
 <div className="text-2xl font-bold text-green-600">{stats.byType.bireysel}</div>
 <div className="text-sm text-muted-foreground">Bireysel</div>
 </CardContent>
 </Card>
 
 <Card>
 <CardContent className="p-4">
 <div className="text-2xl font-bold text-orange-600">{stats.recentCount}</div>
 <div className="text-sm text-muted-foreground">Son 30 Gün</div>
 </CardContent>
 </Card>
 </div>

 {/* Ana Kart */}
 <Card>
 <CardHeader>
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <div>
 <CardTitle className="flex items-center gap-2">
 <MessageCircle className="h-5 w-5" />
 Tüm Görüşmeler
 </CardTitle>
 <CardDescription>
 Veli, bireysel ve grup görüşmelerinin tamamı
 </CardDescription>
 </div>
 <div className="flex gap-2">
 <Button asChild variant="outline" size="sm">
 <Link to="/gorusmeler">
 <Plus className="mr-2 h-4 w-4" />
 Yeni Görüşme Ekle
 </Link>
 </Button>
 </div>
 </div>
 </CardHeader>

 <CardContent className="space-y-4">
 <Alert>
 <Info className="h-4 w-4" />
 <AlertDescription>
 Bu liste hem ana görüşmeler sisteminden hem de eski manuel notlardan birleştirilmiştir. 
 Yeni görüşmeler için{""}
 <Link to="/gorusmeler" className="font-medium underline">
 Ana Görüşmeler
 </Link>{""}
 sayfasını kullanın.
 </AlertDescription>
 </Alert>

 {/* Filtreler */}
 <div className="flex items-center gap-2">
 <Filter className="h-4 w-4 text-muted-foreground" />
 <div className="flex gap-2">
 <Button
 size="sm"
 variant={filterType ==="all" ?"default" :"outline"}
 onClick={() => setFilterType("all")}
 >
 Tümü ({stats.total})
 </Button>
 <Button
 size="sm"
 variant={filterType ==="veli" ?"default" :"outline"}
 onClick={() => setFilterType("veli")}
 >
 Veli ({stats.byType.veli})
 </Button>
 <Button
 size="sm"
 variant={filterType ==="bireysel" ?"default" :"outline"}
 onClick={() => setFilterType("bireysel")}
 >
 Bireysel ({stats.byType.bireysel})
 </Button>
 <Button
 size="sm"
 variant={filterType ==="grup" ?"default" :"outline"}
 onClick={() => setFilterType("grup")}
 >
 Grup ({stats.byType.grup})
 </Button>
 </div>
 </div>

 {/* Görüşme Listesi */}
 <div className="space-y-3">
 {filteredMeetings.length === 0 && (
 <div className="text-center py-8 text-muted-foreground">
 <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
 <p>Görüşme kaydı bulunamadı</p>
 </div>
 )}

 {filteredMeetings.map((meeting) => (
 <div
 key={meeting.id}
 className="rounded-lg border p-4"
 >
 <div className="flex items-start justify-between mb-2">
 <div className="flex items-center gap-2">
 <Badge className={getTypeBadgeColor(meeting.type)}>
 {getTypeLabel(meeting.type)}
 </Badge>
 {meeting.followUpRequired && (
 <Badge variant="destructive" className="text-xs">
 Takip Gerekli
 </Badge>
 )}
 {meeting.source ==="counseling-sessions" && (
 <Badge variant="outline" className="text-xs">
 Ana Sistem
 </Badge>
 )}
 </div>
 <div className="flex items-center gap-1 text-sm text-muted-foreground">
 <Calendar className="h-3 w-3" />
 {new Date(meeting.date).toLocaleDateString('tr-TR')}
 {meeting.time && <span className="ml-1">{meeting.time}</span>}
 </div>
 </div>

 {meeting.topic && (
 <div className="font-medium text-sm mb-2">{meeting.topic}</div>
 )}

 {meeting.location && (
 <div className="text-xs text-muted-foreground mb-2">
 📍 {meeting.location}
 </div>
 )}

 <div className="text-sm whitespace-pre-wrap text-gray-700">
 {meeting.note}
 </div>

 {meeting.plan && (
 <div className="mt-2 pt-2 border-t">
 <div className="text-xs font-medium text-muted-foreground mb-1">
 Eylem Planı:
 </div>
 <div className="text-sm text-gray-700">{meeting.plan}</div>
 </div>
 )}

 {meeting.outcome && (
 <div className="mt-2">
 <Badge variant="secondary" className="text-xs">
 Sonuç: {meeting.outcome}
 </Badge>
 </div>
 )}
 </div>
 ))}
 </div>

 {stats.followUpPending > 0 && (
 <Alert variant="default" className="border-orange-200 bg-orange-50">
 <AlertDescription className="text-orange-800">
 <strong>{stats.followUpPending} görüşme</strong> için takip eylemi bekleniyor.
 </AlertDescription>
 </Alert>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
