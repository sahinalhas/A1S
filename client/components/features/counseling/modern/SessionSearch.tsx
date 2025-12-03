import { useEffect, useState, useMemo } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/organisms/Command';
import { Badge } from '@/components/atoms/Badge';
import { Calendar, Clock, User, Users, Search } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import type { CounselingSession } from '../types';

interface SessionSearchProps {
 sessions: CounselingSession[];
 open: boolean;
 onOpenChange: (open: boolean) => void;
 onSelectSession: (session: CounselingSession) => void;
}

export default function SessionSearch({ 
 sessions, 
 open, 
 onOpenChange,
 onSelectSession 
}: SessionSearchProps) {
 const [search, setSearch] = useState('');

 useEffect(() => {
 const down = (e: KeyboardEvent) => {
 if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
 e.preventDefault();
 onOpenChange(!open);
 }
 };

 document.addEventListener('keydown', down);
 return () => document.removeEventListener('keydown', down);
 }, [open, onOpenChange]);

 const filteredSessions = useMemo(() => {
 if (!search) return sessions.slice(0, 10);

 const searchLower = search.toLowerCase();
 return sessions.filter((session) => {
 const studentName = session.sessionType === 'individual' 
 ? `${session.student?.name || ''} ${session.student?.surname || ''}`.toLowerCase().trim()
 : session.groupName?.toLowerCase() || '';
 
 const topic = session.topic.toLowerCase();
 const notes = session.detailedNotes?.toLowerCase() || '';
 const date = format(new Date(session.sessionDate), 'dd MMMM yyyy', { locale: tr }).toLowerCase();

 return (
 studentName.includes(searchLower) ||
 topic.includes(searchLower) ||
 notes.includes(searchLower) ||
 date.includes(searchLower)
 );
 }).slice(0, 10);
 }, [sessions, search]);

 const groupedSessions = useMemo(() => {
 const active = filteredSessions.filter(s => !s.completed);
 const completed = filteredSessions.filter(s => s.completed);
 
 return {
 active: active.length > 0 ? active : undefined,
 completed: completed.length > 0 ? completed : undefined,
 };
 }, [filteredSessions]);

 const handleSelect = (session: CounselingSession) => {
 onSelectSession(session);
 onOpenChange(false);
 setSearch('');
 };

 return (
 <CommandDialog open={open} onOpenChange={onOpenChange}>
 <CommandInput 
 placeholder="Görüşme ara... (Cmd+K)" 
 value={search}
 onValueChange={setSearch}
 />
 <CommandList>
 <CommandEmpty>
 <div className="flex flex-col items-center justify-center py-6 text-center">
 <Search className="h-10 w-10 text-muted-foreground mb-3" />
 <p className="text-sm text-muted-foreground">Görüşme bulunamadı</p>
 <p className="text-xs text-muted-foreground mt-1">
 Farklı anahtar kelimeler deneyin
 </p>
 </div>
 </CommandEmpty>
 
 {groupedSessions.active && (
 <CommandGroup heading="Aktif Görüşmeler">
 {groupedSessions.active.map((session) => (
 <CommandItem
 key={session.id}
 value={session.id}
 onSelect={() => handleSelect(session)}
 className="flex items-start gap-3 py-3 cursor-pointer"
 >
 <div className="flex-shrink-0 mt-1">
 {session.sessionType === 'individual' ? (
 <User className="h-4 w-4 text-blue-600" />
 ) : (
 <Users className="h-4 w-4 text-purple-600" />
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <p className="font-medium text-sm truncate">
 {session.sessionType === 'individual'
 ? session.student?.name
 : session.groupName || 'Grup Görüşmesi'}
 </p>
 <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
 Aktif
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground truncate mb-1">
 {session.topic}
 </p>
 <div className="flex items-center gap-3 text-xs text-muted-foreground">
 <span className="flex items-center gap-1">
 <Calendar className="h-3 w-3" />
 {format(new Date(session.sessionDate), 'dd MMM yyyy', { locale: tr })}
 </span>
 <span className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 {session.entryTime}
 </span>
 </div>
 </div>
 </CommandItem>
 ))}
 </CommandGroup>
 )}

 {groupedSessions.completed && (
 <CommandGroup heading="Tamamlanan Görüşmeler">
 {groupedSessions.completed.map((session) => (
 <CommandItem
 key={session.id}
 value={session.id}
 onSelect={() => handleSelect(session)}
 className="flex items-start gap-3 py-3 cursor-pointer"
 >
 <div className="flex-shrink-0 mt-1">
 {session.sessionType === 'individual' ? (
 <User className="h-4 w-4 text-blue-600" />
 ) : (
 <Users className="h-4 w-4 text-purple-600" />
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <p className="font-medium text-sm truncate">
 {session.sessionType === 'individual'
 ? session.student?.name
 : session.groupName || 'Grup Görüşmesi'}
 </p>
 <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
 Tamamlandı
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground truncate mb-1">
 {session.topic}
 </p>
 <div className="flex items-center gap-3 text-xs text-muted-foreground">
 <span className="flex items-center gap-1">
 <Calendar className="h-3 w-3" />
 {format(new Date(session.sessionDate), 'dd MMM yyyy', { locale: tr })}
 </span>
 <span className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 {session.entryTime} - {session.exitTime || '?'}
 </span>
 </div>
 </div>
 </CommandItem>
 ))}
 </CommandGroup>
 )}
 </CommandList>
 </CommandDialog>
 );
}
