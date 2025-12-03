import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Loader2, UserPlus, ArrowLeft, GraduationCap, Sparkles, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api/core/client';
import { USER_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type { ApiResponse } from '@/lib/types/api-types';

export default function Register() {
 const [formData, setFormData] = useState({
 name: '',
 email: '',
 password: '',
 confirmPassword: '',
 role: 'counselor' as 'counselor' | 'teacher' | 'student' | 'parent'
 });
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState('');
 const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
 const navigate = useNavigate();

 const validateForm = (): boolean => {
 const errors: Record<string, string> = {};

 if (!formData.name.trim()) {
 errors.name = 'Ad Soyad gereklidir';
 } else if (formData.name.trim().length < 3) {
 errors.name = 'Ad Soyad en az 3 karakter olmalıdır';
 }

 if (!formData.email.trim()) {
 errors.email = 'E-posta gereklidir';
 } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
 errors.email = 'Geçerli bir e-posta adresi giriniz';
 }

 if (!formData.password) {
 errors.password = 'Şifre gereklidir';
 } else if (formData.password.length < 6) {
 errors.password = 'Şifre en az 6 karakter olmalıdır';
 }

 if (!formData.confirmPassword) {
 errors.confirmPassword = 'Şifre tekrarı gereklidir';
 } else if (formData.password !== formData.confirmPassword) {
 errors.confirmPassword = 'Şifreler eşleşmiyor';
 }

 setValidationErrors(errors);
 return Object.keys(errors).length === 0;
 };

 const handleRegister = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');
 setValidationErrors({});

 if (!validateForm()) {
 return;
 }

 setIsLoading(true);

 try {
 const result = await apiClient.post<ApiResponse>(
 USER_ENDPOINTS.BASE,
 {
 name: formData.name.trim(),
 email: formData.email.trim().toLowerCase(),
 password: formData.password,
 role: formData.role
 },
 {
 showErrorToast: false, // We'll handle errors manually
 }
 );

 if (result && 'success' in result && result.success) {
 navigate('/login', { 
 state: { 
 message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.',
 email: formData.email.trim().toLowerCase()
 } 
 });
 }
 } catch (err) {
 const errorMessage = err instanceof Error ? err.message : 'Kayıt yapılırken bir hata oluştu';
 setError(errorMessage);
 } finally {
 setIsLoading(false);
 }
 };

 const roleDescriptions = {
 counselor: 'Rehber öğretmen - Tüm sistem yetkilerine ve öğrenci verilerine erişim',
 teacher: 'Öğretmen - Kendi sınıflarına erişim',
 student: 'Öğrenci - Kendi verilerine ve rehberlik seanslarına erişim',
 parent: 'Veli - Çocuğunun verilerine ve haberleşmeye erişim'
 };

 const prefersReducedMotion = typeof window !== 'undefined' 
 ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
 : false;

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 p-4 relative overflow-hidden">
 {/* Animated background elements */}
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 <motion.div
 className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
 animate={prefersReducedMotion ? {} : {
 scale: [1, 1.2, 1],
 rotate: [0, 90, 0],
 }}
 transition={{
 duration: 20,
 repeat: Infinity,
 ease:"easeInOut",
 }}
 />
 <motion.div
 className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"
 animate={prefersReducedMotion ? {} : {
 scale: [1, 1.3, 1],
 rotate: [0, -90, 0],
 }}
 transition={{
 duration: 25,
 repeat: Infinity,
 ease:"easeInOut",
 }}
 />
 </div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="w-full max-w-2xl relative z-10"
 >
 <Card className=" border-2 bg-white/95 dark:bg-gray-900/95">
 <CardHeader className="space-y-1 text-center pb-8">
 <motion.div 
 className="flex justify-center mb-6"
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ 
 type:"spring",
 stiffness: 260,
 damping: 20,
 delay: 0.1
 }}
 >
 <div className="relative">
 <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
 <UserPlus className="h-10 w-10 text-white" />
 </div>
 <motion.div
 className="absolute -top-1 -right-1"
 animate={prefersReducedMotion ? {} : { 
 rotate: [0, 15, -15, 0],
 scale: [1, 1.1, 1.1, 1]
 }}
 transition={{
 duration: 2,
 repeat: Infinity,
 repeatDelay: 3
 }}
 >
 <Sparkles className="h-5 w-5 text-yellow-400 fill-yellow-400" />
 </motion.div>
 </div>
 </motion.div>
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 >
 <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
 Yeni Hesap Oluştur
 </CardTitle>
 </motion.div>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.3 }}
 >
 <CardDescription className="text-base">
 Rehber360'a katılın ve dijital rehberlik sistemini kullanmaya başlayın
 </CardDescription>
 </motion.div>
 </CardHeader>
 <CardContent className="space-y-4">
 <form onSubmit={handleRegister} className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="name">
 Ad Soyad <span className="text-destructive">*</span>
 </Label>
 <Input
 id="name"
 type="text"
 placeholder="Ahmet Yılmaz"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 disabled={isLoading}
 className={validationErrors.name ? 'border-destructive' : ''}
 />
 {validationErrors.name && (
 <p className="text-sm text-destructive">{validationErrors.name}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="email">
 E-posta <span className="text-destructive">*</span>
 </Label>
 <Input
 id="email"
 type="email"
 placeholder="ornek@okul.edu.tr"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 disabled={isLoading}
 className={validationErrors.email ? 'border-destructive' : ''}
 autoComplete="email"
 />
 {validationErrors.email && (
 <p className="text-sm text-destructive">{validationErrors.email}</p>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="password">
 Şifre <span className="text-destructive">*</span>
 </Label>
 <div className="relative">
 <Input
 id="password"
 type={showPassword ?"text" :"password"}
 placeholder="••••••••"
 value={formData.password}
 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
 disabled={isLoading}
 className={validationErrors.password ? 'border-destructive pr-10' : 'pr-10'}
 autoComplete="new-password"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1"
 aria-label={showPassword ?"Şifreyi gizle" :"Şifreyi göster"}
 >
 {showPassword ? (
 <EyeOff className="h-4 w-4" />
 ) : (
 <Eye className="h-4 w-4" />
 )}
 </button>
 </div>
 {validationErrors.password && (
 <p className="text-sm text-destructive">{validationErrors.password}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="confirmPassword">
 Şifre Tekrar <span className="text-destructive">*</span>
 </Label>
 <div className="relative">
 <Input
 id="confirmPassword"
 type={showConfirmPassword ?"text" :"password"}
 placeholder="••••••••"
 value={formData.confirmPassword}
 onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
 disabled={isLoading}
 className={validationErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
 autoComplete="new-password"
 />
 <button
 type="button"
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1"
 aria-label={showConfirmPassword ?"Şifre tekrarını gizle" :"Şifre tekrarını göster"}
 >
 {showConfirmPassword ? (
 <EyeOff className="h-4 w-4" />
 ) : (
 <Eye className="h-4 w-4" />
 )}
 </button>
 </div>
 {validationErrors.confirmPassword && (
 <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
 )}
 </div>
 </div>

 <div className="space-y-2">
 <Label htmlFor="role">
 Rol <span className="text-destructive">*</span>
 </Label>
 <Select
 value={formData.role}
 onValueChange={(value: 'counselor' | 'teacher' | 'student' | 'parent') => 
 setFormData({ ...formData, role: value })
 }
 disabled={isLoading}
 >
 <SelectTrigger id="role">
 <SelectValue placeholder="Rol seçiniz" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="counselor">Rehber Öğretmen</SelectItem>
 <SelectItem value="teacher">Öğretmen</SelectItem>
 <SelectItem value="student">Öğrenci</SelectItem>
 <SelectItem value="parent">Veli</SelectItem>
 </SelectContent>
 </Select>
 <p className="text-sm text-muted-foreground">
 {roleDescriptions[formData.role]}
 </p>
 </div>

 {error && (
 <Alert variant="destructive">
 <AlertDescription>{error}</AlertDescription>
 </Alert>
 )}

 <Button 
 type="submit" 
 className="w-full" 
 disabled={isLoading}
 >
 {isLoading && <Loader2 className="mr-2 h-4 w-4" />}
 {isLoading ? 'Kaydediliyor...' : (
 <>
 <UserPlus className="mr-2 h-4 w-4" />
 Hesap Oluştur
 </>
 )}
 </Button>
 </form>

 <div className="relative">
 <div className="absolute inset-0 flex items-center">
 <span className="w-full border-t" />
 </div>
 <div className="relative flex justify-center text-xs uppercase">
 <span className="bg-background px-2 text-muted-foreground">
 Zaten hesabınız var mı?
 </span>
 </div>
 </div>

 <Link to="/login">
 <Button
 type="button"
 variant="outline"
 className="w-full"
 disabled={isLoading}
 >
 <ArrowLeft className="mr-2 h-4 w-4" />
 Giriş Yap
 </Button>
 </Link>
 </CardContent>
 </Card>
 </motion.div>
 </div>
 );
}
