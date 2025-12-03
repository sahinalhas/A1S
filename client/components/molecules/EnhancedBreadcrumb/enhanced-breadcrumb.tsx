import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BreadcrumbItem {
 label: string;
 href: string;
 icon?: React.ReactNode;
}

interface EnhancedBreadcrumbProps {
 items: BreadcrumbItem[];
 className?: string;
 showHome?: boolean;
 animated?: boolean;
}

export function EnhancedBreadcrumb({
 items,
 className,
 showHome = true,
 animated = true,
}: EnhancedBreadcrumbProps) {
 const allItems: BreadcrumbItem[] = showHome
 ? [{ label:"Ana Sayfa", href:"/", icon: <Home className="h-3.5 w-3.5" /> }, ...items]
 : items;

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.1,
 },
 },
 };

 const itemVariants = {
 hidden: { opacity: 0, x: -10 },
 visible: { opacity: 1, x: 0 },
 };

 const Wrapper = animated ? motion.nav :"nav";
 const ItemWrapper = animated ? motion.div :"div";

 return (
 <Wrapper
 aria-label="Breadcrumb"
 className={cn("flex items-center gap-2 text-sm", className)}
 {...(animated ? { variants: containerVariants, initial:"hidden", animate:"visible" } : {})}
 >
 {allItems.map((item, index) => {
 const isLast = index === allItems.length - 1;

 return (
 <ItemWrapper
 key={item.href}
 className="flex items-center gap-2"
 {...(animated ? { variants: itemVariants } : {})}
 >
 {index > 0 && (
 <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
 )}

 {isLast ? (
 <span
 className="flex items-center gap-1.5 font-medium text-foreground"
 aria-current="page"
 >
 {item.icon}
 {item.label}
 </span>
 ) : (
 <Link
 to={item.href}
 className={cn(
"flex items-center gap-1.5 text-muted-foreground",
"",
" underline-offset-4"
 )}
 >
 {item.icon}
 {item.label}
 </Link>
 )}
 </ItemWrapper>
 );
 })}
 </Wrapper>
 );
}

export function CompactBreadcrumb({
 items,
 className,
 maxItems = 3,
}: {
 items: BreadcrumbItem[];
 className?: string;
 maxItems?: number;
}) {
 if (items.length <= maxItems) {
 return <EnhancedBreadcrumb items={items} className={className} />;
 }

 const firstItem = items[0];
 const lastItems = items.slice(-maxItems + 1);
 const hiddenCount = items.length - maxItems;

 return (
 <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-sm", className)}>
 <Link
 to={firstItem.href}
 className="flex items-center gap-1.5 text-muted-foreground"
 >
 {firstItem.icon}
 {firstItem.label}
 </Link>

 <ChevronRight className="h-4 w-4 text-muted-foreground/50" />

 <button
 type="button"
 className="px-2 py-1 text-muted-foreground rounded"
 title={`${hiddenCount} gizli öğe`}
 >
 ...
 </button>

 {lastItems.map((item, index) => {
 const isLast = index === lastItems.length - 1;

 return (
 <div key={item.href} className="flex items-center gap-2">
 <ChevronRight className="h-4 w-4 text-muted-foreground/50" />

 {isLast ? (
 <span
 className="flex items-center gap-1.5 font-medium text-foreground"
 aria-current="page"
 >
 {item.icon}
 {item.label}
 </span>
 ) : (
 <Link
 to={item.href}
 className="flex items-center gap-1.5 text-muted-foreground"
 >
 {item.icon}
 {item.label}
 </Link>
 )}
 </div>
 );
 })}
 </nav>
 );
}
