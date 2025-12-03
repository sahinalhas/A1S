import { useState, useMemo, useCallback } from 'react';
import type { Student } from '@/lib/storage';

export interface FilterState {
 searchQuery: string;
 selectedClass: string;
 selectedGender: string;
 selectedRisk: string;
}

export interface UseStudentFiltersReturn {
 filters: FilterState;
 filteredStudents: Student[];
 setSearchQuery: (query: string) => void;
 setSelectedClass: (classValue: string) => void;
 setSelectedGender: (gender: string) => void;
 setSelectedRisk: (risk: string) => void;
 resetFilters: () => void;
 hasActiveFilters: boolean;
 activeFilterCount: number;
}

const DEFAULT_FILTERS: FilterState = {
 searchQuery: '',
 selectedClass: 'tum',
 selectedGender: 'tum',
 selectedRisk: 'tum',
};

export function useStudentFilters(students: Student[]): UseStudentFiltersReturn {
 const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

 const setSearchQuery = useCallback((query: string) => {
 setFilters((prev) => ({ ...prev, searchQuery: query }));
 }, []);

 const setSelectedClass = useCallback((classValue: string) => {
 setFilters((prev) => ({ ...prev, selectedClass: classValue }));
 }, []);

 const setSelectedGender = useCallback((gender: string) => {
 setFilters((prev) => ({ ...prev, selectedGender: gender }));
 }, []);

 const setSelectedRisk = useCallback((risk: string) => {
 setFilters((prev) => ({ ...prev, selectedRisk: risk }));
 }, []);

 const resetFilters = useCallback(() => {
 setFilters(DEFAULT_FILTERS);
 }, []);

 const filteredStudents = useMemo(() => {
 return students.filter((student) => {
 const matchesSearch =
 filters.searchQuery === '' ||
 `${student.id} ${student.name} ${student.surname}`
 .toLowerCase()
 .includes(filters.searchQuery.toLowerCase());

 const matchesClass =
 filters.selectedClass === 'tum' ||
 student.class === filters.selectedClass;

 const matchesGender =
 filters.selectedGender === 'tum' ||
 student.gender === filters.selectedGender;

 const matchesRisk =
 filters.selectedRisk === 'tum' ||
 (student.risk || 'Düşük') === filters.selectedRisk;

 return matchesSearch && matchesClass && matchesGender && matchesRisk;
 });
 }, [students, filters]);

 const hasActiveFilters = useMemo(() => {
 return (
 filters.searchQuery !== '' ||
 filters.selectedClass !== 'tum' ||
 filters.selectedGender !== 'tum' ||
 filters.selectedRisk !== 'tum'
 );
 }, [filters]);

 const activeFilterCount = useMemo(() => {
 let count = 0;
 if (filters.searchQuery !== '') count++;
 if (filters.selectedClass !== 'tum') count++;
 if (filters.selectedGender !== 'tum') count++;
 if (filters.selectedRisk !== 'tum') count++;
 return count;
 }, [filters]);

 return {
 filters,
 filteredStudents,
 setSearchQuery,
 setSelectedClass,
 setSelectedGender,
 setSelectedRisk,
 resetFilters,
 hasActiveFilters,
 activeFilterCount,
 };
}
