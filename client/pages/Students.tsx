import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/organisms/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/organisms/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/organisms/DropdownMenu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/organisms/Pagination';
import {
  Upload,
  Download,
  UserPlus,
  FileSpreadsheet,
  FileText,
  Users,
  Search,
  Filter,
  Grid3x3,
  List,
  Sparkles,
  TrendingUp,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Student, upsertStudent } from '@/lib/storage';
import { apiClient } from '@/lib/api/core/client';
import { STUDENT_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type { ApiResponse } from '@/lib/types/api-types';

import { useStudents } from '@/hooks/queries/students.query-hooks';
import { useStudentStats } from '@/hooks/utils/student-stats.utils';
import { useStudentFilters } from '@/hooks/state/student-filters.state';
import { usePagination } from '@/hooks/utils/pagination.utils';
import { exportToCSV, exportToPDF, exportToExcel } from '@/lib/utils/exporters/student-export';

import { StatsCards } from '@/components/features/students/StatsCards';
import { AdvancedFilters } from '@/components/features/students/AdvancedFilters';
import { BulkActions } from '@/components/features/students/BulkActions';
import { EnhancedStudentTable, type SortColumn, type SortDirection } from '@/components/features/students/EnhancedStudentTable';
import { TableControls, type ColumnVisibility } from '@/components/features/students/TableControls';
import { StudentDrawer } from '@/components/features/students/StudentDrawer';
import { StudentCard } from '@/components/features/students/StudentCard';
import { EmptyState } from '@/components/features/students/EmptyState';
import { TableSkeleton } from '@/components/features/students/TableSkeleton';
import { parseImportedRows, mergeStudents, sortStudents } from '@/lib/utils/student-helpers';

export default function Students() {
  const { students, isLoading, invalidate } = useStudents();
  const [isMobileView, setIsMobileView] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [confirmationName, setConfirmationName] = useState('');

  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [sortColumn, setSortColumn] = useState<SortColumn | null>('class');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    id: true,
    fullName: true,
    class: true,
    gender: true,
    risk: true,
    actions: true,
  });

  const stats = useStudentStats(students);
  const filters = useStudentFilters(students);

  const availableClasses = useMemo(() => {
    const classes = students
      .map((student) => student.class)
      .filter((className): className is string => !!className && className.trim() !== '');
    const uniqueClasses = Array.from(new Set(classes));
    return uniqueClasses.sort((a, b) => {
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.localeCompare(b, 'tr');
    });
  }, [students]);

  const sortedStudents = sortStudents(
    filters.filteredStudents,
    sortColumn,
    sortDirection
  );

  const pagination = usePagination(sortedStudents, 25);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Student>({
    defaultValues: {
      id: '',
      name: '',
      surname: '',
      class: '9/A',
      gender: 'K',
      enrollmentDate: new Date().toISOString(),
    },
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const onCreate = async (data: Student) => {
    const id = (data.id || '').trim();
    if (!id) {
      toast.error('Öğrenci numarası zorunludur.');
      return;
    }
    if (!/^\d+$/.test(id)) {
      toast.error('Öğrenci numarası sadece rakamlardan oluşmalıdır.');
      return;
    }
    if (students.some((s) => s.id === id)) {
      toast.error('Bu öğrenci numarası zaten kayıtlı.');
      return;
    }

    const newStudent = { ...data, id, enrollmentDate: new Date().toISOString() };

    try {
      await upsertStudent(newStudent);
      invalidate();
      reset();
      setOpen(false);
      toast.success('Öğrenci başarıyla eklendi.');
    } catch (error) {
      toast.error('Öğrenci kaydedilemedi. Lütfen tekrar deneyin.');
      console.error('Failed to save student:', error);
    }
  };

  const onEditClick = (student: Student) => {
    setStudentToEdit(student);
    setValue('id', student.id);
    setValue('name', student.name);
    setValue('surname', student.surname);
    setValue('class', student.class);
    setValue('gender', student.gender);
    setEditOpen(true);
  };

  const onUpdate = async (data: Student) => {
    if (!studentToEdit) return;

    const id = (data.id || '').trim();
    if (!id) {
      toast.error('Öğrenci numarası zorunludur.');
      return;
    }
    if (!/^\d+$/.test(id)) {
      toast.error('Öğrenci numarası sadece rakamlardan oluşmalıdır.');
      return;
    }
    if (id !== studentToEdit.id && students.some((s) => s.id === id)) {
      toast.error('Bu öğrenci numarası zaten kayıtlı.');
      return;
    }

    const updatedStudent = { ...studentToEdit, ...data, id };

    try {
      await upsertStudent(updatedStudent);
      invalidate();
      reset();
      setEditOpen(false);
      setStudentToEdit(null);
      toast.success('Öğrenci başarıyla güncellendi.');
    } catch (error) {
      toast.error('Öğrenci güncellenemedi. Lütfen tekrar deneyin.');
      console.error('Failed to update student:', error);
    }
  };

  const onDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setConfirmationName('');
    setDeleteDialogOpen(true);
  };

  const onDeleteConfirm = async () => {
    if (!studentToDelete) return;

    const expectedName = `${studentToDelete.name} ${studentToDelete.surname}`.trim();
    if (confirmationName.trim() !== expectedName) {
      toast.error('Öğrencinin tam adını doğru yazmalısınız!');
      return;
    }

    try {
      const response = await fetchWithSchool(STUDENT_ENDPOINTS.BY_ID(studentToDelete.id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationName: expectedName }),
      });

      const result = await response.json();

      if (result.success) {
        invalidate();
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
        setConfirmationName('');
        toast.success(`${expectedName} başarıyla silindi.`);
      } else {
        toast.error(result.error || 'Silme işlemi başarısız oldu.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Silme işlemi sırasında hata oluştu.');
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedStudentIds);
    try {
      for (const id of idsToDelete) {
        await fetchWithSchool(STUDENT_ENDPOINTS.BY_ID(id), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
      }
      invalidate();
      setSelectedStudentIds(new Set());
      toast.success(`${idsToDelete.length} öğrenci silindi.`);
    } catch (error) {
      toast.error('Toplu silme işlemi başarısız oldu.');
      console.error('Bulk delete error:', error);
    }
  };

  const handleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedStudentIds(
        new Set(pagination.paginatedItems.map((s) => s.id))
      );
    } else {
      setSelectedStudentIds(new Set());
    }
  }, [pagination.paginatedItems]);

  const handleSelectOne = useCallback((id: string, selected: boolean) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const handleColumnVisibilityChange = useCallback((column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({ ...prev, [column]: !prev[column] }));
  }, []);

  const handleRowClick = useCallback((student: Student) => {
    setDrawerStudent(student);
    setDrawerOpen(true);
  }, []);

  const importSheet = async (file: File) => {
    try {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Dosya boyutu çok büyük. Maksimum 5MB dosya yükleyebilirsiniz.');
        return;
      }

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
        toast.error(
          'Desteklenmeyen dosya formatı. Sadece Excel (.xlsx, .xls) ve CSV (.csv) dosyaları desteklenmektedir.'
        );
        return;
      }

      const isCsv = ext === 'csv';
      let data: ArrayBuffer | Uint8Array;

      if (isCsv) {
        const buffer = await file.arrayBuffer();
        let decodedText: string;
        try {
          decodedText = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
        } catch (utfError) {
          decodedText = new TextDecoder('windows-1254').decode(buffer);
        }
        data = new TextEncoder().encode(decodedText);
      } else {
        data = await file.arrayBuffer();
      }

      const wb = XLSX.read(data, { type: 'array', codepage: 65001 });
      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        toast.error('Dosyada geçerli bir sayfa bulunamadı.');
        return;
      }

      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as unknown[][];

      if (!rows.length) {
        toast.error('Dosya boş veya geçerli veri içermiyor.');
        return;
      }

      if (rows.length > 10000) {
        toast.error('Dosyada çok fazla satır var. Maksimum 10.000 satır desteklenmektedir.');
        return;
      }

      const imported = parseImportedRows(rows);

      if (!imported.length) {
        toast.error('Dosyadan hiçbir geçerli öğrenci verisi bulunamadı.');
        return;
      }

      const updatedStudents = mergeStudents(students, imported);

      try {
        const response = await apiClient.post<ApiResponse>(
          STUDENT_ENDPOINTS.BULK,
          updatedStudents,
          {
            showSuccessToast: true,
            successMessage: `${imported.length} öğrenci başarıyla içe aktarıldı.`,
            showErrorToast: true,
          }
        );

        if (response.success) {
          toast.success(`${imported.length} öğrenci başarıyla içe aktarıldı.`);
        }

        invalidate();
      } catch (error) {
        console.error('Backend save error:', error);
        toast.error('Öğrenciler kaydedilirken hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('File import error:', error);
      toast.error('Dosya içe aktarılırken hata oluştu. Lütfen dosya formatını kontrol edin.');
    }
  };

  const statsCardsData = [
    {
      title: "Toplam Öğrenci",
      value: stats.total,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      description: "Kayıtlı öğrenci",
      change: "+5%"
    },
    {
      title: "Erkek Öğrenci",
      value: stats.male,
      icon: UserCheck,
      gradient: "from-blue-500 to-cyan-600",
      description: "Erkek kayıt",
      change: `${stats.male}/${stats.total}`
    },
    {
      title: "Risk Altında",
      value: stats.highRisk,
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-600",
      description: "Yüksek risk",
      change: "-3%"
    },
    {
      title: "Başarı Oranı",
      value: `%${Math.round(((stats.total - stats.highRisk) / stats.total) * 100 || 0)}`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      description: "Genel başarı",
      change: "+8%"
    },
  ];

  return (
    <div className="w-full min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-700 p-5 md:p-6 shadow-xl"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl flex items-center justify-between">
          <div className="flex-1">
            <Badge className="mb-2 bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Öğrenci Yönetim Sistemi
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
              Öğrenci Yönetimi
            </h1>
            <p className="text-sm md:text-base text-white/90 mb-4 max-w-xl leading-relaxed">
              Tüm öğrenci kayıtlarını görüntüleyin, yönetin ve analiz edin.
            </p>
            <div className="flex flex-wrap gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="default" className="bg-white text-blue-600 hover:bg-white/90 shadow-lg">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Yeni Öğrenci Ekle
                </Button>
              </DialogTrigger>
              <StudentFormDialog
                onSubmit={handleSubmit(onCreate)}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                title="Yeni Öğrenci Ekle"
                submitText="Kaydet"
              />
            </Dialog>

            <label className="inline-flex items-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => e.target.files && importSheet(e.target.files[0])}
              />
              <Button variant="outline" size="default" className="border-white/50 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  İçe Aktar
                </span>
              </Button>
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="border-white/50 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm">
                  <Download className="mr-2 h-4 w-4" />
                  Dışa Aktar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Dışa Aktarma Formatı</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    exportToCSV(
                      selectedStudentIds.size > 0
                        ? students.filter((s) => selectedStudentIds.has(s.id))
                        : filters.filteredStudents
                    )
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  CSV Dosyası
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    exportToExcel(
                      selectedStudentIds.size > 0
                        ? students.filter((s) => selectedStudentIds.has(s.id))
                        : filters.filteredStudents
                    )
                  }
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel Dosyası
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    exportToPDF(
                      selectedStudentIds.size > 0
                        ? students.filter((s) => selectedStudentIds.has(s.id))
                        : filters.filteredStudents
                    )
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF Dosyası
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>

          <motion.div
            className="hidden md:block opacity-30"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Users className="h-20 w-20 text-white" />
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {statsCardsData.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -3, scale: 1.01 }}
          >
            <Card className="relative overflow-hidden border hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 hover:opacity-5 transition-opacity`}></div>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between mb-2 md:mb-3">
                  <div className={`p-2 md:p-2.5 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md`}>
                    <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0.5">
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-4 md:mb-6 sticky top-0 z-10"
      >
        <Card className="border backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 shadow-lg">
          <CardHeader className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Filter className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <span className="truncate">Filtreler ve Arama</span>
                </CardTitle>
                <CardDescription className="text-xs md:text-sm hidden sm:block">Öğrencileri hızlıca bulun ve filtreleyin</CardDescription>
              </div>
              <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 md:h-9 px-2 md:px-3"
                >
                  <Grid3x3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="ml-1.5 hidden md:inline text-xs">Grid</span>
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8 md:h-9 px-2 md:px-3"
                >
                  <List className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="ml-1.5 hidden md:inline text-xs">Tablo</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <AdvancedFilters
                searchQuery={filters.filters.searchQuery}
                onSearchChange={filters.setSearchQuery}
                selectedClass={filters.filters.selectedClass}
                onClassChange={filters.setSelectedClass}
                selectedGender={filters.filters.selectedGender}
                onGenderChange={filters.setSelectedGender}
                selectedRisk={filters.filters.selectedRisk}
                onRiskChange={filters.setSelectedRisk}
                onResetFilters={filters.resetFilters}
                hasActiveFilters={filters.hasActiveFilters}
                activeFilterCount={filters.activeFilterCount}
                availableClasses={availableClasses}
              />
              {!isMobileView && (
                <TableControls
                  columnVisibility={columnVisibility}
                  onColumnVisibilityChange={handleColumnVisibilityChange}
                  pageSize={pagination.pageSize}
                  onPageSizeChange={pagination.setPageSize}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <BulkActions
        selectedCount={selectedStudentIds.size}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedStudentIds(new Set())}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {isLoading ? (
          <TableSkeleton />
        ) : students.length === 0 ? (
          <EmptyState variant="no-students" onAddStudent={() => setOpen(true)} />
        ) : filters.filteredStudents.length === 0 ? (
          <EmptyState variant="no-results" onClearFilters={filters.resetFilters} />
        ) : (
          <>
            {viewMode === 'grid' || isMobileView ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.03 }}
              >
                {pagination.paginatedItems.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.03,
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                  >
                    <StudentCard
                      student={student}
                      isSelected={selectedStudentIds.has(student.id)}
                      onSelect={(selected) => handleSelectOne(student.id, selected)}
                      onEdit={onEditClick}
                      onDelete={onDeleteClick}
                      onView={handleRowClick}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="rounded-xl border border-border/40 overflow-hidden shadow-sm bg-card/50 backdrop-blur-sm">
                <EnhancedStudentTable
                  students={pagination.paginatedItems}
                  selectedIds={selectedStudentIds}
                  onSelectAll={handleSelectAll}
                  onSelectOne={handleSelectOne}
                  onEdit={onEditClick}
                  onDelete={onDeleteClick}
                  onRowClick={handleRowClick}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  columnVisibility={columnVisibility}
                />
              </div>
            )}

            {pagination.totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/40"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal">
                    {pagination.startIndex + 1}-{pagination.endIndex}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    / {pagination.totalItems} öğrenci
                  </span>
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={pagination.previousPage}
                        className={
                          !pagination.canGoPrevious
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer hover:bg-primary/10 transition-colors'
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => pagination.setPage(pageNum)}
                            isActive={pageNum === pagination.currentPage}
                            className={`cursor-pointer transition-all ${
                              pageNum === pagination.currentPage 
                                ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                                : 'hover:bg-primary/10'
                            }`}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={pagination.nextPage}
                        className={
                          !pagination.canGoNext
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer hover:bg-primary/10 transition-colors'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <StudentFormDialog
          onSubmit={handleSubmit(onUpdate)}
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          title="Öğrenci Düzenle"
          submitText="Değişiklikleri Kaydet"
          onCancel={() => {
            setEditOpen(false);
            setStudentToEdit(null);
            reset();
          }}
        />
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-red-600 flex items-center gap-2">
              Öğrenci Silme Onayı
            </DialogTitle>
            <DialogDescription className="sr-only">Öğrenci silme işlemini onaylamak için öğrencinin tam adını yazın</DialogDescription>
          </DialogHeader>
          {studentToDelete && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">
                  {studentToDelete.name} {studentToDelete.surname}
                </strong>{' '}
                öğrencisini kalıcı olarak silmek istediğinizden emin misiniz?
              </p>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-semibold mb-1">
                  Bu işlem geri alınamaz!
                </p>
                <p className="text-xs text-red-700">
                  Tüm akademik kayıtlar, notlar ve ilerleme verileri kalıcı olarak silinecektir.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Silme işlemini onaylamak için öğrencinin tam adını yazın:
                </label>
                <Input
                  value={confirmationName}
                  onChange={(e) => setConfirmationName(e.target.value)}
                  placeholder={`${studentToDelete.name} ${studentToDelete.surname}`}
                  className="border-red-300 focus:border-red-500"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={onDeleteConfirm}
              disabled={!confirmationName.trim()}
              className="w-full sm:w-auto"
            >
              Kalıcı Olarak Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StudentDrawer
        student={drawerStudent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={onEditClick}
      />
    </div>
  );
}

function StudentFormDialog({
  onSubmit,
  register,
  setValue,
  watch,
  errors,
  title,
  submitText,
  onCancel,
}: {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  register: any;
  setValue: any;
  watch: any;
  errors: any;
  title: string;
  submitText: string;
  onCancel?: () => void;
}) {
  return (
    <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">{title}</DialogTitle>
        <DialogDescription className="sr-only">{title} formu</DialogDescription>
      </DialogHeader>
      <form
        id="student-form"
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Öğrenci No</label>
          <Input
            placeholder="12345"
            inputMode="numeric"
            type="text"
            {...register('id', {
              required: 'Öğrenci numarası zorunludur',
              pattern: {
                value: /^\d+$/,
                message: 'Öğrenci numarası sadece rakamlardan oluşmalıdır',
              },
            })}
          />
          {errors.id && <p className="text-xs text-red-600">{errors.id.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Ad</label>
          <Input
            placeholder="Ahmet"
            {...register('name', { required: 'Ad zorunludur' })}
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Soyad</label>
          <Input
            placeholder="Yılmaz"
            {...register('surname', { required: 'Soyad zorunludur' })}
          />
          {errors.surname && <p className="text-xs text-red-600">{errors.surname.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Sınıf</label>
          <Input placeholder="9/A" {...register('class')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Cinsiyet</label>
          <Select
            onValueChange={(v) => setValue('gender', v as 'K' | 'E')}
            value={watch('gender')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="K">Kız</SelectItem>
              <SelectItem value="E">Erkek</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register('gender')} />
        </div>
      </form>
      <DialogFooter className="flex-col sm:flex-row gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            İptal
          </Button>
        )}
        <Button form="student-form" type="submit" className="w-full sm:w-auto">
          {submitText}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
