import React from "react";
import { Bell, CheckSquare, Plus, Calendar, Clock, Users, AlertCircle, CheckCircle2, XCircle, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Separator } from "@/components/atoms/Separator";

import type { CounselingReminder, CounselingFollowUp } from "./types";

interface RemindersTabProps {
 reminders: CounselingReminder[];
 followUps: CounselingFollowUp[];
 onCreateReminder: () => void;
 onCreateFollowUp: () => void;
 onEditReminder: (reminder: CounselingReminder) => void;
 onEditFollowUp: (followUp: CounselingFollowUp) => void;
 onCompleteReminder: (id: string) => void;
 onCancelReminder: (id: string) => void;
 onCompleteFollowUp: (id: string) => void;
 onProgressFollowUp: (id: string) => void;
}

const reminderTypeLabels = {
 planned_session: { label:"Planlı Görüşme", icon: Calendar },
 follow_up: { label:"Takip Görüşmesi", icon: CheckSquare },
 parent_meeting: { label:"Veli Görüşmesi", icon: Users },
};

const reminderStatusConfig = {
 pending: { label:"Bekliyor", variant:"default" as const, icon: Clock },
 completed: { label:"Tamamlandı", variant:"secondary" as const, icon: CheckCircle2 },
 cancelled: { label:"İptal Edildi", variant:"destructive" as const, icon: XCircle },
};

const followUpStatusConfig = {
 pending: { label:"Bekliyor", variant:"default" as const, icon: Clock },
 in_progress: { label:"Devam Ediyor", variant:"default" as const, icon: AlertCircle },
 completed: { label:"Tamamlandı", variant:"secondary" as const, icon: CheckCircle2 },
};

const priorityConfig = {
 low: { label:"Düşük", variant:"secondary" as const },
 medium: { label:"Orta", variant:"default" as const },
 high: { label:"Yüksek", variant:"default" as const },
 urgent: { label:"Acil", variant:"destructive" as const },
};

