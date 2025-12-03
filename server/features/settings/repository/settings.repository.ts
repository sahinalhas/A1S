import getDatabase from '../../../lib/database.js';
import type { AppSettings } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAppSettings: db.prepare('SELECT * FROM app_settings WHERE id = 1'),
    upsertAppSettings: db.prepare(`
      INSERT INTO app_settings (id, settings)
      VALUES (1, ?)
      ON CONFLICT(id) DO UPDATE SET settings = excluded.settings
    `),
  };
  
  isInitialized = true;
}

interface AppSettingsRow {
  id: number;
  settings: string;
}

export function getAppSettings(): Partial<AppSettings> | null {
  try {
    ensureInitialized();
    const result = statements.getAppSettings.get() as AppSettingsRow | undefined;
    if (result && result.settings) {
      const parsed = JSON.parse(result.settings) as Partial<AppSettings>;
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Error getting app settings:', error);
    return null;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    ensureInitialized();
    statements.upsertAppSettings.run(JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving app settings:', error);
    throw error;
  }
}
