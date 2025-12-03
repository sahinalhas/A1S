import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
 title: string;
 description?: string;
 icon?: LucideIcon;
 children: React.ReactNode;
 action?: React.ReactNode;
}

export default function SectionCard({ title, description, icon: Icon, children, action }: SectionCardProps) {
 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 {Icon && <Icon className="h-5 w-5" />}
 {title}
 </CardTitle>
 {description && <CardDescription>{description}</CardDescription>}
 </div>
 {action && <div>{action}</div>}
 </div>
 </CardHeader>
 <CardContent>
 {children}
 </CardContent>
 </Card>
 );
}
