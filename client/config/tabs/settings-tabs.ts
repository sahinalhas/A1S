import { Globe, Bell, Sparkles, Shield, Archive, Building2 } from "lucide-react";
import { TabConfig } from "./types";

/**
 * Ayarlar Sayfası Tab Yapılandırması
 */
export const SETTINGS_TABS: TabConfig[] = [
 {
 value:"genel",
 label:"Genel",
 icon: Globe,
 description:"Genel uygulama ayarları"
 },
 {
 value:"okullar",
 label:"Okullar",
 icon: Building2,
 description:"Okul yönetimi ve varsayılan okul seçimi"
 },
 {
 value:"bildirim",
 label:"Bildirimler",
 icon: Bell,
 description:"Bildirim tercihleri ve ayarları"
 },
 {
 value:"ai",
 label:"AI Yapılandırma",
 icon: Sparkles,
 description:"Yapay zeka entegrasyonu ve ayarları"
 },
 {
 value:"guvenlik",
 label:"Güvenlik",
 icon: Shield,
 description:"Güvenlik ve gizlilik ayarları"
 },
 {
 value:"yedekleme",
 label:"Yedekleme",
 icon: Archive,
 description:"Veri yedekleme ve geri yükleme"
 }
];
