import { Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/organisms/Card";

import SessionCard from "./SessionCard";
import type { CounselingSession } from "./types";

interface ActiveSessionsGridProps {
 sessions: CounselingSession[];
 isLoading: boolean;
 onCompleteSession: (session: CounselingSession) => void;
 onExtendSession: (sessionId: string) => void;
 extendingSessionId?: string;
}

export default function ActiveSessionsGrid({
 sessions,
 isLoading,
 onCompleteSession,
 onExtendSession,
 extendingSessionId,
}: ActiveSessionsGridProps) {
 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-12">
 <Loader2 className="h-8 w-8 text-muted-foreground" />
 </div>
 );
 }

 if (sessions.length === 0) {
 return (
 <Card>
 <CardContent className="flex flex-col items-center justify-center py-12">
 <Clock className="h-12 w-12 text-muted-foreground mb-4" />
 <p className="text-lg font-medium text-muted-foreground">Aktif görüşme bulunmuyor</p>
 <p className="text-sm text-muted-foreground">Yeni görüşme başlatmak için yukarıdaki butonu kullanın</p>
 </CardContent>
 </Card>
 );
 }

 return (
 <div className="grid gap-4">
 {sessions.map((session) => (
 <SessionCard
 key={session.id}
 session={session}
 onComplete={() => onCompleteSession(session)}
 onExtend={() => onExtendSession(session.id)}
 extendPending={extendingSessionId === session.id}
 />
 ))}
 </div>
 );
}
