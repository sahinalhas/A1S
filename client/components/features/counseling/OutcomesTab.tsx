import React from "react";
import { CheckCircle2, Plus, Calendar, Star, Edit, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Separator } from "@/components/atoms/Separator";

import type { CounselingOutcome, CounselingSession } from "./types";

interface OutcomesTabProps {
 outcomes: (CounselingOutcome & { session?: CounselingSession })[];
 onCreateOutcome: () => void;
 onEditOutcome: (outcome: CounselingOutcome & { session?: CounselingSession }) => void;
 onDeleteOutcome: (id: string) => void;
}

export default function OutcomesTab({
 outcomes,
 onCreateOutcome,
 onEditOutcome,
 onDeleteOutcome,
}: OutcomesTabProps) {
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
 <h3 className="text-lg font-semibold">Görüşme Sonuçları</h3>
 {outcomes.length > 0 && (
 <Badge variant="secondary">{outcomes.length}</Badge>
 )}
 </div>
 <Button onClick={onCreateOutcome} size="sm" className="gap-2">
 <Plus className="h-4 w-4" />
 Yeni Sonuç
 </Button>
 </div>

 <div className="space-y-3">
 {outcomes.length === 0 ? (
 <Card>
 <CardContent className="flex flex-col items-center justify-center py-12 text-center">
 <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
 <p className="text-muted-foreground mb-4">
 Henüz görüşme sonucu eklenmedi
 </p>
 <Button onClick={onCreateOutcome} variant="outline" size="sm">
 İlk Sonucu Ekle
 </Button>
 </CardContent>
 </Card>
 ) : (
 outcomes.map((outcome) => {
 const session = outcome.session;
 
 return (
 <Card key={outcome.id}>
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 {outcome.effectivenessRating && (
 <div className="flex items-center gap-1">
 <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
 <span className="text-sm font-medium">{outcome.effectivenessRating}/5</span>
 </div>
 )}
 {outcome.followUpRequired && (
 <Badge variant="default" className="gap-1">
 <AlertCircle className="h-3 w-3" />
 Takip Gerekli
 </Badge>
 )}
 </div>
 <CardTitle className="text-base">
 {session ? session.topic : 'Görüşme Sonucu'}
 </CardTitle>
 {session && (
 <CardDescription className="mt-1">
 {session.student && <span>{session.student.name} {session.student.surname}</span>}
 {session.groupName && <span>{session.groupName}</span>}
 {' • '}
 {format(new Date(session.sessionDate),"d MMM yyyy", { locale: tr })}
 </CardDescription>
 )}
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-3">
 {outcome.progressNotes && (
 <div className="text-sm">
 <span className="font-medium">İlerleme Notları: </span>
 <span className="text-muted-foreground">{outcome.progressNotes}</span>
 </div>
 )}

 {outcome.goalsAchieved && (
 <div className="text-sm">
 <span className="font-medium">Ulaşılan Hedefler: </span>
 <span className="text-muted-foreground">{outcome.goalsAchieved}</span>
 </div>
 )}

 {outcome.nextSteps && (
 <div className="text-sm">
 <span className="font-medium">Sonraki Adımlar: </span>
 <span className="text-muted-foreground">{outcome.nextSteps}</span>
 </div>
 )}

 {outcome.recommendations && (
 <div className="text-sm">
 <span className="font-medium">Öneriler: </span>
 <span className="text-muted-foreground">{outcome.recommendations}</span>
 </div>
 )}

 {outcome.followUpRequired && outcome.followUpDate && (
 <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
 <Calendar className="h-3 w-3" />
 <span>Takip Tarihi: {format(new Date(outcome.followUpDate),"d MMM yyyy", { locale: tr })}</span>
 </div>
 )}

 <div className="flex gap-2 pt-2">
 <Button
 onClick={() => onEditOutcome(outcome)}
 size="sm"
 variant="outline"
 className="gap-1"
 >
 <Edit className="h-3 w-3" />
 Düzenle
 </Button>
 <Button
 onClick={() => onDeleteOutcome(outcome.id)}
 size="sm"
 variant="outline"
 className="gap-1 text-destructive"
 >
 <Trash2 className="h-3 w-3" />
 Sil
 </Button>
 </div>
 </CardContent>
 </Card>
 );
 })
 )}
 </div>
 </div>
 );
}
