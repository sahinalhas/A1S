import { LucideIcon } from "lucide-react";

/**
 * Merkezi Tab Yönetim Sistemi - Tip Tanımları
 * Tüm programdaki tab yapıları için ortak tip sistemi
 */

export interface TabConfig {
 value: string;
 label: string;
 icon?: LucideIcon;
 description?: string;
 variant?:"default" |"pills" |"underline";
 badge?: string | number;
 disabled?: boolean;
}

export interface PageTabsConfig {
 tabs: TabConfig[];
 defaultTab?: string;
 variant?:"default" |"pills" |"underline";
}
