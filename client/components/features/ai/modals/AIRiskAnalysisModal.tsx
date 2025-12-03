/**
 * AI Risk Analysis Modal
 * Analyzes student risk factors using AI
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { Progress } from '@/components/atoms/Progress';
import { 
  AlertTriangle, Shield, Loader2, Sparkles, 
  TrendingUp, TrendingDown, Minus, CheckCircle2,
  AlertCircle, Info
} from 'lucide-react';
import { apiClient } from '@/lib/api/core/client';
import { AI_ENDPOINTS } from '@/lib/constants/api-endpoints';
import { toast } from 'sonner';

interface AIRiskAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
}

interface RiskAnalysis {
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  categories: {
    category: string;
    level: 'low' | 'medium' | 'high';
    score: number;
    factors: string[];
  }[];
  recommendations: string[];
  protectiveFactors: string[];
  warningSignals: string[];
}

export default function AIRiskAnalysisModal({ 
  isOpen, 
  onClose, 
  studentId, 
  studentName 
}: AIRiskAnalysisModalProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);

  const analyzeRisk = async () => {
    if (!studentId) {
      toast.error('Öğrenci seçilmedi');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<{ success: boolean; data: RiskAnalysis }>(
        AI_ENDPOINTS.ANALYZE_RISK,
        { studentId }
      );
      
      if (response.success) {
        setAnalysis(response.data);
        toast.success('Risk analizi tamamlandı');
      } else {
        throw new Error('Analiz yapılamadı');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Risk analizi başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnalysis(null);
    onClose();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Kritik';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return level;
    }
  };

  const getRiskBadgeVariant = (level: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (level) {
      case 'critical':
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (!studentId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-white">AI Risk Analizi</DialogTitle>
              <DialogDescription className="text-white/80">
                {studentName} için kapsamlı risk değerlendirmesi
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)]">
          <div className="p-6">
            {!analysis ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Risk Analizi Başlat</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {studentName} için tüm veriler (akademik, davranışsal, sosyal) analiz edilerek 
                  kapsamlı bir risk değerlendirmesi yapılacaktır.
                </p>
                <div className="flex flex-col items-center gap-3">
                  <Button 
                    onClick={analyzeRisk} 
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-600 to-red-600"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analiz Yapılıyor...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Analizi Başlat
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Analiz süresi verilerin boyutuna göre değişebilir
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Overall Risk Score */}
                <div className={`p-6 rounded-xl border-2 ${
                  analysis.overallRiskLevel === 'critical' || analysis.overallRiskLevel === 'high' 
                    ? 'border-red-200 bg-red-50' 
                    : analysis.overallRiskLevel === 'medium' 
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-green-200 bg-green-50'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${getRiskColor(analysis.overallRiskLevel)}`}>
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Genel Risk Seviyesi</h3>
                        <Badge variant={getRiskBadgeVariant(analysis.overallRiskLevel)}>
                          {getRiskLabel(analysis.overallRiskLevel)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold">{analysis.riskScore}</span>
                      <span className="text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <Progress value={analysis.riskScore} className="h-3" />
                </div>

                {/* Risk Categories */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Risk Kategorileri
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {analysis.categories?.map((cat, idx) => (
                      <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{cat.category}</span>
                          <Badge variant={getRiskBadgeVariant(cat.level)} className="text-xs">
                            {getRiskLabel(cat.level)}
                          </Badge>
                        </div>
                        <Progress value={cat.score} className="h-2 mb-2" />
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {cat.factors?.slice(0, 2).map((factor, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <Minus className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning Signals */}
                {analysis.warningSignals && analysis.warningSignals.length > 0 && (
                  <div className="p-4 rounded-lg border border-red-200 bg-red-50">
                    <h4 className="font-medium flex items-center gap-2 mb-3 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      Uyarı Sinyalleri
                    </h4>
                    <ul className="space-y-2">
                      {analysis.warningSignals.map((signal, i) => (
                        <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Protective Factors */}
                {analysis.protectiveFactors && analysis.protectiveFactors.length > 0 && (
                  <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                    <h4 className="font-medium flex items-center gap-2 mb-3 text-green-700">
                      <Shield className="h-4 w-4" />
                      Koruyucu Faktörler
                    </h4>
                    <ul className="space-y-2">
                      {analysis.protectiveFactors.map((factor, i) => (
                        <li key={i} className="text-sm text-green-600 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <h4 className="font-medium flex items-center gap-2 mb-3 text-blue-700">
                      <Info className="h-4 w-4" />
                      Öneriler
                    </h4>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-blue-600 flex items-start gap-2">
                          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setAnalysis(null)}>
                    Yeniden Analiz
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
