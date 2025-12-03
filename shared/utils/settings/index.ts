import type { AppSettings } from '@shared/types';

export function getDefaultSettings(): AppSettings {
  return {
    theme: "light",
    language: "tr",
    dateFormat: "dd.MM.yyyy",
    timeFormat: "HH:mm",
    weekStart: 1,
    notifications: { email: true, sms: false, push: true, digestHour: 9 },
    privacy: { analyticsEnabled: false, dataSharingEnabled: false },
    account: {
      displayName: "Kullanıcı",
      email: "user@example.com",
      institution: "Okul",
      signature: "",
    },
  };
}

export function mergeWithDefaults(partial: Partial<AppSettings>): AppSettings {
  const defaults = getDefaultSettings();
  
  if (!partial || Object.keys(partial).length === 0) {
    return defaults;
  }
  
  return {
    ...defaults,
    ...partial,
    notifications: {
      ...defaults.notifications,
      ...(partial.notifications || {}),
    },
    privacy: { ...defaults.privacy, ...(partial.privacy || {}) },
    account: { ...defaults.account, ...(partial.account || {}) },
  };
}
