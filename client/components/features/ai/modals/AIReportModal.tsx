/**
 * AI Report Modal
 * Generates AI-powered reports for students
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/organisms/Dialog';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Textarea } from "@/components/molecules/EnhancedTextarea";
import { 
  FileText, Download, Loader2, ClipboardCheck, Calendar, 
  Sparkles, Copy, Check
} from 'lucide-react';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { toast } from 'sonner';

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
}

type ReportType = 'progress' | 'ram' | 'bep';

export default function AIReportModal({ 
  isOpen, 
  onClose, 
  studentId, 
  studentName 
}: AIReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>('progress');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [referralReason, setReferralReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [copied, setCopied] = useState(false);

  const reportTypes = [
    { value: 'progress', label: 'Dönemsel Gelişim Raporu', icon: Calendar, description: 'Öğrencinin dönem içindeki gelişimini özetler' },
    { value: 'ram', label: 'RAM Sevk Raporu', icon: ClipboardCheck, description: 'Rehberlik Araştırma Merkezi sevk raporu' },
    { value: 'bep', label: 'BEP Raporu', icon: FileText, description: 'Bireyselleştirilmiş Eğitim Programı raporu' }
  ];

  const generateReport = async () => {
    if (!studentId) {
      toast.error('Öğrenci seçilmedi');
      return;
    }

    setLoading(true);
    try {
      let endpoint = '';
      let body: Record<string, string> = {};

      switch (reportType) {
        case 'progress':
          endpoint = `/api/reports/progress/${studentId}`;
          body = { reportType: 'quarterly', reportPeriod: 'Dönem 1' };
          break;
        case 'ram':
          if (!referralReason) {
            toast.error('Sevk nedeni gerekli');
            setLoading(false);
            return;
          }
          endpoint = `/api/reports/ram/${studentId}`;
          body = { referralReason };
          break;
        case 'bep':
          endpoint = `/api/reports/bep/${studentId}`;
          body = { diagnosis };
          break;
      }

      const response = await fetchWithSchool(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      
      if (data.success) {
        setReport(data.data);
        toast.success('Rapor başarıyla hazırlandı');
      } else {
        throw new Error(data.error);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Rapor oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const reportText = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast.success('Rapor panoya kopyalandı');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setReport(null);
    setReferralReason('');
    setDiagnosis('');
    onClose();
  };

  if (!studentId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-white">Otomatik Rapor Oluşturucu</DialogTitle>
              <DialogDescription className="text-white/80">
                {studentName} için AI destekli raporlar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)]">
          <div className="p-6">
            {!report ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Report Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Rapor Tipi</Label>
                  <div className="grid gap-3">
                    {reportTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = reportType === type.value;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setReportType(type.value as ReportType)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                              <Icon className={`h-5 w-5 ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <h4 className="font-medium">{type.label}</h4>
                              <p className="text-xs text-muted-foreground">{type.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional Fields */}
                {reportType === 'ram' && (
                  <div className="space-y-2">
                    <Label>Sevk Nedeni *</Label>
                    <Textarea
                      placeholder="Öğrencinin RAM'a sevk edilme nedenini açıklayın..."
                      value={referralReason}
                      onChange={(e) => setReferralReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {reportType === 'bep' && (
                  <div className="space-y-2">
                    <Label>Tanı (Opsiyonel)</Label>
                    <Textarea
                      placeholder="Varsa öğrencinin tanısını giriniz..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      rows={2}
                    />
                  </div>
                )}

                {/* Generate Button */}
                <Button 
                  onClick={generateReport} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Rapor Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Rapor Oluştur
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Report Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {reportType === 'progress' && 'Gelişim Raporu'}
                    {reportType === 'ram' && 'RAM Sevk Raporu'}
                    {reportType === 'bep' && 'BEP Raporu'}
                  </h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      İndir
                    </Button>
                  </div>
                </div>

                {/* Report Content */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                  {reportType === 'progress' && (
                    <>
                      <div>
                        <h4 className="font-medium mb-2">Yönetici Özeti</h4>
                        <p className="text-sm text-muted-foreground">{report.executiveSummary}</p>
                      </div>
                      {report.academicProgress && (
                        <div>
                          <h4 className="font-medium mb-2">Akademik İlerleme</h4>
                          <p className="text-sm text-muted-foreground mb-2">{report.academicProgress.overview}</p>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="p-2 border rounded bg-green-50 dark:bg-green-950/20">
                              <Label className="text-xs text-green-600">Güçlü Yönler</Label>
                              <ul className="text-xs mt-1 space-y-1">
                                {report.academicProgress.strengths?.map((s: string, i: number) => (
                                  <li key={i}>• {s}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-2 border rounded bg-orange-50 dark:bg-orange-950/20">
                              <Label className="text-xs text-orange-600">Gelişim Alanları</Label>
                              <ul className="text-xs mt-1 space-y-1">
                                {report.academicProgress.areasForImprovement?.map((s: string, i: number) => (
                                  <li key={i}>• {s}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {reportType === 'ram' && (
                    <>
                      <div>
                        <h4 className="font-medium mb-2">Sevk Nedeni</h4>
                        <p className="text-sm">{report.referralReason}</p>
                      </div>
                      {report.currentConcerns && (
                        <div>
                          <h4 className="font-medium mb-2">Mevcut Endişeler</h4>
                          <div className="grid gap-2 md:grid-cols-2">
                            {Object.entries(report.currentConcerns).map(([key, values]) => (
                              <div key={key} className="p-2 border rounded">
                                <Label className="text-xs capitalize">{key}</Label>
                                <ul className="text-xs mt-1 space-y-1">
                                  {(values as string[])?.map((v, i) => (
                                    <li key={i}>• {v}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {reportType === 'bep' && (
                    <>
                      {report.studentProfile && (
                        <div>
                          <h4 className="font-medium mb-2">Öğrenci Profili</h4>
                          {report.studentProfile.diagnosis && (
                            <p className="text-sm mb-1"><strong>Tanı:</strong> {report.studentProfile.diagnosis}</p>
                          )}
                          <p className="text-sm"><strong>Öğrenme Stili:</strong> {report.studentProfile.learningStyle}</p>
                        </div>
                      )}
                      {report.annualGoals && (
                        <div>
                          <h4 className="font-medium mb-2">Yıllık Hedefler</h4>
                          <div className="space-y-2">
                            {report.annualGoals.map((goal: any, i: number) => (
                              <div key={i} className="p-2 border rounded">
                                <p className="text-sm font-medium">{goal.goal}</p>
                                <p className="text-xs text-muted-foreground">{goal.measurableCriteria}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setReport(null)}>
                    Yeni Rapor
                  </Button>
                  <Button onClick={handleClose}>
                    Kapat
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
