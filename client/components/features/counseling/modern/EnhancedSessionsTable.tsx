import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/organisms/DropdownMenu';
import { Download, Eye, Columns, ArrowUpDown, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import type { CounselingSession, CounselingTopic, CompleteSessionFormValues } from '../types';
import { SESSION_MODE_LABELS, SESSION_LOCATION_LABELS, DISCIPLINE_STATUS_LABELS } from '@shared/constants/common.constants';
import { generateSessionCompletionPDF } from '../utils/sessionCompletionPDF';
import { useToast } from '@/hooks/utils/toast.utils';
import { useSettings } from '@/hooks/queries/settings.query-hooks';
import { useAuth } from '@/lib/auth-context';

type SortField = 'date' | 'time' | 'student' | 'type';
type SortDirection = 'asc' | 'desc';

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

interface EnhancedSessionsTableProps {
  sessions: CounselingSession[];
  topics: CounselingTopic[];
  onExport: () => void;
  onSelectSession: (session: CounselingSession) => void;
}

export default function EnhancedSessionsTable({ 
  sessions,
  topics,
  onExport,
  onSelectSession 
}: EnhancedSessionsTableProps) {
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const { user, selectedSchool } = useAuth();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [columns, setColumns] = useState<Column[]>([
    { key: 'sessionNumber', label: '#', visible: true },
    { key: 'date', label: 'Tarih', visible: true },
    { key: 'time', label: 'Saat', visible: true },
    { key: 'student', label: 'Öğrenci/Grup', visible: true },
    { key: 'type', label: 'Tip', visible: true },
    { key: 'topic1', label: 'RPD Hizmet Türü', visible: true },
    { key: 'topic2', label: '1. Aşama', visible: true },
    { key: 'topic3', label: '2. Aşama', visible: true },
    { key: 'topic', label: 'Konu', visible: true },
    { key: 'mode', label: 'Çalışma Yöntemi', visible: true },
    { key: 'location', label: 'Görüşme Yeri', visible: true },
    { key: 'discipline', label: 'Disiplin/Davranış', visible: true },
    { key: 'notes', label: 'Açıklama', visible: false },
    { key: 'actions', label: 'İşlemler', visible: true },
  ]);

  const toggleColumn = (key: string) => {
    setColumns(cols =>
      cols.map(col =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const topicsMap = useMemo(() => {
    const map = new Map<string, CounselingTopic>();
    topics.forEach(topic => {
      map.set(topic.title, topic);
      map.set(topic.id, topic);
    });
    return map;
  }, [topics]);

  // Calculate session numbers for each student
  const sessionNumbersMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();

    // Group sessions by student and sort by date
    const studentSessions = new Map<string, CounselingSession[]>();
    sessions.forEach(session => {
      if (session.sessionType === 'individual' && session.student?.id) {
        const studentId = session.student.id;
        if (!studentSessions.has(studentId)) {
          studentSessions.set(studentId, []);
        }
        studentSessions.get(studentId)!.push(session);
      }
    });

    // Sort each student's sessions by date and assign numbers
    studentSessions.forEach((studentSessionList, studentId) => {
      const sorted = [...studentSessionList].sort((a, b) => {
        const dateComparison = new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
        if (dateComparison !== 0) return dateComparison;
        return a.entryTime.localeCompare(b.entryTime);
      });

      const sessionMap = new Map<string, number>();
      sorted.forEach((session, index) => {
        sessionMap.set(session.id, index + 1);
      });
      map.set(studentId, sessionMap);
    });

    return map;
  }, [sessions]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
          break;
        case 'time':
          comparison = a.entryTime.localeCompare(b.entryTime);
          break;
        case 'student': {
          const nameA = a.sessionType === 'individual' ? a.student?.name || '' : a.groupName || '';
          const nameB = b.sessionType === 'individual' ? b.student?.name || '' : b.groupName || '';
          comparison = nameA.localeCompare(nameB, 'tr');
          break;
        }
        case 'type':
          comparison = a.sessionType.localeCompare(b.sessionType);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [sessions, sortField, sortDirection]);

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1"
    >
      {label}
      {sortField === field && (
        sortDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      )}
      {sortField !== field && <ArrowUpDown className="h-3 w-3 opacity-40" />}
    </button>
  );

  const getTopicHierarchy = (topicIdOrTitle: string | undefined) => {
    if (!topicIdOrTitle) {
      return ['Konu belirtilmedi'];
    }
    const topic = topicsMap.get(topicIdOrTitle);
    if (!topic || !topic.fullPath) {
      return [topicIdOrTitle];
    }
    return topic.fullPath.split('>').map(s => s.trim());
  };

  const visibleColumnCount = columns.filter(c => c.visible).length;

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Eye className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Henüz kayıt bulunmuyor</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle>Görüşme Kayıtları</CardTitle>
            <CardDescription>{sessions.length} görüşme bulundu</CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Columns className="h-4 w-4" />
                  Kolonlar
                  <Badge variant="secondary" className="ml-1 px-1.5">
                    {visibleColumnCount}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Görünür Kolonlar</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.key}
                    checked={col.visible}
                    onCheckedChange={() => toggleColumn(col.key)}
                    disabled={visibleColumnCount === 1 && col.visible}
                  >
                    {col.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="gap-2" onClick={onExport}>
              <Download className="h-4 w-4" />
              Excel İndir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-sm font-medium text-muted-foreground">
                {columns.find(c => c.key === 'sessionNumber')?.visible && (
                  <th className="text-center px-3 py-3 w-16">
                    #
                  </th>
                )}
                {columns.find(c => c.key === 'date')?.visible && (
                  <th className="text-left px-4 py-3">
                    <SortButton field="date" label="Tarih" />
                  </th>
                )}
                {columns.find(c => c.key === 'time')?.visible && (
                  <th className="text-left px-4 py-3">
                    <SortButton field="time" label="Saat" />
                  </th>
                )}
                {columns.find(c => c.key === 'student')?.visible && (
                  <th className="text-left px-4 py-3">
                    <SortButton field="student" label="Öğrenci/Grup" />
                  </th>
                )}
                {columns.find(c => c.key === 'type')?.visible && (
                  <th className="text-left px-4 py-3">
                    <SortButton field="type" label="Tip" />
                  </th>
                )}
                {columns.find(c => c.key === 'topic1')?.visible && (
                  <th className="text-left px-4 py-3">RPD Hizmet Türü</th>
                )}
                {columns.find(c => c.key === 'topic2')?.visible && (
                  <th className="text-left px-4 py-3">1. Aşama</th>
                )}
                {columns.find(c => c.key === 'topic3')?.visible && (
                  <th className="text-left px-4 py-3">2. Aşama</th>
                )}
                {columns.find(c => c.key === 'topic')?.visible && (
                  <th className="text-left px-4 py-3">Konu</th>
                )}
                {columns.find(c => c.key === 'mode')?.visible && (
                  <th className="text-left px-4 py-3">Çalışma Yöntemi</th>
                )}
                {columns.find(c => c.key === 'location')?.visible && (
                  <th className="text-left px-4 py-3">Görüşme Yeri</th>
                )}
                {columns.find(c => c.key === 'discipline')?.visible && (
                  <th className="text-left px-4 py-3">Disiplin/Davranış</th>
                )}
                {columns.find(c => c.key === 'notes')?.visible && (
                  <th className="text-left px-4 py-3">Açıklama</th>
                )}
                {columns.find(c => c.key === 'actions')?.visible && (
                  <th className="text-center px-4 py-3 w-24">İşlemler</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedSessions.map((session, index) => {
                const studentName = session.sessionType === 'individual' && session.student
                  ? `${session.student.name} ${session.student.surname || ''}`.trim()
                  : session.groupName || 'Grup Görüşmesi';

                const sessionNumber = session.sessionType === 'individual' && session.student?.id
                  ? sessionNumbersMap.get(session.student.id)?.get(session.id) || '-'
                  : '-';

                const handleDownloadPDF = async () => {
                  try {
                    const topic = topicsMap.get(session.topic || '');
                    const topicFullPath = topic?.fullPath;
                    const topicTitle = topic?.title;
                    const schoolName = selectedSchool?.name;
                    
                    const studentData = session.student ? {
                      gender: (session.student as any)?.gender || '-',
                      idNumber: (session.student as any)?.tcIdentityNo,
                      studentNumber: (session.student as any)?.studentNumber || session.student.id,
                      yearEndSuccess: undefined,
                      absenceDays: undefined,
                      familyInfo: undefined,
                      term: undefined,
                      healthInfo: undefined,
                      specialEducationInfo: undefined,
                    } : undefined;
                    
                    const formData = {
                      topic: session.topic || '',
                      exitTime: session.exitTime || '',
                      exitClassHourId: null as unknown as number | null,
                      detailedNotes: session.detailedNotes || session.sessionDetails || null,
                      sessionFlow: session.sessionDetails,
                      studentParticipationLevel: 'orta',
                      cooperationLevel: 3,
                      emotionalState: 'sakin',
                      physicalState: 'normal',
                      communicationQuality: 'iyi',
                      sessionTags: session.sessionTags ? (typeof session.sessionTags === 'string' ? JSON.parse(session.sessionTags) : session.sessionTags) : [],
                      achievedOutcomes: undefined,
                      followUpNeeded: false,
                      followUpPlan: undefined,
                      actionItems: [],
                    } as unknown as CompleteSessionFormValues;
                    
                    const counselorName = settings?.account?.displayName || user?.name;
                    await generateSessionCompletionPDF(session, formData, topicFullPath, schoolName, topicTitle, studentData, counselorName);
                    toast({
                      title: "PDF İndirildi",
                      description: "Görüşme bilgileri formu başarıyla indirildi",
                    });
                  } catch (error) {
                    console.error('PDF generation error:', error);
                    toast({
                      title: "Hata",
                      description: "PDF oluşturulurken bir hata oluştu",
                      variant: "destructive",
                    });
                  }
                };

                return (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b cursor-pointer"
                    onClick={() => onSelectSession(session)}
                  >
                    {columns.find(c => c.key === 'sessionNumber')?.visible && (
                      <td className="px-3 py-3 text-center">
                        <Badge 
                          variant="secondary" 
                          className="text-xs font-semibold px-2 min-w-[2rem]"
                        >
                          {sessionNumber}
                        </Badge>
                      </td>
                    )}
                    {columns.find(c => c.key === 'date')?.visible && (
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {format(new Date(session.sessionDate), 'dd MMM yyyy', { locale: tr })}
                      </td>
                    )}
                    {columns.find(c => c.key === 'time')?.visible && (
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {session.entryTime}{session.exitTime ? ` - ${session.exitTime}` : ''}
                      </td>
                    )}
                    {columns.find(c => c.key === 'student')?.visible && (
                      <td className="px-4 py-3 text-sm font-medium max-w-xs truncate">
                        {studentName}
                      </td>
                    )}
                    {columns.find(c => c.key === 'type')?.visible && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {session.sessionType === 'individual' ? 'Bireysel' : 'Grup'}
                        </Badge>
                      </td>
                    )}
                    {columns.find(c => c.key === 'topic1')?.visible && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getTopicHierarchy(session.topic)[0] && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {getTopicHierarchy(session.topic)[0]}
                          </Badge>
                        )}
                      </td>
                    )}
                    {columns.find(c => c.key === 'topic2')?.visible && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getTopicHierarchy(session.topic)[1] && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {getTopicHierarchy(session.topic)[1]}
                          </Badge>
                        )}
                      </td>
                    )}
                    {columns.find(c => c.key === 'topic3')?.visible && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getTopicHierarchy(session.topic)[2] && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {getTopicHierarchy(session.topic)[2]}
                          </Badge>
                        )}
                      </td>
                    )}
                    {columns.find(c => c.key === 'topic')?.visible && (
                      <td className="px-4 py-3 text-sm">
                        <span className="truncate block max-w-xs">
                          {topicsMap.get(session.topic || '')?.title || session.topic || 'Konu belirtilmedi'}
                        </span>
                      </td>
                    )}
                    {columns.find(c => c.key === 'mode')?.visible && (
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {SESSION_MODE_LABELS[session.sessionMode as keyof typeof SESSION_MODE_LABELS] || session.sessionMode}
                      </td>
                    )}
                    {columns.find(c => c.key === 'location')?.visible && (
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {session.sessionLocation ? (SESSION_LOCATION_LABELS[session.sessionLocation] || session.sessionLocation) : '-'}
                      </td>
                    )}
                    {columns.find(c => c.key === 'discipline')?.visible && (
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {session.disciplineStatus ? (DISCIPLINE_STATUS_LABELS[session.disciplineStatus] || session.disciplineStatus) : '-'}
                      </td>
                    )}
                    {columns.find(c => c.key === 'notes')?.visible && (
                      <td className="px-4 py-3 max-w-md">
                        <p className="text-xs text-muted-foreground truncate">
                          {session.detailedNotes || session.sessionDetails || '-'}
                        </p>
                      </td>
                    )}
                    {columns.find(c => c.key === 'actions')?.visible && (
                      <td 
                        className="px-4 py-3 text-center" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={handleDownloadPDF}
                          title="PDF İndir"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
