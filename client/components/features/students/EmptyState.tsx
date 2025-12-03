import { Button } from '@/components/atoms/Button';
import { UserPlus, Users, Search, Filter } from 'lucide-react';

interface EmptyStateProps {
 variant?: 'no-students' | 'no-results';
 onAddStudent?: () => void;
 onClearFilters?: () => void;
}

export function EmptyState({
 variant = 'no-students',
 onAddStudent,
 onClearFilters,
}: EmptyStateProps) {
 if (variant === 'no-results') {
 return (
 <div className="flex flex-col items-center justify-center py-16 px-4">
 <div className="rounded-full bg-muted p-6 mb-4">
 <Search className="h-12 w-12 text-muted-foreground" />
 </div>
 <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
 <p className="text-muted-foreground text-center mb-6 max-w-md">
 Arama kriterlerinize uygun öğrenci bulunamadı. Lütfen farklı filtreler
 deneyin veya arama teriminizi değiştirin.
 </p>
 {onClearFilters && (
 <Button variant="outline" onClick={onClearFilters}>
 <Filter className="mr-2 h-4 w-4" />
 Filtreleri Temizle
 </Button>
 )}
 </div>
 );
 }

 return (
 <div className="flex flex-col items-center justify-center py-16 px-4">
 <div className="rounded-full bg-primary/10 p-6 mb-4">
 <Users className="h-12 w-12 text-primary" />
 </div>
 <h3 className="text-xl font-semibold mb-2">Henüz Öğrenci Yok</h3>
 <p className="text-muted-foreground text-center mb-6 max-w-md">
 Sistemde kayıtlı öğrenci bulunmamaktadır. Yeni öğrenci ekleyerek
 başlayabilir veya Excel/CSV dosyası içe aktarabilirsiniz.
 </p>
 {onAddStudent && (
 <Button onClick={onAddStudent}>
 <UserPlus className="mr-2 h-4 w-4" />
 İlk Öğrenciyi Ekle
 </Button>
 )}
 </div>
 );
}
