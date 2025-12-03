import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
 const [email, setEmail] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');
 setIsLoading(true);

 try {
 await new Promise((resolve) => setTimeout(resolve, 1500));
 
 setSuccess(true);
 } catch (err) {
 setError('Şifre sıfırlama isteği gönderilemedi. Lütfen tekrar deneyin.');
 } finally {
 setIsLoading(false);
 }
 };

 if (success) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
 <Card className="w-full max-w-md">
 <CardHeader className="space-y-1 text-center">
 <div className="flex justify-center mb-4">
 <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
 <CheckCircle2 className="h-8 w-8 text-green-600" />
 </div>
 </div>
 <CardTitle className="text-2xl">E-posta Gönderildi</CardTitle>
 <CardDescription>
 Şifre sıfırlama talimatları e-posta adresinize gönderildi
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="bg-muted p-4 rounded-lg space-y-2">
 <p className="text-sm text-muted-foreground">
 <strong className="text-foreground">{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
 </p>
 <p className="text-sm text-muted-foreground">
 E-postanızı kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
 </p>
 <p className="text-sm text-muted-foreground mt-2">
 E-posta gelmedi mi? Spam klasörünü kontrol edin veya birkaç dakika sonra tekrar deneyin.
 </p>
 </div>

 <Button
 type="button"
 variant="outline"
 className="w-full"
 asChild
 >
 <Link to="/login">
 <ArrowLeft className="mr-2 h-4 w-4" />
 Giriş Sayfasına Dön
 </Link>
 </Button>
 </CardContent>
 </Card>
 </div>
 );
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
 <Card className="w-full max-w-md">
 <CardHeader className="space-y-1 text-center">
 <div className="flex justify-center mb-4">
 <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
 <Mail className="h-6 w-6 text-primary" />
 </div>
 </div>
 <CardTitle className="text-2xl">Şifremi Unuttum</CardTitle>
 <CardDescription>
 E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="email">E-posta Adresi</Label>
 <Input
 id="email"
 type="email"
 placeholder="ornek@okul.edu.tr"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 disabled={isLoading}
 required
 autoComplete="email"
 autoFocus
 />
 <p className="text-sm text-muted-foreground">
 Kayıtlı e-posta adresinizi girin
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
 Şifre Sıfırlama Bağlantısı Gönder
 </Button>
 </form>

 <div className="relative">
 <div className="absolute inset-0 flex items-center">
 <span className="w-full border-t" />
 </div>
 <div className="relative flex justify-center text-xs uppercase">
 <span className="bg-background px-2 text-muted-foreground">
 veya
 </span>
 </div>
 </div>

 <Button
 type="button"
 variant="outline"
 className="w-full"
 disabled={isLoading}
 asChild
 >
 <Link to="/login">
 <ArrowLeft className="mr-2 h-4 w-4" />
 Giriş Sayfasına Dön
 </Link>
 </Button>
 </CardContent>
 </Card>
 </div>
 );
}
