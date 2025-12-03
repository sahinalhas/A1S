import { Card, CardHeader } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Avatar, AvatarFallback } from "@/components/atoms/Avatar";
import { User, GraduationCap, ShieldAlert, Sparkles, Calendar, Mail, Phone, MapPin, TrendingUp, Heart, Target, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Student } from "@/lib/storage";
import { RiskPill } from "./RiskPill";

interface StudentHeaderProps {
 student: Student;
}

export function StudentHeader({ student }: StudentHeaderProps) {
 const fullName = `${student.name} ${student.surname}`;
 const currentYear = new Date().getFullYear();
 const birthYear = student.birthDate ? new Date(student.birthDate).getFullYear() : currentYear;
 const age = currentYear - birthYear;
 
 const initials = `${student.name.charAt(0)}${student.surname.charAt(0)}`.toUpperCase();
 
 const getGenderColor = (gender?: string) => {
 if (gender ==="K") return"from-pink-500 to-purple-500";
 if (gender ==="E") return"from-blue-500 to-cyan-500";
 return"from-gray-500 to-slate-500";
 };

 return (
 <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-background via-background to-primary/5 shadow-lg">
 {/* Decorative Background Elements */}
 <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10"></div>
 <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl -z-10"></div>
 
 <CardHeader className="p-5 md:p-7">
 <div className="flex flex-col md:flex-row items-start gap-5">
 {/* Avatar ve Ana Bilgiler */}
 <div className="flex items-start gap-4 w-full md:w-auto">
 {/* Büyük Avatar */}
 <Avatar className={`h-20 w-20 md:h-24 md:w-24 border-4 border-white shadow-lg bg-gradient-to-br ${getGenderColor(student.gender)} flex-shrink-0`}>
 <AvatarFallback className="text-2xl md:text-3xl font-bold text-white">
 {initials}
 </AvatarFallback>
 </Avatar>

 {/* İsim ve Temel Bilgiler */}
 <div className="flex-1 min-w-0">
 <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
 {fullName}
 </h1>
 
 {/* Badges - İlk Satır */}
 <div className="flex flex-wrap items-center gap-2 mb-3">
 <Badge variant="default" className="text-xs font-semibold px-3 py-1 shadow-sm">
 <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
 {student.class}
 </Badge>
 
 <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">
 {student.gender ==="K" ?"👧 Kız" :"👦 Erkek"}
 </Badge>
 
 <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
 <Calendar className="h-3.5 w-3.5 mr-1.5" />
 {age} yaş
 </Badge>

 {student.studentNumber && (
 <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
 <User className="h-3.5 w-3.5 mr-1.5" />
 {student.studentNumber}
 </Badge>
 )}
 </div>

 {/* Risk Durumu - Vurgulu */}
 <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg border border-border/50 mb-3">
 <ShieldAlert className="h-4 w-4 flex-shrink-0 text-primary" />
 <span className="text-sm font-semibold text-foreground">Risk Seviyesi:</span>
 <RiskPill risk={student.risk} />
 </div>

 {/* İletişim Bilgileri - İyileştirilmiş */}
 {(student.email || student.phone || student.address) && (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {student.email && (
 <div className="flex items-center gap-2 text-xs bg-background/80 rounded-lg px-3 py-2 border border-border/30">
 <Mail className="h-3.5 w-3.5 text-primary flex-shrink-0" />
 <span className="truncate font-medium">{student.email}</span>
 </div>
 )}
 {student.phone && (
 <div className="flex items-center gap-2 text-xs bg-background/80 rounded-lg px-3 py-2 border border-border/30">
 <Phone className="h-3.5 w-3.5 text-primary flex-shrink-0" />
 <span className="font-medium">{student.phone}</span>
 </div>
 )}
 {student.address && (
 <div className="flex items-center gap-2 text-xs bg-background/80 rounded-lg px-3 py-2 border border-border/30 sm:col-span-2">
 <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
 <span className="truncate font-medium">{student.address}</span>
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 {/* Sağ Taraf - Hızlı Aksiyonlar */}
 <div className="flex flex-col gap-2 w-full md:w-auto md:ml-auto">
 <Button 
 asChild 
 className="gap-2 shadow-md hover:shadow-lg transition-shadow"
 >
 <Link to={`/ogrenci/${student.id}/gelismis-analiz`}>
 <Sparkles className="h-4 w-4" />
 Gelişmiş Analiz
 </Link>
 </Button>
 
 <div className="grid grid-cols-2 gap-2">
 <Button 
 asChild 
 variant="outline"
 size="sm"
 className="gap-1.5"
 >
 <Link to="#academic">
 <BookOpen className="h-3.5 w-3.5" />
 <span className="text-xs">Akademik</span>
 </Link>
 </Button>
 
 <Button 
 asChild 
 variant="outline"
 size="sm"
 className="gap-1.5"
 >
 <Link to="#psychosocial">
 <Heart className="h-3.5 w-3.5" />
 <span className="text-xs">Psikososyal</span>
 </Link>
 </Button>
 </div>
 </div>
 </div>
 </CardHeader>
 </Card>
 );
}
