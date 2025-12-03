export interface AppSettings {
  theme: "light" | "dark";
  language: "tr" | "en";
  dateFormat: "dd.MM.yyyy" | "yyyy-MM-dd";
  timeFormat: "HH:mm" | "hh:mm a";
  weekStart: 1 | 7;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    digestHour: number;
  };
  data: {
    autosave: boolean;
    autosaveInterval: number;
    anonymizeOnExport: boolean;
    backupFrequency: "never" | "weekly" | "monthly";
  };
  integrations: {
    mebisEnabled: boolean;
    mebisToken?: string | null;
    eokulEnabled: boolean;
    eokulApiKey?: string | null;
  };
  privacy: {
    analyticsEnabled: boolean;
    dataSharingEnabled: boolean;
  };
  account: {
    displayName: string;
    email: string;
    institution: string;
    signature?: string | null;
  };
  school: {
    periods: { start: string; end: string }[];
  };
}

interface AppSettingsRow {
  id: number;
  settings: string;
}
