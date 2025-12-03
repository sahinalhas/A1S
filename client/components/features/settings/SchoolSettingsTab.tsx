import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth, School } from "@/lib/auth-context";
import { useSettingsTabDirty } from "@/pages/Settings";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/organisms/Dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/organisms/AlertDialog";
import { Building2, Edit2, Trash2, Star, Plus, Save, Loader2, MapPin, Phone, Mail, User, Globe, Share2, Users, HelpCircle, Info, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/organisms/Tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/organisms/DropdownMenu";

interface EditingSchool extends School {
  isEditing?: boolean;
}

export default function SchoolSettingsTab() {
  const { userSchools, loadUserSchools } = useAuth();
  const settingsContext = useSettingsTabDirty();
  const componentId = useMemo(() => `school-settings-${Date.now()}`, []);
  
  const [schools, setSchools] = useState<EditingSchool[]>(userSchools);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSchool, setEditingSchool] = useState<EditingSchool | null>(null);
  const [deletingSchoolId, setDeletingSchoolId] = useState<string | null>(null);
  const [deletingSchoolPassword, setDeletingSchoolPassword] = useState("");
  const [showNewSchoolDialog, setShowNewSchoolDialog] = useState(false);
  const [newSchool, setNewSchool] = useState<Partial<School>>({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    principal: "",
    website: "",
    socialMedia: "",
    viceEducationDirector: "",
  });
  const saveSettingsRef = useRef<() => Promise<void>>();

  useEffect(() => {
    setSchools(userSchools);
  }, [userSchools]);

  const handleEditSchool = async () => {
    if (!editingSchool) return;
    if (!editingSchool.name?.trim()) {
      toast.error("Okul adı gereklidir");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/schools/${editingSchool.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editingSchool.name,
          code: editingSchool.code,
          address: editingSchool.address,
          phone: editingSchool.phone,
          email: editingSchool.email,
          principal: editingSchool.principal,
          website: editingSchool.website,
          socialMedia: editingSchool.socialMedia,
          viceEducationDirector: editingSchool.viceEducationDirector,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Okul bilgileri güncellendi");
        await loadUserSchools();
        setEditingSchool(null);
      } else {
        toast.error(result.message || "Güncelleme başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (!deletingSchoolPassword.trim()) {
      toast.error("Şifrenizi giriniz");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/schools/${schoolId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          password: deletingSchoolPassword,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Okul silindi");
        await loadUserSchools();
        setDeletingSchoolPassword("");
      } else {
        toast.error(result.message || "Silme başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
      setDeletingSchoolId(null);
    }
  };

  const handleSetDefault = async (schoolId: string) => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/set-default`, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Varsayılan okul değiştirildi");
        // Update local state with returned schools to show the badge immediately
        if (result.schools) {
          setSchools(result.schools);
        }
        // Also reload from auth context to keep everything in sync
        await loadUserSchools();
      } else {
        toast.error(result.message || "Başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  const handleCreateSchool = async () => {
    if (!newSchool.name?.trim()) {
      toast.error("Okul adı gereklidir");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
        name: newSchool.name,
        code: newSchool.code,
        address: newSchool.address,
        phone: newSchool.phone,
        email: newSchool.email,
        principal: newSchool.principal,
        website: newSchool.website,
        socialMedia: newSchool.socialMedia,
        viceEducationDirector: newSchool.viceEducationDirector,
      }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Okul oluşturuldu");
        setShowNewSchoolDialog(false);
        setNewSchool({
          name: "",
          code: "",
          address: "",
          phone: "",
          email: "",
          principal: "",
          website: "",
          socialMedia: "",
          viceEducationDirector: "",
        });
        await loadUserSchools();
      } else {
        toast.error(result.message || "Oluşturma başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    saveSettingsRef.current = () => Promise.resolve();
  }, []);

  useEffect(() => {
    if (!settingsContext?.registerTabSubmit) return;
    settingsContext.registerTabSubmit(componentId, async () => {
      if (saveSettingsRef.current) {
        await saveSettingsRef.current();
      }
    });

    return () => {
      if (settingsContext?.unregisterTabSubmit) {
        settingsContext.unregisterTabSubmit(componentId);
      }
    };
  }, [componentId, settingsContext]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Okullarım</h2>
          <p className="text-sm text-muted-foreground">Çalıştığınız okulları yönetin ve varsayılan okulunuzu seçin</p>
        </div>

        {/* Informative Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Default School Info */}
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Varsayılan Okul Nedir?</h3>
                  <div className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
                    <p>Varsayılan okul, sisteme giriş yaptığınızda otomatik olarak açılan ve işlemlerinizi başlangıçta yönlendiren okul bilgisidir. Sistem, her oturumda varsayılan okul üzerinden başlar.</p>
                    <p>İhtiyaç duyduğunuzda varsayılan okulunuzu kolayca değiştirebilir ve farklı bir okul üzerinde işlem yapabilirsiniz.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multiple Schools Info */}
          <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">Birden Fazla Okulda Görevli misiniz?</h3>
                  <div className="text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
                    <p>Birden fazla okulda görevliyseniz, her okulu sisteme ayrı olarak eklemeniz gerekmektedir. Sağ üstte bulunan okul seçici aracılığıyla okullar arasında geçiş yapabilir ve her okulun işlem, kayıt ve verilerini kendi içinde düzenli bir şekilde yürütebilirsiniz.</p>
                    <p>Her okul için yapılacak işlemler birbirinden bağımsız olarak yönetilir.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {schools.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-dashed border-muted-foreground/20">
            <CardContent className="pt-8 text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">Henüz bir okulunuz yok</p>
              <p className="text-sm text-muted-foreground mb-6">Başlamak için ilk okulunuzu oluşturun</p>
              <Button onClick={() => setShowNewSchoolDialog(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                <Plus className="h-4 w-4 mr-2" />
                İlk Okulu Oluştur
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Schools Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schools.map((school, index) => (
              <motion.div
                key={school.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {editingSchool?.id === school.id ? (
                  <Card className="border-2 border-primary/50 shadow-lg">
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-muted-foreground">Okul Adı *</Label>
                          <Input
                            value={editingSchool.name}
                            onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                            className="bg-secondary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-muted-foreground">Kodu</Label>
                            <Input
                              value={editingSchool.code || ""}
                              onChange={(e) => setEditingSchool({ ...editingSchool, code: e.target.value })}
                              className="bg-secondary"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-muted-foreground">Telefon</Label>
                            <Input
                              value={editingSchool.phone || ""}
                              onChange={(e) => setEditingSchool({ ...editingSchool, phone: e.target.value })}
                              className="bg-secondary"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-muted-foreground">Adres</Label>
                          <Input
                            value={editingSchool.address || ""}
                            onChange={(e) => setEditingSchool({ ...editingSchool, address: e.target.value })}
                            className="bg-secondary text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-muted-foreground">E-posta</Label>
                          <Input
                            type="email"
                            value={editingSchool.email || ""}
                            onChange={(e) => setEditingSchool({ ...editingSchool, email: e.target.value })}
                            className="bg-secondary"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-muted-foreground">Müdür</Label>
                          <Input
                            value={editingSchool.principal || ""}
                            onChange={(e) => setEditingSchool({ ...editingSchool, principal: e.target.value })}
                            className="bg-secondary"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-muted-foreground">Müdür Yardımcısı</Label>
                          <Input
                            value={editingSchool.viceEducationDirector || ""}
                            onChange={(e) => setEditingSchool({ ...editingSchool, viceEducationDirector: e.target.value })}
                            className="bg-secondary"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-muted-foreground">Web Sitesi</Label>
                          <Input
                            type="url"
                            placeholder="https://..."
                            value={editingSchool.website || ""}
                            onChange={(e) => setEditingSchool({ ...editingSchool, website: e.target.value })}
                            className="bg-secondary"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-muted-foreground">Sosyal Medya</Label>
                          <Input
                            placeholder="Instagram, Facebook vb."
                            value={editingSchool.socialMedia || ""}
                            onChange={(e) => setEditingSchool({ ...editingSchool, socialMedia: e.target.value })}
                            className="bg-secondary"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setEditingSchool(null)}
                          disabled={isLoading}
                          className="flex-1 text-xs"
                        >
                          İptal
                        </Button>
                        <Button
                          onClick={handleEditSchool}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xs text-white"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Kaydediliyor
                            </>
                          ) : (
                            <>
                              <Save className="h-3 w-3 mr-1" />
                              Kaydet
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className={`group hover:shadow-xl transition-all duration-300 border-1 hover:border-primary/30 cursor-pointer overflow-hidden ${school.isDefault === 1 ? 'ring-2 ring-yellow-400' : ''}`}>
                    <div className={`h-1 ${school.isDefault === 1 ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400' : 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500'}`} />
                    {school.isDefault === 1 && (
                      <div className="px-5 py-2 bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-100 dark:border-yellow-900">
                        <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">⭐ Varsayılan Okul</p>
                      </div>
                    )}
                    <CardContent className="pt-5 space-y-3">
                      {/* Title with Badge and Menu */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-base group-hover:text-primary transition-colors">{school.name}</h3>
                          </div>
                          {school.code && (
                            <p className="text-xs text-muted-foreground ml-7">#{school.code}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {school.isDefault === 1 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-xs font-semibold">Varsayılan</span>
                            </div>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-muted"
                                disabled={isLoading}
                              >
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => setEditingSchool(school)} disabled={isLoading}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                <span>Düzenle</span>
                              </DropdownMenuItem>
                              {schools.length > 1 && school.isDefault !== 1 && (
                                <DropdownMenuItem onClick={() => handleSetDefault(school.id)} disabled={isLoading}>
                                  <Star className="h-4 w-4 mr-2" />
                                  <span>Varsayılan Yap</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => setDeletingSchoolId(school.id)}
                                disabled={isLoading}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span>Sil</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-2 text-sm">
                        {school.address && (
                          <div className="flex items-start gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                            <span className="text-xs line-clamp-2">{school.address}</span>
                          </div>
                        )}
                        {school.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                            <a href={`tel:${school.phone}`} className="text-xs hover:underline">{school.phone}</a>
                          </div>
                        )}
                        {school.email && (
                          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                            <a href={`mailto:${school.email}`} className="text-xs hover:underline truncate">{school.email}</a>
                          </div>
                        )}
                        {school.principal && (
                          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <User className="h-4 w-4 flex-shrink-0 text-blue-500" />
                            <span className="text-xs">Müdür: {school.principal}</span>
                          </div>
                        )}
                        {school.viceEducationDirector && (
                          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Users className="h-4 w-4 flex-shrink-0 text-blue-500" />
                            <span className="text-xs">M. Yardımcısı: {school.viceEducationDirector}</span>
                          </div>
                        )}
                        {school.website && (
                          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Globe className="h-4 w-4 flex-shrink-0 text-cyan-500" />
                            <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline text-primary">Web Sitesi</a>
                          </div>
                        )}
                        {school.socialMedia && (
                          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Share2 className="h-4 w-4 flex-shrink-0 text-pink-500" />
                            <span className="text-xs">{school.socialMedia}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}

            {/* Add New School Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: schools.length * 0.1 }}
              onClick={() => setShowNewSchoolDialog(true)}
              className="group"
            >
              <Card className="h-full cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all hover:shadow-md hover:bg-muted/50">
                <CardContent className="pt-6 h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">Yeni Okul Ekle</p>
                  <p className="text-xs text-muted-foreground mt-1">Başka bir okul ekleyin</p>
                </CardContent>
              </Card>
            </motion.button>
          </div>
        </>
      )}

      {/* New School Dialog */}
      <Dialog open={showNewSchoolDialog} onOpenChange={setShowNewSchoolDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Okul Ekle</DialogTitle>
            <DialogDescription>Sisteme yeni bir okul ekleyin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newSchoolName">Okul Adı *</Label>
              <Input
                id="newSchoolName"
                placeholder="Okul adını girin"
                value={newSchool.name || ""}
                onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="newSchoolCode">Okul Kodu</Label>
                <Input
                  id="newSchoolCode"
                  placeholder="Kod girin"
                  value={newSchool.code || ""}
                  onChange={(e) => setNewSchool({ ...newSchool, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newSchoolPhone">Telefon</Label>
                <Input
                  id="newSchoolPhone"
                  placeholder="Telefon girin"
                  value={newSchool.phone || ""}
                  onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolAddress">Adres</Label>
              <Input
                id="newSchoolAddress"
                placeholder="Adres girin"
                value={newSchool.address || ""}
                onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolEmail">E-posta</Label>
              <Input
                id="newSchoolEmail"
                type="email"
                placeholder="E-posta girin"
                value={newSchool.email || ""}
                onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="newSchoolPrincipal">Müdür Adı</Label>
                <Input
                  id="newSchoolPrincipal"
                  placeholder="Müdür adı"
                  value={newSchool.principal || ""}
                  onChange={(e) => setNewSchool({ ...newSchool, principal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newSchoolViceDirector">Müdür Yardımcısı</Label>
                <Input
                  id="newSchoolViceDirector"
                  placeholder="Yardımcı adı"
                  value={newSchool.viceEducationDirector || ""}
                  onChange={(e) => setNewSchool({ ...newSchool, viceEducationDirector: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolWebsite">Web Sitesi</Label>
              <Input
                id="newSchoolWebsite"
                type="url"
                placeholder="https://..."
                value={newSchool.website || ""}
                onChange={(e) => setNewSchool({ ...newSchool, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolSocialMedia">Sosyal Medya</Label>
              <Input
                id="newSchoolSocialMedia"
                placeholder="Instagram, Facebook vb."
                value={newSchool.socialMedia || ""}
                onChange={(e) => setNewSchool({ ...newSchool, socialMedia: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSchoolDialog(false)} disabled={isLoading}>
              İptal
            </Button>
            <Button onClick={handleCreateSchool} disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Oluşturuluyor
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Okul Ekle
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSchoolId} onOpenChange={(open) => {
        if (!open) {
          setDeletingSchoolId(null);
          setDeletingSchoolPassword("");
        }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Okulu Kalıcı Olarak Sil
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              <p className="text-sm font-semibold text-red-900">⚠️ Uyarı: Bu işlem geri alınamaz!</p>
              <div className="text-xs text-red-800 space-y-1">
                <p>• Okulun tüm verileri silinecek</p>
                <p>• Tüm öğrenci kayıtları kaldırılacak</p>
                <p>• Tüm rehberlik oturumları silinecek</p>
                <p>• Raporlar ve analizler kaybedilecek</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deletePassword" className="text-sm font-medium">
                Şifrelerinizi Girin (Doğrulama İçin)
              </Label>
              <Input
                id="deletePassword"
                type="password"
                placeholder="Şifrenizi giriniz..."
                value={deletingSchoolPassword}
                onChange={(e) => setDeletingSchoolPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && deletingSchoolPassword.trim()) {
                    deletingSchoolId && handleDeleteSchool(deletingSchoolId);
                  }
                }}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Yanlışlıkla silmeyi önlemek için şifreniz gereklidir
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <AlertDialogCancel disabled={isLoading}>
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingSchoolId && handleDeleteSchool(deletingSchoolId)}
              disabled={!deletingSchoolPassword.trim() || isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Siliniyor
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Okulu Sil
                </>
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
