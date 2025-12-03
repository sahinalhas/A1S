import { cva, type VariantProps } from "class-variance-authority";

const riskPillVariants = cva(
"px-2 py-1 rounded text-xs font-medium",
 {
 variants: {
 level: {
 Yüksek:"bg-red-100 text-red-700",
 Orta:"bg-amber-100 text-amber-700",
 Düşük:"bg-emerald-100 text-emerald-700",
 },
 },
 defaultVariants: {
 level:"Düşük",
 },
 }
);

interface RiskPillProps extends VariantProps<typeof riskPillVariants> {
 risk?: string;
}

export function RiskPill({ risk }: RiskPillProps) {
 if (!risk) return null;
 
 const level = risk as"Yüksek" |"Orta" |"Düşük";
 
 return (
 <span className={riskPillVariants({ level })}>
 {risk}
 </span>
 );
}
