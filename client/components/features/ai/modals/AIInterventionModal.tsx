/**
 * AI Intervention Modal
 * Generates AI-powered intervention plans for students
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/organisms/Dialog';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { 
  Target, Clock, Users, CheckCircle2, Loader2, 
  Sparkles, AlertTriangle, ArrowRight
} from 'lucide-react';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { toast } from 'sonner';
import { getPriorityColor, getUrgencyLabel, getPriorityLabel } from '@/lib/ai/ai-utils';

interface AIInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
}

export default function AIInterventionModal({ 
  isOpen, 
  onClose, 
  studentId, 
  studentName 
}: AIInterventionModalProps) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const generatePlan = async () => {
    if (!studentId) {
      toast.error('Öğrenci seçilmedi');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetchWithSchool(`/api/counseling-sessions/interventions/generate-plan/${studentId}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setPlan(data.data);
        toast.success('Müdahale planı başarıyla hazırlandı');
      } else {
        throw new Error(data.error);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Plan oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPlan(null);
    onClose();
  };

  if (!studentId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-white">AI Müdahale Planlayıcı</DialogTitle>
              <DialogDescription className="text-white/80">
                {studentName} için kanıta dayalı müdahale planı
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)]">
          <div className="p-6">
            {!plan ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Müdahale Planı Oluştur</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {studentName} için öğrenci verileri, görüşme notları ve anket sonuçları analiz edilerek 
                  kişiselleştirilmiş bir müdahale planı oluşturulacaktır.
                </p>
                <Button 
                  onClick={generatePlan} 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Plan Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-5 w-5" />
                      Plan Oluştur
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
                {/* Summary Card */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-purple-600" />
                      Genel Değerlendirme
                    </h4>
                    <Badge variant={plan?.urgencyLevel?.toLowerCase() === 'immediate' ? 'destructive' : 'default'}>
                      {getUrgencyLabel(plan?.urgencyLevel)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.overallAssessment}</p>
                </div>

                {/* Tabs for detailed plan */}
                <Tabs defaultValue="recommendations" className="w-full">
                  <TabsList variant="minimal" className="w-full justify-start">
                    <TabsTrigger value="recommendations" variant="minimal">Öneriler</TabsTrigger>
                    <TabsTrigger value="action-plan" variant="minimal">Eylem Planı</TabsTrigger>
                    <TabsTrigger value="monitoring" variant="minimal">İzleme</TabsTrigger>
                  </TabsList>

                  <TabsContent value="recommendations" className="space-y-3 mt-4">
                    {plan.recommendations?.map((rec: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-medium">{rec.title}</h5>
                              <Badge variant={getPriorityColor(rec?.priority)}>
                                {getPriorityLabel(rec?.priority)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                            
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="p-2 bg-muted/50 rounded">
                                <h6 className="text-xs font-medium mb-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Kısa Vadeli
                                </h6>
                                <ul className="text-xs space-y-1 text-muted-foreground">
                                  {rec.strategies?.shortTerm?.slice(0, 3).map((s: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      <span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-2 bg-muted/50 rounded">
                                <h6 className="text-xs font-medium mb-1 flex items-center gap-1">
                                  <Target className="h-3 w-3" /> Uzun Vadeli
                                </h6>
                                <ul className="text-xs space-y-1 text-muted-foreground">
                                  {rec.strategies?.longTerm?.slice(0, 3).map((s: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      <span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="action-plan" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      {[
                        { title: '1. Hafta', items: plan.actionPlan?.week1 },
                        { title: '2-4. Hafta', items: plan.actionPlan?.week2_4 },
                        { title: '2-3. Ay', items: plan.actionPlan?.month2_3 },
                      ].map((period, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <h5 className="font-medium mb-3 text-sm">{period.title}</h5>
                          <ul className="space-y-2">
                            {period.items?.map((action: string, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="monitoring" className="mt-4 space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Başarı Metrikleri</h5>
                      <ul className="space-y-1">
                        {plan.monitoringPlan?.metrics?.map((metric: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Kontrol Noktaları</h5>
                      <ul className="space-y-1">
                        {plan.monitoringPlan?.checkpoints?.map((cp: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Clock className="h-4 w-4 mt-0.5 text-purple-500 flex-shrink-0" />
                            {cp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setPlan(null)}>
                    Yeni Plan
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
