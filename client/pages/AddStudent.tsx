import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/organisms/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/Select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/organisms/Tabs';
import { UserPlus, Users, Heart, Sparkles, Home, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Student, upsertStudent } from '@/lib/storage';
import { useStudents } from '@/hooks/queries/students.query-hooks';

export default function AddStudent() {
  const navigate = useNavigate();
  const { students, invalidate } = useStudents();
  const [currentTab, setCurrentTab] = useState('temel');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      id: '',
      name: '',
      surname: '',
      class: '9/A',
      gender: 'K',
      enrollmentDate: new Date().toISOString(),
      fatherName: '',
      motherName: '',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      healthNote: '',
      bloodType: '',
      chronicDiseases: '',
      allergies: '',
      tags: '',
      interests: '',
      hobbiesDetailed: '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const id = (data.id || '').trim();
      if (!id) {
        toast.error('Öğrenci numarası zorunludur.');
        return;
      }
      if (!/^\d+$/.test(id)) {
        toast.error('Öğrenci numarası sadece rakamlardan oluşmalıdır.');
        return;
      }
      if (students.some((s) => s.id === id)) {
        toast.error('Bu öğrenci numarası zaten kayıtlı.');
        return;
      }

      const newStudent = { 
        ...data, 
        id, 
        enrollmentDate: new Date().toISOString() 
      } as Student;

      await upsertStudent(newStudent);
      invalidate();
      reset();
      toast.success('Öğrenci başarıyla eklendi.');
      navigate(`/ogrenci/${id}`);
    } catch (error) {
      toast.error('Öğrenci kaydedilemedi. Lütfen tekrar deneyin.');
      console.error('Failed to save student:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 shadow-xl"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-5 w-5 text-white" />
              <span className="text-white/90 text-sm font-medium">Yeni Öğrenci Kaydı</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Öğrenci Ekle
            </h1>
            <p className="text-sm text-white/90 max-w-xl leading-relaxed">
              Tüm bilgileri tab'lardan doldurarak yeni öğrenci kaydı oluşturun.
            </p>
          </div>
          <motion.div
            className="hidden md:block opacity-30"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Users className="h-20 w-20 text-white" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 border-b">
            <CardTitle>Öğrenci Bilgileri</CardTitle>
            <CardDescription>Tab'ları kullanarak öğrenci bilgilerini girin</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="temel" className="text-xs sm:text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Temel</span>
                  </TabsTrigger>
                  <TabsTrigger value="aile" className="text-xs sm:text-sm">
                    <Home className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Aile</span>
                  </TabsTrigger>
                  <TabsTrigger value="saglik" className="text-xs sm:text-sm">
                    <Heart className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Sağlık</span>
                  </TabsTrigger>
                  <TabsTrigger value="ilgiler" className="text-xs sm:text-sm">
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">İlgiler</span>
                  </TabsTrigger>
                  <TabsTrigger value="yetenekler" className="text-xs sm:text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Yetenekler</span>
                  </TabsTrigger>
                </TabsList>

                {/* Temel Bilgiler */}
                <TabsContent value="temel" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Öğrenci Numarası *</label>
                      <Input
                        placeholder="1001"
                        {...register('id', { required: 'Zorunludur' })}
                        disabled={isSubmitting}
                        className="text-base"
                      />
                      {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Cinsiyet *</label>
                      <Select defaultValue="K">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="K">Kız</SelectItem>
                          <SelectItem value="E">Erkek</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Adı *</label>
                      <Input
                        placeholder="Ahmet"
                        {...register('name', { required: 'Zorunludur' })}
                        disabled={isSubmitting}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Soyadı *</label>
                      <Input
                        placeholder="Yılmaz"
                        {...register('surname', { required: 'Zorunludur' })}
                        disabled={isSubmitting}
                      />
                      {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Sınıfı *</label>
                      <Input
                        placeholder="9/A"
                        {...register('class', { required: 'Zorunludur' })}
                        disabled={isSubmitting}
                      />
                      {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Doğum Tarihi</label>
                      <Input
                        type="date"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Aile Bilgileri */}
                <TabsContent value="aile" className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg mb-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">Ailenin iletişim ve temel bilgilerini girin</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Baba Adı</label>
                      <Input
                        placeholder="Mehmet"
                        {...register('fatherName')}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Baba Mesleği</label>
                      <Input
                        placeholder="Mühendis"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Anne Adı</label>
                      <Input
                        placeholder="Zeynep"
                        {...register('motherName')}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Anne Mesleği</label>
                      <Input
                        placeholder="Öğretmen"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Veli Adı</label>
                      <Input
                        placeholder="Fatih"
                        {...register('guardianName')}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Veli İletişim</label>
                      <Input
                        placeholder="05XX XXX XXXX"
                        {...register('guardianPhone')}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Veli E-posta</label>
                    <Input
                      type="email"
                      placeholder="veli@email.com"
                      {...register('guardianEmail')}
                      disabled={isSubmitting}
                    />
                  </div>
                </TabsContent>

                {/* Sağlık Bilgileri */}
                <TabsContent value="saglik" className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg mb-4">
                    <p className="text-sm text-red-900 dark:text-red-100">Öğrencinin sağlık bilgilerini girin</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Kan Grubu</label>
                      <Select defaultValue="">
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Kronik Hastalıklar</label>
                    <Input
                      placeholder="Asma, Diyabet vb."
                      {...register('chronicDiseases')}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Alerjiler</label>
                    <Input
                      placeholder="Gıda, İlaç alerjileri vb."
                      {...register('allergies')}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Sağlık Notları</label>
                    <textarea
                      placeholder="Diğer sağlık bilgileri..."
                      {...register('healthNote')}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                    />
                  </div>
                </TabsContent>

                {/* İlgiler */}
                <TabsContent value="ilgiler" className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg mb-4">
                    <p className="text-sm text-purple-900 dark:text-purple-100">Öğrencinin ilgi alanlarını belirtin</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Temel İlgiler (virgülle ayrılmış)</label>
                    <Input
                      placeholder="Spor, Sanat, Bilim"
                      {...register('interests')}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Hobi Detayları</label>
                    <textarea
                      placeholder="Öğrencinin detaylı hobi ve etkinlikleri..."
                      {...register('hobbiesDetailed')}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Etiketler (virgülle ayrılmış)</label>
                    <Input
                      placeholder="Lider, Yaratıcı, Sosyal"
                      {...register('tags')}
                      disabled={isSubmitting}
                    />
                  </div>
                </TabsContent>

                {/* Yetenekler */}
                <TabsContent value="yetenekler" className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg mb-4">
                    <p className="text-sm text-green-900 dark:text-green-100">Öğrencinin yeteneklerini belirtin</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Akademik Yetenekler</label>
                    <Input
                      placeholder="Matematik, Fen Bilgisi vb."
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Fiziksel Yetenekler</label>
                    <Input
                      placeholder="Futbol, Yüzme, Tenis vb."
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Yaratıcı Yetenekler</label>
                    <Input
                      placeholder="Müzik, Resim, Tiyatro vb."
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Diğer Bilgiler</label>
                    <textarea
                      placeholder="Kulüp üyelikleri, yarışmalar vb."
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Butonlar */}
              <div className="flex gap-3 mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/ogrenci')}
                  disabled={isSubmitting}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Öğrenciyi Kaydet'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
