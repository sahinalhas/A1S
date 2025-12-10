import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/Select';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Student, upsertStudent } from '@/lib/storage';
import { useStudents } from '@/hooks/queries/students.query-hooks';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const STEPS = [
  { id: 'temel', label: 'Temel Bilgiler', icon: '1' },
  { id: 'aile', label: 'Aile Bilgileri', icon: '2' },
  { id: 'saglik', label: 'Sağlık', icon: '3' },
  { id: 'ilgiler', label: 'İlgiler', icon: '4' },
  { id: 'yetenekler', label: 'Yetenekler', icon: '5' },
];

export default function AddStudent() {
  const navigate = useNavigate();
  const { students, invalidate } = useStudents();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    mode: 'onBlur',
    defaultValues: {
      id: '',
      name: '',
      surname: '',
      class: '9/A',
      gender: 'K',
      fatherName: '',
      motherName: '',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      bloodType: '',
      chronicDiseases: '',
      allergies: '',
      healthNote: '',
      interests: '',
      tags: '',
      hobbiesDetailed: '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const id = (data.id || '').trim();
      if (!id) {
        toast.error('Öğrenci numarası zorunludur.');
        setIsSubmitting(false);
        return;
      }
      if (!/^\d+$/.test(id)) {
        toast.error('Öğrenci numarası sadece rakamlardan oluşmalıdır.');
        setIsSubmitting(false);
        return;
      }
      if (students.some((s) => s.id === id)) {
        toast.error('Bu öğrenci numarası zaten kayıtlı.');
        setIsSubmitting(false);
        return;
      }

      const newStudent = {
        ...data,
        id,
        enrollmentDate: new Date().toISOString(),
      } as Student;

      await upsertStudent(newStudent);
      invalidate();
      toast.success('Öğrenci başarıyla eklendi.');
      navigate(`/ogrenci/${id}`);
    } catch (error) {
      toast.error('Öğrenci kaydedilemedi. Lütfen tekrar deneyin.');
      console.error('Failed to save student:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Yeni Öğrenci Ekle
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Adım adım öğrenci bilgilerini girin
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex justify-between gap-2 md:gap-4">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.id}
                className="flex-1"
                whileHover={{ scale: 1.02 }}
              >
                <button
                  onClick={() => goToStep(idx)}
                  disabled={isSubmitting}
                  className={`w-full py-3 px-2 md:px-4 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    currentStep === idx
                      ? 'bg-emerald-600 text-white shadow-lg scale-105'
                      : currentStep > idx
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {currentStep > idx ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span>{step.icon}</span>
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 pb-6">
              <CardTitle className="text-2xl">{STEPS[currentStep].label}</CardTitle>
            </CardHeader>

            <CardContent className="pt-8">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 1: Temel Bilgiler */}
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      key="temel"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Öğrenci Numarası *
                          </label>
                          <Input
                            type="text"
                            placeholder="1001"
                            {...register('id', { required: 'Zorunludur' })}
                            disabled={isSubmitting}
                            className="text-base"
                          />
                          {errors.id && (
                            <p className="text-red-500 text-xs mt-1">{errors.id.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Cinsiyet *
                          </label>
                          <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="K">Kız</SelectItem>
                                  <SelectItem value="E">Erkek</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Adı *
                          </label>
                          <Input
                            placeholder="Ahmet"
                            {...register('name', { required: 'Zorunludur' })}
                            disabled={isSubmitting}
                          />
                          {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Soyadı *
                          </label>
                          <Input
                            placeholder="Yılmaz"
                            {...register('surname', { required: 'Zorunludur' })}
                            disabled={isSubmitting}
                          />
                          {errors.surname && (
                            <p className="text-red-500 text-xs mt-1">{errors.surname.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Sınıfı *
                          </label>
                          <Input
                            placeholder="9/A"
                            {...register('class', { required: 'Zorunludur' })}
                            disabled={isSubmitting}
                          />
                          {errors.class && (
                            <p className="text-red-500 text-xs mt-1">{errors.class.message}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Aile Bilgileri */}
                  {currentStep === 1 && (
                    <motion.div
                      key="aile"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Baba Adı
                          </label>
                          <Input
                            placeholder="Mehmet"
                            {...register('fatherName')}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Anne Adı
                          </label>
                          <Input
                            placeholder="Zeynep"
                            {...register('motherName')}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Veli Adı
                          </label>
                          <Input
                            placeholder="Fatih"
                            {...register('guardianName')}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Veli Telefon
                          </label>
                          <Input
                            placeholder="05XX XXX XXXX"
                            {...register('guardianPhone')}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Veli E-posta
                        </label>
                        <Input
                          type="email"
                          placeholder="veli@email.com"
                          {...register('guardianEmail')}
                          disabled={isSubmitting}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Sağlık */}
                  {currentStep === 2 && (
                    <motion.div
                      key="saglik"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Kan Grubu
                          </label>
                          <Controller
                            name="bloodType"
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value || ''} onValueChange={field.onChange}>
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
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Kronik Hastalıklar
                        </label>
                        <Input
                          placeholder="Asma, Diyabet vb."
                          {...register('chronicDiseases')}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Alerjiler
                        </label>
                        <Input
                          placeholder="Gıda, İlaç alerjileri vb."
                          {...register('allergies')}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Sağlık Notları
                        </label>
                        <textarea
                          placeholder="Diğer sağlık bilgileri..."
                          {...register('healthNote')}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white"
                          rows={4}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: İlgiler */}
                  {currentStep === 3 && (
                    <motion.div
                      key="ilgiler"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Temel İlgiler (virgülle ayrılmış)
                        </label>
                        <Input
                          placeholder="Spor, Sanat, Bilim"
                          {...register('interests')}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Hobi Detayları
                        </label>
                        <textarea
                          placeholder="Öğrencinin detaylı hobi ve etkinlikleri..."
                          {...register('hobbiesDetailed')}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white"
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Etiketler (virgülle ayrılmış)
                        </label>
                        <Input
                          placeholder="Lider, Yaratıcı, Sosyal"
                          {...register('tags')}
                          disabled={isSubmitting}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Yetenekler */}
                  {currentStep === 4 && (
                    <motion.div
                      key="yetenekler"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Akademik Yetenekler
                        </label>
                        <Input
                          placeholder="Matematik, Fen Bilgisi vb."
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Fiziksel Yetenekler
                        </label>
                        <Input
                          placeholder="Futbol, Yüzme, Tenis vb."
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Yaratıcı Yetenekler
                        </label>
                        <Input
                          placeholder="Müzik, Resim, Tiyatro vb."
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                        <p className="text-sm text-emerald-900 dark:text-emerald-100">
                          ✓ Tüm adımları tamamladınız! Öğrenciyi kaydetmek için aşağıdaki "Kaydet" butonunu tıklayın.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/ogrenci')}
                    disabled={isSubmitting}
                    className="px-6"
                  >
                    İptal
                  </Button>

                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => goToStep(currentStep - 1)}
                      disabled={isSubmitting}
                      className="px-6"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Önceki
                    </Button>
                  )}

                  {currentStep < STEPS.length - 1 ? (
                    <Button
                      type="button"
                      onClick={() => goToStep(currentStep + 1)}
                      disabled={isSubmitting}
                      className="ml-auto px-6 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Sonraki
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="ml-auto px-6 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? 'Kaydediliyor...' : 'Öğrenciyi Kaydet'}
                      <Check className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
