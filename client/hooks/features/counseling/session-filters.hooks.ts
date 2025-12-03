import { useState, useMemo, useCallback } from 'react';
import type { CounselingSession } from '@/components/features/counseling/types';

export interface SessionFilterState {
 searchQuery: string;
 sessionType: 'all' | 'individual' | 'group';
 sessionMode: string;
 status: 'all' | 'active' | 'completed';
 dateFrom: string;
 dateTo: string;
 studentId: string;
 topic: string;
}

export interface UseSessionFiltersReturn {
 filters: SessionFilterState;
 filteredSessions: CounselingSession[];
 setSearchQuery: (query: string) => void;
 setSessionType: (type: 'all' | 'individual' | 'group') => void;
 setSessionMode: (mode: string) => void;
 setStatus: (status: 'all' | 'active' | 'completed') => void;
 setDateFrom: (date: string) => void;
 setDateTo: (date: string) => void;
 setStudentId: (id: string) => void;
 setTopic: (topic: string) => void;
 resetFilters: () => void;
 hasActiveFilters: boolean;
 activeFilterCount: number;
}

const DEFAULT_FILTERS: SessionFilterState = {
 searchQuery: '',
 sessionType: 'all',
 sessionMode: 'all',
 status: 'all',
 dateFrom: '',
 dateTo: '',
 studentId: '',
 topic: '',
};

export function useSessionFilters(sessions: CounselingSession[]): UseSessionFiltersReturn {
 const [filters, setFilters] = useState<SessionFilterState>(DEFAULT_FILTERS);

 const setSearchQuery = useCallback((query: string) => {
 setFilters((prev) => ({ ...prev, searchQuery: query }));
 }, []);

 const setSessionType = useCallback((type: 'all' | 'individual' | 'group') => {
 setFilters((prev) => ({ ...prev, sessionType: type }));
 }, []);

 const setSessionMode = useCallback((mode: string) => {
 setFilters((prev) => ({ ...prev, sessionMode: mode }));
 }, []);

 const setStatus = useCallback((status: 'all' | 'active' | 'completed') => {
 setFilters((prev) => ({ ...prev, status: status }));
 }, []);

 const setDateFrom = useCallback((date: string) => {
 setFilters((prev) => ({ ...prev, dateFrom: date }));
 }, []);

 const setDateTo = useCallback((date: string) => {
 setFilters((prev) => ({ ...prev, dateTo: date }));
 }, []);

 const setStudentId = useCallback((id: string) => {
 setFilters((prev) => ({ ...prev, studentId: id }));
 }, []);

 const setTopic = useCallback((topic: string) => {
 setFilters((prev) => ({ ...prev, topic: topic }));
 }, []);

 const resetFilters = useCallback(() => {
 setFilters(DEFAULT_FILTERS);
 }, []);

 const filteredSessions = useMemo(() => {
 return sessions.filter((session) => {
 const matchesSearch = 
 filters.searchQuery === '' ||
 session.topic.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
 (session.sessionType === 'individual' && 
 `${session.student?.name || ''} ${session.student?.surname || ''}`.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
 (session.sessionType === 'group' && 
 session.groupName?.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
 session.detailedNotes?.toLowerCase().includes(filters.searchQuery.toLowerCase());

 const matchesType =
 filters.sessionType === 'all' ||
 session.sessionType === filters.sessionType;

 const matchesMode =
 filters.sessionMode === 'all' ||
 session.sessionMode === filters.sessionMode;

 const matchesStatus =
 filters.status === 'all' ||
 (filters.status === 'active' && !session.completed) ||
 (filters.status === 'completed' && session.completed);

 const matchesDateFrom =
 !filters.dateFrom ||
 new Date(session.sessionDate) >= new Date(filters.dateFrom);

 const matchesDateTo =
 !filters.dateTo ||
 new Date(session.sessionDate) <= new Date(filters.dateTo);

 const matchesStudent =
 !filters.studentId ||
 (session.sessionType === 'individual' && session.student?.id === filters.studentId) ||
 (session.sessionType === 'group' && 
 session.students?.some(s => s.id === filters.studentId));

 const matchesTopic =
 !filters.topic ||
 session.topic.toLowerCase().includes(filters.topic.toLowerCase());

 return (
 matchesSearch &&
 matchesType &&
 matchesMode &&
 matchesStatus &&
 matchesDateFrom &&
 matchesDateTo &&
 matchesStudent &&
 matchesTopic
 );
 });
 }, [sessions, filters]);

 const hasActiveFilters = useMemo(() => {
 return (
 filters.searchQuery !== '' ||
 filters.sessionType !== 'all' ||
 filters.sessionMode !== 'all' ||
 filters.status !== 'all' ||
 filters.dateFrom !== '' ||
 filters.dateTo !== '' ||
 filters.studentId !== '' ||
 filters.topic !== ''
 );
 }, [filters]);

 const activeFilterCount = useMemo(() => {
 let count = 0;
 if (filters.searchQuery !== '') count++;
 if (filters.sessionType !== 'all') count++;
 if (filters.sessionMode !== 'all') count++;
 if (filters.status !== 'all') count++;
 if (filters.dateFrom !== '') count++;
 if (filters.dateTo !== '') count++;
 if (filters.studentId !== '') count++;
 if (filters.topic !== '') count++;
 return count;
 }, [filters]);

 return {
 filters,
 filteredSessions,
 setSearchQuery,
 setSessionType,
 setSessionMode,
 setStatus,
 setDateFrom,
 setDateTo,
 setStudentId,
 setTopic,
 resetFilters,
 hasActiveFilters,
 activeFilterCount,
 };
}
