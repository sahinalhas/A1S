/**
 * Shared types between client and server
 * These types represent the common data structures used across the application
 */

export * from './types/early-warning.types';
export * from './types/holistic-profile.types';
export * from './types/standardized-profile.types';

/**
 * Special education information for students
 */
export interface SpecialEducation {
  id: string;
  studentId: string;
  hasIEP?: boolean;
  iepStartDate?: string;
  iepEndDate?: string;
  iepGoals?: string;
  diagnosis?: string;
  ramReportDate?: string;
  ramReportSummary?: string;
  supportServices?: string;
  accommodations?: string;
  modifications?: string;
  progressNotes?: string;
  evaluationSchedule?: string;
  specialistContacts?: string;
  parentInvolvement?: string;
  transitionPlan?: string;
  assistiveTechnology?: string;
  behavioralSupport?: string;
  status?: string;
  nextReviewDate?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Application settings
 */
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
  data?: {
    autosave: boolean;
    autosaveInterval: number;
    anonymizeOnExport: boolean;
    backupFrequency: "never" | "weekly" | "monthly";
  };
  integrations?: {
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
  school?: {
    periods: { start: string; end: string }[];
  };
}
