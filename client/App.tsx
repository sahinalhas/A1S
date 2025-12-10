import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/atoms/Toaster";
import { Toaster as Sonner } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, PrivateRoute } from "@/lib/auth-context";
import { AIContextProvider } from "@/lib/contexts/ai-context";
import { TooltipProvider } from "@/components/organisms/Tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/features/common/ErrorBoundary";
import { setupGlobalErrorHandlers } from "./lib/error-handler";
import { usePrefetchRoutes } from "./hooks/usePrefetchRoutes";
import { Loader2 } from "lucide-react";
import Layout from "./layout/Rehber360Layout";
import Index from "./pages/Index";
import Students from "./pages/Students";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import SchoolSelection from "./pages/SchoolSelection";
import AIFloatingAssistant from "@/components/features/ai/AIFloatingAssistant";
import { queryClient } from "@/lib/query-client";

const StudentProfile = lazy(() => import("@/pages/StudentProfile/StudentProfile"));
const CounselingSessions = lazy(() => import("@/pages/CounselingSessions"));
const Surveys = lazy(() => import("@/pages/Surveys"));
const Reports = lazy(() => import("@/pages/Reports"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
const PublicSurvey = lazy(() => import("@/pages/PublicSurvey"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AIToolsPage = lazy(() => import("@/pages/AIToolsPage"));
const AdvancedStudentAnalysis = lazy(() => import("@/pages/AdvancedStudentAnalysis"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const ContentManagement = lazy(() => import("@/pages/ContentManagement"));
const InterventionTracking = lazy(() => import("@/pages/InterventionTracking"));
const ParentAccess = lazy(() => import("@/pages/ParentAccess"));
const SchoolDashboard = lazy(() => import("@/pages/SchoolDashboard"));
const BackupManagement = lazy(() => import("@/pages/BackupManagement"));
const ExamManagementPage = lazy(() => import("@/pages/ExamManagementPage"));

function PrefetchWrapper() {
  usePrefetchRoutes();
  return null;
}

const App = () => {
  useEffect(() => {
    const cleanup = setupGlobalErrorHandlers();
    return cleanup;
  }, []);

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 text-muted-foreground" />
    </div>
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <AIContextProvider>
                  <AIFloatingAssistant />
                  <PrefetchWrapper />
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/okul-sec" element={<SchoolSelection />} />
                    <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                      <Route path="/" element={<Index />} />
                      <Route path="/ogrenci" element={<Students />} />
                      <Route path="/ogrenci/:id" element={<Suspense fallback={<LoadingFallback />}><StudentProfile /></Suspense>} />
                      <Route
                        path="/gorusmeler"
                        element={<Suspense fallback={<LoadingFallback />}><CounselingSessions /></Suspense>}
                      />
                      <Route
                        path="/anketler"
                        element={<Suspense fallback={<LoadingFallback />}><Surveys /></Suspense>}
                      />
                      <Route
                        path="/raporlar"
                        element={<Suspense fallback={<LoadingFallback />}><Reports /></Suspense>}
                      />
                      <Route
                        path="/olcme-degerlendirme"
                        element={<Suspense fallback={<LoadingFallback />}><ExamManagementPage /></Suspense>}
                      />
                      <Route path="/ayarlar" element={<Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense>} />
                      <Route
                        path="/icerik-yonetimi"
                        element={<Suspense fallback={<LoadingFallback />}><ContentManagement /></Suspense>}
                      />
                      <Route
                        path="/ai-araclari"
                        element={<Suspense fallback={<LoadingFallback />}><AIToolsPage /></Suspense>}
                      />
                      <Route
                        path="/istatistik"
                        element={<Navigate to="/raporlar" replace />}
                      />
                      <Route
                        path="/risk"
                        element={<Navigate to="/ai-araclari?tab=risk" replace />}
                      />
                      <Route
                        path="/ai-asistan"
                        element={<Navigate to="/ai-araclari?tab=ai-asistan" replace />}
                      />
                      <Route
                        path="/ai-insights"
                        element={<Navigate to="/ai-araclari?tab=ai-insights" replace />}
                      />
                      <Route
                        path="/gunluk-plan"
                        element={<Navigate to="/ai-araclari?tab=gunluk-plan" replace />}
                      />
                      <Route
                        path="/gelismis-analiz"
                        element={<Navigate to="/ai-araclari?tab=gelismis-analiz" replace />}
                      />
                      <Route
                        path="/ogrenci/:studentId/gelismis-analiz"
                        element={<Suspense fallback={<LoadingFallback />}><AdvancedStudentAnalysis /></Suspense>}
                      />
                      <Route
                        path="/bildirimler"
                        element={<Suspense fallback={<LoadingFallback />}><Notifications /></Suspense>}
                      />
                      <Route
                        path="/mudahale-takip"
                        element={<Suspense fallback={<LoadingFallback />}><InterventionTracking /></Suspense>}
                      />
                      <Route
                        path="/veli-erisim"
                        element={<Suspense fallback={<LoadingFallback />}><ParentAccess /></Suspense>}
                      />
                      <Route
                        path="/okul-dashboard"
                        element={<Suspense fallback={<LoadingFallback />}><SchoolDashboard /></Suspense>}
                      />
                      <Route
                        path="/yedekleme"
                        element={<Suspense fallback={<LoadingFallback />}><BackupManagement /></Suspense>}
                      />
                    </Route>
                    <Route path="/anket/:publicLink" element={<Suspense fallback={<LoadingFallback />}><PublicSurvey /></Suspense>} />
                    <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
                  </Routes>
                  <Toaster />
                  <Sonner />
                </AIContextProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;