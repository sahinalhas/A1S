import { toast } from "sonner";
import type { AppSettings } from "@shared/types";
import { getDefaultSettings, mergeWithDefaults } from "@shared/utils/settings";

const SETTINGS_KEY ="rehber360:settings";

export type { AppSettings };

export function defaultSettings(): AppSettings {
 return getDefaultSettings();
}

export async function loadSettings(): Promise<AppSettings> {
 try {
 const response = await fetch('/api/settings');
 if (!response.ok) {
 throw new Error('Failed to fetch settings');
 }
 const data = await response.json();
 // API döndüğü data'nın data.data veya data'nın kendisi olabileceğini kontrol et
 const settings = (data.data || data) as Partial<AppSettings>;
 const merged = mergeWithDefaults(settings);
 console.debug('[Settings] Loaded and merged:', merged);
 return merged;
 } catch (error) {
 const errorMessage = error instanceof Error ? error.message : String(error);
 console.error('Error loading settings:', errorMessage);
 toast.error('Ayarlar yüklenirken hata oluştu');
 return defaultSettings();
 }
}

export async function saveSettings(v: AppSettings): Promise<void> {
 try {
 console.debug('[Settings] Saving settings:', v);
 const response = await fetch('/api/settings', {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(v)
 });
 
 if (!response.ok) {
 const error = await response.text();
 console.error('[Settings] Save error response:', error);
 throw new Error('Failed to save settings');
 }
 
 const result = await response.json();
 console.debug('[Settings] Save result:', result);
 } catch (error) {
 console.error('Error saving settings:', error);
 toast.error('Ayarlar kaydedilemedi');
 throw error;
 }
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<void> {
 const cur = await loadSettings();
 const next: AppSettings = {
 ...cur,
 ...patch,
 notifications: { ...cur.notifications, ...(patch.notifications || {}) },
 privacy: { ...cur.privacy, ...(patch.privacy || {}) },
 account: { ...cur.account, ...(patch.account || {}) },
 };
 await saveSettings(next);
}

export { SETTINGS_KEY };