export default function RemindersTab({
 reminders,
 followUps,
 onCreateReminder,
 onCreateFollowUp,
 onEditReminder,
 onEditFollowUp,
 onCompleteReminder,
 onCancelReminder,
 onCompleteFollowUp,
 onProgressFollowUp,
}: RemindersTabProps) {
 const activeReminders = reminders.filter(r => r.status === 'pending');
 const activeFollowUps = followUps.filter(f => f.status !== 'completed');

 return (
 <div className="space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Bell className="h-5 w-5 text-muted-foreground" />
 <h3 className="text-lg font-semibold">Hatırlatmalar</h3>
 {activeReminders.length > 0 && (
 <Badge variant="secondary">{activeReminders.length}</Badge>
 )}
 </div>
 <Button onClick={onCreateReminder} size="sm" className="gap-2">
 <Plus className="h-4 w-4" />
 Yeni Hatırlatma
 </Button>
 </div>

 <div className="space-y-3">
 {reminders.length === 0 ? (
 <Card>
 <CardContent className="flex flex-col items-center justify-center py-12 text-center">
 <Bell className="h-12 w-12 text-muted-foreground mb-4" />
 <p className="text-muted-foreground mb-4">
 Henüz hatırlatma oluşturulmadı
 </p>
 <Button onClick={onCreateReminder} variant="outline" size="sm">
 İlk Hatırlatmayı Oluştur
 </Button>
 </CardContent>
 </Card>
 ) : (
 reminders.map((reminder) => {
 const typeInfo = reminderTypeLabels[reminder.reminderType];
 const statusInfo = reminderStatusConfig[reminder.status];
 const TypeIcon = typeInfo.icon;
 const StatusIcon = statusInfo.icon;

 return (
 <Card key={reminder.id}>
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <TypeIcon className="h-4 w-4 text-muted-foreground" />
 <Badge variant="outline">{typeInfo.label}</Badge>
 <Badge variant={statusInfo.variant} className="gap-1">
 <StatusIcon className="h-3 w-3" />
 {statusInfo.label}
 </Badge>
 </div>
 <CardTitle className="text-base">{reminder.title}</CardTitle>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="flex items-center gap-4 text-sm text-muted-foreground">
 <div className="flex items-center gap-1">
 <Calendar className="h-3 w-3" />
 {format(new Date(reminder.reminderDate),"d MMM yyyy", { locale: tr })}
 </div>
 <div className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 {reminder.reminderTime}
 </div>
 </div>

 {reminder.description && (
 <p className="text-sm text-muted-foreground">
 {reminder.description}
 </p>
 )}

 {reminder.students && reminder.students.length > 0 && (
 <div className="flex items-center gap-2 flex-wrap">
 <Users className="h-3 w-3 text-muted-foreground" />
 {reminder.students.map(student => (
 <Badge key={student.id} variant="secondary" className="text-xs">
 {student.name} {student.surname}
 </Badge>
 ))}
 </div>
 )}

 {reminder.status === 'pending' && (
 <div className="flex gap-2 pt-2">
 <Button
 onClick={() => onCompleteReminder(reminder.id)}
 size="sm"
 variant="outline"
 className="gap-1"
 >
 <CheckCircle2 className="h-3 w-3" />
 Tamamla
 </Button>
 <Button
 onClick={() => onEditReminder(reminder)}
 size="sm"
 variant="outline"
 className="gap-1"
 >
 <Edit className="h-3 w-3" />
 Düzenle
 </Button>
 <Button
 onClick={() => onCancelReminder(reminder.id)}
 size="sm"
 variant="outline"
 className="gap-1 text-destructive"
 >
 <XCircle className="h-3 w-3" />
 İptal
 </Button>
 </div>
 )}
 </CardContent>
 </Card>
 );
 })
 )}
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <CheckSquare className="h-5 w-5 text-muted-foreground" />
 <h3 className="text-lg font-semibold">Takipler</h3>
 {activeFollowUps.length > 0 && (
 <Badge variant="secondary">{activeFollowUps.length}</Badge>
 )}
 </div>
 <Button onClick={onCreateFollowUp} size="sm" className="gap-2">
 <Plus className="h-4 w-4" />
 Yeni Takip
 </Button>
 </div>

 <div className="space-y-3">
 {followUps.length === 0 ? (
 <Card>
 <CardContent className="flex flex-col items-center justify-center py-12 text-center">
 <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
 <p className="text-muted-foreground mb-4">
 Henüz takip görevi oluşturulmadı
 </p>
 <Button onClick={onCreateFollowUp} variant="outline" size="sm">
 İlk Takibi Oluştur
 </Button>
 </CardContent>
 </Card>
 ) : (
 followUps.map((followUp) => {
 const statusInfo = followUpStatusConfig[followUp.status];
 const priorityInfo = priorityConfig[followUp.priority];
 const StatusIcon = statusInfo.icon;

 return (
 <Card key={followUp.id}>
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <Badge variant={priorityInfo.variant}>
 {priorityInfo.label}
 </Badge>
 <Badge variant={statusInfo.variant} className="gap-1">
 <StatusIcon className="h-3 w-3" />
 {statusInfo.label}
 </Badge>
 </div>
 <CardTitle className="text-sm text-muted-foreground">
 {followUp.assignedTo}
 </CardTitle>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Calendar className="h-3 w-3" />
 {format(new Date(followUp.followUpDate),"d MMM yyyy", { locale: tr })}
 </div>

 <div className="text-sm whitespace-pre-line bg-muted/50 p-3 rounded-md">
 {followUp.actionItems}
 </div>

 {followUp.notes && (
 <p className="text-sm text-muted-foreground italic">
 {followUp.notes}
 </p>
 )}

 {followUp.status !== 'completed' && (
 <div className="flex gap-2 pt-2">
 {followUp.status === 'pending' && (
 <Button
 onClick={() => onProgressFollowUp(followUp.id)}
 size="sm"
 variant="outline"
 className="gap-1"
 >
 <AlertCircle className="h-3 w-3" />
 Başla
 </Button>
 )}
 <Button
 onClick={() => onCompleteFollowUp(followUp.id)}
 size="sm"
 variant="outline"
 className="gap-1"
 >
 <CheckCircle2 className="h-3 w-3" />
 Tamamla
 </Button>
 <Button
 onClick={() => onEditFollowUp(followUp)}
 size="sm"
 variant="outline"
 className="gap-1"
 >
 <Edit className="h-3 w-3" />
 Düzenle
 </Button>
 </div>
 )}
 </CardContent>
 </Card>
 );
 })
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
