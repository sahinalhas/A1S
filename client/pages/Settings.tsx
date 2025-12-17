import { useState, useMemo, useEffect, useRef, createContext, useContext } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Settings as SettingsIcon, AlertCircle, Sparkles } from "lucide-react";
import { SETTINGS_TABS } from "@/config/tabs";
import { useToast } from "@/hooks/utils/toast.utils";
import { Badge } from "@/components/atoms/Badge";
import {
  loadSettings,
  saveSettings,
  defaultSettings,
} from "@/lib/app-settings";
import { useSearchParams, useLocation } from "react-router-dom";
import GeneralSettingsTab from "@/components/features/settings/GeneralSettingsTab";
import SchoolSettingsTab from "@/components/features/settings/SchoolSettingsTab";
import NotificationsSettingsTab from "@/components/features/settings/NotificationsSettingsTab";
import AISettingsTab from "@/components/features/settings/AISettingsTab";
import SecuritySettingsTab from "@/components/features/settings/SecuritySettingsTab";
import BackupSettingsTab from "@/components/features/settings/BackupSettingsTab";
import { PageHeader } from "@/components/features/common/PageHeader";

// Settings Tab Dirty Context - centralized save management
export const SettingsTabDirtyContext = createContext<{
  registerTabSubmit?: (id: string, callback: () => Promise<void>) => void;
  unregisterTabSubmit?: (id: string) => void;
} | null>(null);

export function useSettingsTabDirty() {
  return useContext(SettingsTabDirtyContext);
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = useMemo(() => {
    const t = searchParams.get("tab") || "genel";
    const allowed = new Set([
      "genel",
      "okullar",
      "bildirim",
      "ai",
      "guvenlik",
      "yedekleme",
    ]);
    return allowed.has(t) ? t : "genel";
  }, [searchParams]);
  const [tab, setTab] = useState<string>(initialTab);

  // Tab submit callbacks - tüm sekmeler submit handler'larını register eder
  const tabSubmitCallbacksRef = useRef<Map<string, () => Promise<void>>>(new Map());

  const registerTabSubmit = (id: string, callback: () => Promise<void>) => {
    tabSubmitCallbacksRef.current.set(id, callback);
  };

  const unregisterTabSubmit = (id: string) => {
    tabSubmitCallbacksRef.current.delete(id);
  };

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(
          () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
          0,
        );
      }
    }
  }, [location.hash, tab]);

  const onReset = async () => {
    const def = defaultSettings();
    await saveSettings(def);
    window.location.reload();
  };

  const onExport = () => {
    loadSettings().then(settings => {
      const data = JSON.stringify(settings, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rehber360-settings.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <SettingsTabDirtyContext.Provider value={{ registerTabSubmit, unregisterTabSubmit }}>
      <div className="w-full min-h-screen pb-6">
        <PageHeader
          title="Profil & Ayarlar"
          description="Uygulama genel tercihleri ve yapılandırma seçenekleri"
          icon={SettingsIcon}
        />

        <div className="space-y-6 max-w-7xl mx-auto px-6">
          {/* Modern Tabs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v);
                setSearchParams((p) => {
                  const np = new URLSearchParams(p);
                  np.set("tab", v);
                  return np;
                });
              }}
              className="space-y-4"
            >
              <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
                {SETTINGS_TABS.map((tabConfig) => (
                  <TabsTrigger
                    key={tabConfig.value}
                    value={tabConfig.value}
                    variant="minimal"
                    title={tabConfig.description}
                  >
                    {tabConfig.icon && <tabConfig.icon className="h-4 w-4" />}
                    <span className="hidden sm:inline">{tabConfig.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="genel">
                <GeneralSettingsTab />
              </TabsContent>

              <TabsContent value="okullar">
                <SchoolSettingsTab />
              </TabsContent>

              <TabsContent value="bildirim">
                <NotificationsSettingsTab />
              </TabsContent>

              <TabsContent value="ai">
                <AISettingsTab />
              </TabsContent>

              <TabsContent value="guvenlik">
                <SecuritySettingsTab
                  onReset={onReset}
                  onExport={onExport}
                />
              </TabsContent>

              <TabsContent value="yedekleme">
                <BackupSettingsTab />
              </TabsContent>

            </Tabs>
          </motion.div>
        </div>
      </div>
    </SettingsTabDirtyContext.Provider>
  );
}
