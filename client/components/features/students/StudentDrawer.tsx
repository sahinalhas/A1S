import {
 Sheet,
 SheetContent,
 SheetDescription,
 SheetHeader,
 SheetTitle,
} from '@/components/organisms/Sheet';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Separator } from '@/components/atoms/Separator';
import {
 User,
 Mail,
 Phone,
 GraduationCap,
 Calendar,
 Edit,
 Eye,
} from 'lucide-react';
import type { Student } from '@/lib/storage';
import { Link } from 'react-router-dom';

interface StudentDrawerProps {
 student: Student | null;
 open: boolean;
 onOpenChange: (open: boolean) => void;
 onEdit?: (student: Student) => void;
}

export function StudentDrawer({ student, open, onOpenChange, onEdit }: StudentDrawerProps) {
 if (!student) return null;

 return (
 <Sheet open={open} onOpenChange={onOpenChange}>
 <SheetContent className="w-full sm:max-w-md overflow-y-auto">
 <SheetHeader>
 <SheetTitle className="flex items-center gap-2">
 <div className="rounded-full bg-primary/10 p-2">
 <User className="h-5 w-5 text-primary" />
 </div>
 Öğrenci Detayları
 </SheetTitle>
 <SheetDescription>
 {student.name} {student.surname} hakkında bilgiler
 </SheetDescription>
 </SheetHeader>

 <div className="mt-6 space-y-6">
 <div className="flex items-center gap-4">
 <div className="rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-6">
 <User className="h-8 w-8 text-primary" />
 </div>
 <div>
 <h3 className="text-xl font-bold">
 {student.name} {student.surname}
 </h3>
 <p className="text-sm text-muted-foreground">Öğrenci No: {student.id}</p>
 </div>
 </div>

 <Separator />

 <div className="space-y-4">
 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
 Genel Bilgiler
 </h4>

 <div className="space-y-3">
 <div className="flex items-center gap-3">
 <div className="rounded-md bg-blue-500/10 p-2">
 <GraduationCap className="h-4 w-4 text-blue-600" />
 </div>
 <div className="flex-1">
 <p className="text-xs text-muted-foreground">Sınıf</p>
 <p className="font-medium">{student.class}</p>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <div className="rounded-md bg-purple-500/10 p-2">
 <User className="h-4 w-4 text-purple-600" />
 </div>
 <div className="flex-1">
 <p className="text-xs text-muted-foreground">Cinsiyet</p>
 <p className="font-medium">
 {student.gender === 'E' ? 'Erkek' : 'Kız'}
 </p>
 </div>
 </div>

 {student.enrollmentDate && (
 <div className="flex items-center gap-3">
 <div className="rounded-md bg-orange-500/10 p-2">
 <Calendar className="h-4 w-4 text-orange-600" />
 </div>
 <div className="flex-1">
 <p className="text-xs text-muted-foreground">Kayıt Tarihi</p>
 <p className="font-medium">
 {new Date(student.enrollmentDate).toLocaleDateString('tr-TR')}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>

 {(student.phone || student.motherName || student.fatherName || student.guardianName) && (
 <>
 <Separator />
 <div className="space-y-4">
 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
 İletişim Bilgileri
 </h4>

 <div className="space-y-3">
 {student.phone && (
 <div className="flex items-center gap-3">
 <div className="rounded-md bg-green-500/10 p-2">
 <Phone className="h-4 w-4 text-green-600" />
 </div>
 <div className="flex-1">
 <p className="text-xs text-muted-foreground">Telefon</p>
 <p className="font-medium">{student.phone}</p>
 </div>
 </div>
 )}

 {student.motherName && (
 <div className="flex items-center gap-3">
 <div className="rounded-md bg-indigo-500/10 p-2">
 <User className="h-4 w-4 text-indigo-600" />
 </div>
 <div className="flex-1">
 <p className="text-xs text-muted-foreground">Anne</p>
 <p className="font-medium">{student.motherName}</p>
 {student.motherPhone && (
 <p className="text-xs text-muted-foreground">{student.motherPhone}</p>
 )}
 </div>
 </div>
 )}

 {student.fatherName && (
 <div className="flex items-center gap-3">
 <div className="rounded-md bg-blue-500/10 p-2">
 <User className="h-4 w-4 text-blue-600" />
 </div>
 <div className="flex-1">
 <p className="text-xs text-muted-foreground">Baba</p>
 <p className="font-medium">{student.fatherName}</p>
 {student.fatherPhone && (
 <p className="text-xs text-muted-foreground">{student.fatherPhone}</p>
 )}
 </div>
 </div>
 )}

 {student.guardianName && (
 <div className="flex items-center gap-3">
 <div className="rounded-md bg-pink-500/10 p-2">
 <Phone className="h-4 w-4 text-pink-600" />
 </div>
 <div className="flex-1">
 <p className="text-xs text-muted-foreground">{student.guardianRelation || 'Vasi'}</p>
 <p className="font-medium">{student.guardianName}</p>
 {student.guardianPhone && (
 <p className="text-xs text-muted-foreground">{student.guardianPhone}</p>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 </>
 )}

 <Separator />

 <div className="flex gap-2">
 <Button asChild className="flex-1">
 <Link to={`/ogrenci/${student.id}`}>
 <Eye className="mr-2 h-4 w-4" />
 Tam Profil
 </Link>
 </Button>
 {onEdit && (
 <Button
 variant="outline"
 className="flex-1"
 onClick={() => {
 onEdit(student);
 onOpenChange(false);
 }}
 >
 <Edit className="mr-2 h-4 w-4" />
 Düzenle
 </Button>
 )}
 </div>
 </div>
 </SheetContent>
 </Sheet>
 );
}
