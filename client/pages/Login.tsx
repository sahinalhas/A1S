import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Loader2, UserPlus, GraduationCap, Sparkles, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState('');
 const [successMessage, setSuccessMessage] = useState('');
 const { login } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();

 useEffect(() => {
 const state = location.state as { message?: string; email?: string };
 if (state?.message) {
 setSuccessMessage(state.message);
 if (state.email) {
 setEmail(state.email);
 }
 window.history.replaceState({}, document.title);
 }
 }, [location]);

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');
 setIsLoading(true);

 try {
 const success = await login(email, password);
 
 if (success) {
 navigate('/');
 } else {
 setError('E-posta veya şifre hatalı.');
 }
 } catch (err) {
 setError('Giriş yapılırken bir hata oluştu.');
 } finally {
 setIsLoading(false);
 }
 };

 const handleQuickLogin = async () => {
 setError('');
 setIsLoading(true);

 try {
 const success = await login('rehber@okul.edu.tr', 'rehber123');
 
 if (success) {
 navigate('/');
 } else {
 setError('Hızlı giriş başarısız oldu.');
 }
 } catch (err) {
 setError('Giriş yapılırken bir hata oluştu.');
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
 {/* Subtle background gradient - minimal */}
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/8 to-purple-500/6 rounded-full blur-3xl" />
 <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-500/6 to-primary/8 rounded-full blur-3xl" />
 </div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="w-full max-w-md relative z-10"
 >
 <Card className="border bg-card/80 backdrop-blur-xl shadow-xl">
 <CardHeader className="space-y-3 text-center pb-6">
 <motion.div 
 className="flex justify-center mb-4"
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.4, ease: "easeOut" }}
 >
 <div className="relative">
 <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
 <GraduationCap className="h-8 w-8 text-white" />
 </div>
 <div className="absolute -top-0.5 -right-0.5">
 <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" />
 </div>
 </div>
 </motion.div>
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1, duration: 0.4 }}
 >
 <CardTitle className="text-2xl font-semibold gradient-text">
 Rehber360'a Hoş Geldiniz
 </CardTitle>
 </motion.div>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.2, duration: 0.4 }}
 >
 <CardDescription className="text-sm text-muted-foreground">
 MEB uyumlu dijital rehberlik yönetimi
 </CardDescription>
 </motion.div>
 </CardHeader>
 <CardContent className="space-y-4">
 <form onSubmit={handleLogin} className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="email">E-posta</Label>
 <Input
 id="email"
 type="email"
 placeholder="ornek@okul.edu.tr"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 disabled={isLoading}
 required
 autoComplete="email"
 />
 </div>
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <Label htmlFor="password">Şifre</Label>
 <Link 
 to="/forgot-password" 
 className="text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
 >
 Şifremi Unuttum
 </Link>
 </div>
 <div className="relative">
 <Input
 id="password"
 type={showPassword ?"text" :"password"}
 placeholder="••••••••"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 disabled={isLoading}
 required
 autoComplete="current-password"
 className="pr-10"
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
 </div>

 {successMessage && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 >
 <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
 <AlertDescription>{successMessage}</AlertDescription>
 </Alert>
 </motion.div>
 )}

 {error && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 >
 <Alert variant="destructive">
 <AlertDescription>{error}</AlertDescription>
 </Alert>
 </motion.div>
 )}

 <Button 
 type="submit" 
 className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm transition-all duration-200" 
 disabled={isLoading}
 >
 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 Giriş Yap
 </Button>
 </form>

 <div className="relative my-4">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t border-border"></div>
 </div>
 <div className="relative flex justify-center text-xs uppercase">
 <span className="bg-card px-2 text-muted-foreground">
 Geliştirme Modu
 </span>
 </div>
 </div>

 <Button
 type="button"
 variant="outline"
 className="w-full h-10 border border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100 font-medium hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
 onClick={handleQuickLogin}
 disabled={isLoading}
 >
 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 🔑 Rehber Hızlı Giriş
 </Button>

 <div className="relative my-6">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t border-border"></div>
 </div>
 <div className="relative flex justify-center text-xs uppercase">
 <span className="bg-card px-3 text-muted-foreground font-medium">
 Hesabınız yok mu?
 </span>
 </div>
 </div>

 <Button
 type="button"
 variant="outline"
 className="w-full h-10 border group hover:border-primary/50 transition-colors"
 disabled={isLoading}
 asChild
 >
 <Link to="/register">
 <UserPlus className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
 Yeni Hesap Oluştur
 </Link>
 </Button>
 </CardContent>
 </Card>
 </motion.div>
 </div>
 );
}
