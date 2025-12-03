
/**
 * AI Floating Assistant
 * Contextual AI assistant that appears on every page with page-specific actions
 * All AI features are accessible through this single floating icon
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, X, Sparkles, MessageSquare, FileText, TrendingUp, 
  Users, AlertTriangle, Target, Mail, Shield, Calendar,
  ChevronRight, Loader2, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { Separator } from '@/components/atoms/Separator';
import { useAIContext } from '@/lib/contexts/ai-context';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

import AIInterventionModal from './modals/AIInterventionModal';
import AIReportModal from './modals/AIReportModal';
import AIParentCommModal from './modals/AIParentCommModal';
import AIRiskAnalysisModal from './modals/AIRiskAnalysisModal';
import AIChatModal from './modals/AIChatModal';

export interface AIAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  onClick: () => void;
  disabled?: boolean;
  modalType?: 'intervention' | 'report' | 'parent-comm' | 'risk' | 'chat' | 'navigate';
}

export default function AIFloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const location = useLocation();
  const { user } = useAuth();
  const { contextActions, generalActions, currentContext, studentContext } = useAIContext();

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const handleActionClick = useCallback((action: AIAction) => {
    if (action.modalType && action.modalType !== 'navigate') {
      setActiveModal(action.modalType);
    } else {
      action.onClick();
      setIsOpen(false);
    }
  }, []);

  const isAuthPage = ['/login', '/register', '/forgot-password', '/okul-sec'].includes(location.pathname);
  const isPublicSurvey = location.pathname.startsWith('/anket/');
  
  if (isAuthPage || isPublicSurvey || !user) {
    return null;
  }

  const allActions = [...contextActions, ...generalActions];

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl",
            "bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
            "border-2 border-white/20 backdrop-blur-sm",
            "transition-all duration-300",
            isOpen && "rotate-180"
          )}
          size="icon"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Brain className="h-6 w-6 text-white" />
          )}
        </Button>

        {/* Pulse Animation when closed */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-purple-500/30 pointer-events-none"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Action count badge */}
        {!isOpen && contextActions.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-lg"
          >
            {contextActions.length}
          </motion.div>
        )}
      </motion.div>

      {/* AI Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="rounded-2xl border-2 border-purple-200 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">AI Asistan</h3>
                      <p className="text-xs text-white/80">{currentContext}</p>
                    </div>
                    {studentContext && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {studentContext.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions List */}
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-3">
                    {contextActions.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-200" />
                          <span className="text-xs font-medium text-purple-600">
                            Bu Sayfa İçin
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-200" />
                        </div>

                        {contextActions.map((action) => (
                          <ActionCard 
                            key={action.id} 
                            action={action} 
                            onClick={() => handleActionClick(action)}
                          />
                        ))}
                      </>
                    )}

                    {generalActions.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200" />
                          <span className="text-xs font-medium text-blue-600">
                            Genel İşlemler
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200" />
                        </div>

                        {generalActions.map((action) => (
                          <ActionCard 
                            key={action.id} 
                            action={action}
                            onClick={() => handleActionClick(action)}
                          />
                        ))}
                      </>
                    )}

                    {allActions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Bu sayfa için AI özelliği mevcut değil</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-t">
                  <p className="text-xs text-center text-muted-foreground">
                    Yapay zeka destekli öneriler ve analizler
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AIInterventionModal 
        isOpen={activeModal === 'intervention'} 
        onClose={closeModal}
        studentId={studentContext?.id}
        studentName={studentContext?.name}
      />
      
      <AIReportModal 
        isOpen={activeModal === 'report'} 
        onClose={closeModal}
        studentId={studentContext?.id}
        studentName={studentContext?.name}
      />
      
      <AIParentCommModal 
        isOpen={activeModal === 'parent-comm'} 
        onClose={closeModal}
        studentId={studentContext?.id}
        studentName={studentContext?.name}
      />
      
      <AIRiskAnalysisModal 
        isOpen={activeModal === 'risk'} 
        onClose={closeModal}
        studentId={studentContext?.id}
        studentName={studentContext?.name}
      />

      <AIChatModal
        isOpen={activeModal === 'chat'}
        onClose={closeModal}
        studentId={studentContext?.id}
        studentName={studentContext?.name}
      />
    </>
  );
}

function ActionCard({ action, onClick }: { action: AIAction; onClick: () => void }) {
  const Icon = action.icon;

  return (
    <button
      onClick={onClick}
      disabled={action.disabled}
      className={cn(
        "w-full p-3 rounded-lg border-2 transition-all text-left group",
        "hover:border-purple-300 hover:shadow-md hover:scale-[1.02]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        "bg-gradient-to-br from-white to-purple-50/30",
        "dark:from-slate-800 dark:to-purple-950/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
          <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{action.label}</h4>
            {action.badge && (
              <Badge variant={action.badgeVariant || 'secondary'} className="text-xs">
                {action.badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {action.description}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors mt-1" />
      </div>
    </button>
  );
}
