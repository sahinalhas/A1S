import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, School } from '@/lib/auth-context';
import { Button } from '@/components/atoms/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/organisms/Card';
import { Building2, Plus, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/organisms/Dialog';
import { toast } from 'sonner';

export default function SchoolSelection() {
  const { user, userSchools, selectSchool, loadUserSchools, logout } = useAuth();
  const [schools, setSchools] = useState<School[]>(userSchools);
  const [showNewSchoolDialog, setShowNewSchoolDialog] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSchools(userSchools);
  }, [userSchools]);

  const handleSelectSchool = (school: School) => {
    selectSchool(school);
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const handleCreateSchool = async () => {
    if (!newSchoolName.trim()) {
      toast.error('Okul adı gereklidir');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newSchoolName.trim(),
          code: newSchoolCode.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success && result.school) {
        toast.success('Okul oluşturuldu');
        setShowNewSchoolDialog(false);
        setNewSchoolName('');
        setNewSchoolCode('');

        // Select the new school and reload
        selectSchool(result.school);
        await loadUserSchools();
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        toast.error(result.message || 'Okul oluşturulamadı');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/8 to-purple-500/6 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-500/6 to-primary/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border bg-card/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="text-center pb-6">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-semibold">
              {schools.length === 0 ? 'Okul Oluşturun' : 'Okul Seçimi'}
            </CardTitle>
            <CardDescription>
              {schools.length === 0
                ? `Merhaba ${user?.name}, devam etmek için bir okul oluşturmanız gerekiyor.`
                : `Merhaba ${user?.name}, hangi okulda çalışmak istiyorsunuz?`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* School list */}
            <AnimatePresence>
              {schools.length > 0 ? (
                <div className="space-y-3">
                  {schools.map((school, index) => (
                    <motion.div
                      key={school.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleSelectSchool(school)}
                        className="w-full group"
                      >
                        <Card className="border hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer bg-card">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {school.name}
                              </h3>
                              {school.code && (
                                <p className="text-sm text-muted-foreground">Kod: {school.code}</p>
                              )}
                              {school.address && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{school.address}</span>
                                </div>
                              )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </CardContent>
                        </Card>
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-primary/50 mb-4" />
                  <p className="text-muted-foreground font-medium">Henüz bir okulunuz yok</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uygulamayı kullanabilmek için önce bir okul oluşturmanız gerekiyor.
                  </p>
                </div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">
                  veya
                </span>
              </div>
            </div>

            {/* Add new school button */}
            <Dialog open={showNewSchoolDialog} onOpenChange={setShowNewSchoolDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-12 gap-2">
                  <Plus className="h-4 w-4" />
                  Yeni Okul Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Okul Oluştur</DialogTitle>
                  <DialogDescription>
                    Yeni bir okul oluşturup otomatik olarak ekibine katılın.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">Okul Adı *</Label>
                    <Input
                      id="schoolName"
                      placeholder="Örn: Atatürk Ortaokulu"
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolCode">Okul Kodu (Opsiyonel)</Label>
                    <Input
                      id="schoolCode"
                      placeholder="Örn: 123456"
                      value={newSchoolCode}
                      onChange={(e) => setNewSchoolCode(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewSchoolDialog(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleCreateSchool} disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Oluştur
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Logout button */}
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              Farklı hesapla giriş yap
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
