import { useMemo } from 'react';

interface Student {
 id: string;
 name?: string;
 surname?: string;
}

export function useStudentFilter<T extends Student>(
 students: T[],
 searchQuery: string
): T[] {
 return useMemo(() => {
 if (!searchQuery.trim()) {
 return students;
 }

 const query = searchQuery.toLowerCase();
 return students.filter((student) => {
 const fullName = `${student.name || ''} ${student.surname || ''}`.trim();
 const id = student.id || '';
 
 return (
 fullName.toLowerCase().includes(query) ||
 id.toLowerCase().includes(query)
 );
 });
 }, [students, searchQuery]);
}
