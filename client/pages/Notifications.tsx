import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { notificationsApi } from "@/lib/api/endpoints/notifications.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/organisms/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { ScrollArea } from "@/components/organisms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import {
  Bell,
  Mail,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  CheckCheck,
  Inbox,
  Settings,
  Trash2,
  Archive,
  MailOpen,
  BellRing,
  Send,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { toast } from "sonner";
import { NotificationItem } from "@/components/features/notifications";
import type { NotificationLog } from "@/../../shared/types/notification.types";
import { cn } from "@/lib/utils";

const notificationTypeLabels: Record<string, string> = {
  RISK_ALERT: "Risk Uyarısı",
  INTERVENTION_REMINDER: "Müdahale Hatırlatması",
  PROGRESS_UPDATE: "İlerleme Güncellemesi",
  MEETING_SCHEDULED: "Toplantı Planlandı",
  WEEKLY_DIGEST: "Haftalık Özet",
  MONTHLY_REPORT: "Aylık Rapor",
  CUSTOM: "Özel Bildirim",
};

const channelLabels: Record<string, string> = {
  EMAIL: "E-posta",
  SMS: "SMS",
  PUSH: "Push",
  IN_APP: "Uygulama İçi",
};

const priorityLabels: Record<string, string> = {
  URGENT: "Acil",
  HIGH: "Yüksek",
  NORMAL: "Normal",
  LOW: "Düşük",
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["notification-stats"],
    queryFn: async () => {
      return await notificationsApi.getNotificationStats();
    },
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notification-logs", selectedTab],
    queryFn: async () => {
      const status = selectedTab === "all" ? undefined : selectedTab as any;
      return await notificationsApi.getNotificationLogs({
        status,
        limit: 100,
      });
    },
  });

  const retryMutation = useMutation({
    mutationFn: () => notificationsApi.retryFailed(),
    onSuccess: (result) => {
      toast.success(`${result.retried} bildirim yeniden gönderildi`);
      queryClient.invalidateQueries({ queryKey: ["notification-logs"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
    },
    onError: () => {
      toast.error("Bildirimler yeniden gönderilemedi");
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      toast.success("Tüm bildirimler okundu olarak işaretlendi");
      queryClient.invalidateQueries({ queryKey: ["notification-logs"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-logs"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((n: NotificationLog) =>
        (n.subject?.toLowerCase().includes(query) || false) ||
        n.message.toLowerCase().includes(query) ||
        (n.recipientName?.toLowerCase().includes(query) || false)
      );
    }

    if (priorityFilter !== "all") {
      result = result.filter((n: NotificationLog) => n.priority === priorityFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((n: NotificationLog) => n.notificationType === typeFilter);
    }

    return result;
  }, [notifications, searchQuery, priorityFilter, typeFilter]);

  const unreadCount = notifications.filter((n: NotificationLog) => n.status !== "READ").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
      case "DELIVERED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "READ":
        return <MailOpen className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SENT":
        return "Gönderildi";
      case "DELIVERED":
        return "Teslim Edildi";
      case "FAILED":
        return "Başarısız";
      case "PENDING":
        return "Bekliyor";
      case "READ":
        return "Okundu";
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "RISK_ALERT":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "INTERVENTION_REMINDER":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "PROGRESS_UPDATE":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "MEETING_SCHEDULED":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bildirim Merkezi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tüm bildirimlerinizi buradan yönetin ve takip edin
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Tümünü Okundu İşaretle</span>
            </Button>
          )}
          <Button
            onClick={() => retryMutation.mutate()}
            disabled={retryMutation.isPending}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", retryMutation.isPending && "animate-spin")} />
            <span className="hidden sm:inline">Başarısızları Yeniden Gönder</span>
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Bildirim</CardTitle>
                <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <BellRing className="h-4 w-4 text-violet-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tüm zamanlar
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gönderildi</CardTitle>
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Send className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{stats.sent}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Başarıyla iletildi
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Başarısız</CardTitle>
                <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gönderilemedi
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  İletim başarısı
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Bildirim Geçmişi</CardTitle>
              <CardDescription>
                Gönderilen ve bekleyen tüm bildirimler
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Bildirim ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Öncelik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Öncelikler</SelectItem>
                  <SelectItem value="URGENT">Acil</SelectItem>
                  <SelectItem value="HIGH">Yüksek</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="LOW">Düşük</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="Tür" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Türler</SelectItem>
                  <SelectItem value="RISK_ALERT">Risk Uyarısı</SelectItem>
                  <SelectItem value="INTERVENTION_REMINDER">Müdahale</SelectItem>
                  <SelectItem value="PROGRESS_UPDATE">İlerleme</SelectItem>
                  <SelectItem value="MEETING_SCHEDULED">Toplantı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="px-4 pt-4">
            <TabsList variant="minimal" className="w-full justify-start gap-1 bg-transparent">
              <TabsTrigger value="all" variant="minimal" className="gap-2 data-[state=active]:bg-accent">
                <Bell className="h-4 w-4" />
                Tümü
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="PENDING" variant="minimal" className="gap-2 data-[state=active]:bg-accent">
                <Clock className="h-4 w-4" />
                Bekleyen
              </TabsTrigger>
              <TabsTrigger value="SENT" variant="minimal" className="gap-2 data-[state=active]:bg-accent">
                <Send className="h-4 w-4" />
                Gönderilen
              </TabsTrigger>
              <TabsTrigger value="FAILED" variant="minimal" className="gap-2 data-[state=active]:bg-accent">
                <XCircle className="h-4 w-4" />
                Başarısız
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="pt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Bildirimler yükleniyor...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Inbox className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-muted-foreground">Bildirim bulunamadı</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery || priorityFilter !== "all" || typeFilter !== "all"
                      ? "Filtreleri değiştirmeyi deneyin"
                      : "Henüz bildirim gönderilmemiş"}
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <AnimatePresence mode="popLayout">
                  <div className="space-y-3">
                    {filteredNotifications.map((notification: NotificationLog, index: number) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <NotificationItem
                          notification={notification}
                          onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </ScrollArea>
            )}
          </CardContent>
        </Tabs>
      </Card>

      {stats && (stats.byChannel || stats.byType) && (
        <div className="grid gap-6 md:grid-cols-2">
          {stats.byChannel && Object.keys(stats.byChannel).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kanal Bazlı Dağılım</CardTitle>
                <CardDescription>Bildirim kanallarına göre istatistikler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byChannel).map(([channel, count]) => (
                    <div key={channel} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {channel === "EMAIL" && <Mail className="h-4 w-4 text-blue-500" />}
                        {channel === "SMS" && <MessageSquare className="h-4 w-4 text-green-500" />}
                        {channel === "PUSH" && <Bell className="h-4 w-4 text-purple-500" />}
                        {channel === "IN_APP" && <BellRing className="h-4 w-4 text-orange-500" />}
                        <span className="text-sm">{channelLabels[channel] || channel}</span>
                      </div>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.byType && Object.keys(stats.byType).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tür Bazlı Dağılım</CardTitle>
                <CardDescription>Bildirim türlerine göre istatistikler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(type)}
                        <span className="text-sm">{notificationTypeLabels[type] || type}</span>
                      </div>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
