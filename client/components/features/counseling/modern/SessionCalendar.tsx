import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CounselingSession } from '../types';

const locales = {
 tr: tr,
};

const localizer = dateFnsLocalizer({
 format,
 parse,
 startOfWeek: () => startOfWeek(new Date(), { locale: tr }),
 getDay,
 locales,
});

const messages = {
 allDay: 'Tüm Gün',
 previous: 'Önceki',
 next: 'Sonraki',
 today: 'Bugün',
 month: 'Ay',
 week: 'Hafta',
 day: 'Gün',
 agenda: 'Ajanda',
 date: 'Tarih',
 time: 'Saat',
 event: 'Görüşme',
 noEventsInRange: 'Bu tarih aralığında görüşme bulunmuyor.',
 showMore: (total: number) => `+${total} daha`,
};

interface CalendarEvent extends Event {
 session: CounselingSession;
 resource?: {
 type: 'individual' | 'group';
 completed: boolean;
 };
}

interface SessionCalendarProps {
 sessions: CounselingSession[];
 onSelectSession: (session: CounselingSession) => void;
 onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

export default function SessionCalendar({ 
 sessions, 
 onSelectSession,
 onSelectSlot 
}: SessionCalendarProps) {
 const [view, setView] = useState<View>('week');
 const [date, setDate] = useState(new Date());

 const events: CalendarEvent[] = useMemo(() => {
 return sessions.map((session) => {
 const sessionDate = new Date(session.sessionDate);
 const [entryHour, entryMinute] = session.entryTime.split(':').map(Number);
 
 const start = new Date(sessionDate);
 start.setHours(entryHour, entryMinute, 0, 0);
 
 let end = new Date(start);
 if (session.exitTime) {
 const [exitHour, exitMinute] = session.exitTime.split(':').map(Number);
 end.setHours(exitHour, exitMinute, 0, 0);
 } else {
 end.setHours(entryHour, entryMinute + 60, 0, 0);
 }

 const title = session.sessionType === 'individual'
 ? `${session.student?.name || ''} ${session.student?.surname || ''}`.trim() || 'Bireysel Görüşme'
 : session.groupName || 'Grup Görüşmesi';

 return {
 title,
 start,
 end,
 session,
 resource: {
 type: session.sessionType,
 completed: session.completed,
 },
 };
 });
 }, [sessions]);

 const eventStyleGetter = useCallback(
 (event: CalendarEvent) => {
 const isIndividual = event.resource?.type === 'individual';
 const isCompleted = event.resource?.completed;

 let backgroundColor = isIndividual ? '#3b82f6' : '#8b5cf6';
 let borderColor = isIndividual ? '#2563eb' : '#7c3aed';
 
 if (isCompleted) {
 backgroundColor = '#10b981';
 borderColor = '#059669';
 } else if (!event.session.exitTime) {
 backgroundColor = '#f59e0b';
 borderColor = '#d97706';
 }

 return {
 style: {
 backgroundColor,
 borderColor,
 borderWidth: '2px',
 borderStyle: 'solid',
 borderRadius: '6px',
 opacity: isCompleted ? 0.75 : 1,
 color: 'white',
 fontSize: '0.875rem',
 fontWeight: '500',
 padding: '2px 6px',
 },
 };
 },
 []
 );

 const handleSelectEvent = useCallback(
 (event: CalendarEvent) => {
 onSelectSession(event.session);
 },
 [onSelectSession]
 );

 const handleSelectSlot = useCallback(
 (slotInfo: { start: Date; end: Date }) => {
 if (onSelectSlot) {
 onSelectSlot(slotInfo);
 }
 },
 [onSelectSlot]
 );

 const handleNavigate = useCallback((newDate: Date) => {
 setDate(newDate);
 }, []);

 const handleViewChange = useCallback((newView: View) => {
 setView(newView);
 }, []);

 const CustomToolbar = ({ label, onNavigate, onView }: any) => (
 <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => onNavigate('PREV')}
 className="h-8 w-8 p-0"
 >
 <ChevronLeft className="h-4 w-4" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onNavigate('TODAY')}
 >
 Bugün
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onNavigate('NEXT')}
 className="h-8 w-8 p-0"
 >
 <ChevronRight className="h-4 w-4" />
 </Button>
 </div>
 
 <h2 className="text-lg font-semibold">{label}</h2>
 
 <div className="flex gap-1">
 <Button
 variant={view === 'month' ? 'default' : 'outline'}
 size="sm"
 onClick={() => onView('month')}
 >
 Ay
 </Button>
 <Button
 variant={view === 'week' ? 'default' : 'outline'}
 size="sm"
 onClick={() => onView('week')}
 >
 Hafta
 </Button>
 <Button
 variant={view === 'day' ? 'default' : 'outline'}
 size="sm"
 onClick={() => onView('day')}
 >
 Gün
 </Button>
 <Button
 variant={view === 'agenda' ? 'default' : 'outline'}
 size="sm"
 onClick={() => onView('agenda')}
 >
 Ajanda
 </Button>
 </div>
 </div>
 );

 return (
 <Card>
 <CardHeader>
 <div className="flex items-start justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 <CalendarIcon className="h-5 w-5" />
 Görüşme Takvimi
 </CardTitle>
 <CardDescription>
 Görüşmelerinizi görsel takvimde görüntüleyin ve yönetin
 </CardDescription>
 </div>
 <div className="flex gap-2 flex-wrap">
 <div className="flex items-center gap-2">
 <Badge variant="default" className="bg-blue-600">Bireysel</Badge>
 <Badge variant="default" className="bg-purple-600">Grup</Badge>
 <Badge variant="default" className="bg-amber-600">Aktif</Badge>
 <Badge variant="default" className="bg-green-600">Tamamlandı</Badge>
 </div>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <div className="h-[700px]">
 <Calendar
 localizer={localizer}
 events={events}
 startAccessor="start"
 endAccessor="end"
 views={['month', 'week', 'day', 'agenda']}
 view={view}
 onView={handleViewChange}
 date={date}
 onNavigate={handleNavigate}
 onSelectEvent={handleSelectEvent}
 onSelectSlot={handleSelectSlot}
 selectable
 eventPropGetter={eventStyleGetter}
 messages={messages}
 culture="tr"
 components={{
 toolbar: CustomToolbar,
 }}
 step={30}
 timeslots={2}
 min={new Date(0, 0, 0, 7, 0, 0)}
 max={new Date(0, 0, 0, 19, 0, 0)}
 className="rounded-lg border bg-card"
 />
 </div>
 </CardContent>
 </Card>
 );
}
