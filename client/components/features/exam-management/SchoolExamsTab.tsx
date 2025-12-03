import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/organisms/Card';
import { GraduationCap } from 'lucide-react';
import { SchoolExamsManagement } from './SchoolExamsManagement';
import type { SchoolExamResult } from '../../../shared/types/exam-management.types';

interface Student {
 id: string;
 name: string;
}

interface SchoolExamsTabProps {
 students: Student[];
 schoolExams: SchoolExamResult[];
 onSave: (data: any) => Promise<void>;
 onDelete: (examId: string) => Promise<void>;
}

export function SchoolExamsTab({
 students,
 schoolExams,
 onSave,
 onDelete,
}: SchoolExamsTabProps) {
 return (
 <div className="space-y-5">
 <Card className="overflow-hidden">
 <CardHeader className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2 text-lg">
 <GraduationCap className="h-5 w-5 text-primary" />
 Okul Sınavları Yönetimi
 </CardTitle>
 <CardDescription className="mt-1">
 Dönem sonu, yazılı ve diğer okul sınav notlarını yönetin
 </CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent className="pt-6">
 <SchoolExamsManagement
 students={students}
 schoolExams={schoolExams}
 onSave={onSave}
 onDelete={onDelete}
 />
 </CardContent>
 </Card>
 </div>
 );
}
