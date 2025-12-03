export const VARIANT_COLORS = {
  default: {
    bg: 'bg-primary',
    text: 'text-primary-foreground',
    hover: 'hover:bg-primary/90',
    border: 'border-transparent',
  },
  destructive: {
    bg: 'bg-destructive',
    text: 'text-destructive-foreground',
    hover: 'hover:bg-destructive/90',
    border: 'border-destructive/50',
  },
  secondary: {
    bg: 'bg-secondary',
    text: 'text-secondary-foreground',
    hover: 'hover:bg-secondary/80',
    border: 'border-transparent',
  },
  outline: {
    bg: 'bg-background',
    text: 'text-foreground',
    hover: 'hover:bg-accent hover:text-accent-foreground',
    border: 'border-input',
  },
  ghost: {
    bg: 'bg-transparent',
    text: 'text-foreground',
    hover: 'hover:bg-accent hover:text-accent-foreground',
    border: 'border-transparent',
  },
} as const;

export const COMMON_TRANSITIONS = {
  default: 'transition-colors duration-150',
  colors: 'transition-colors',
  transform: 'transition-transform',
} as const;

export const COMMON_FOCUS_STYLES = 
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export const COMMON_DISABLED_STYLES = 
  'disabled:pointer-events-none disabled:opacity-50';

export function createVariantClass(
  variant: keyof typeof VARIANT_COLORS,
  includeHover = true
): string {
  const colors = VARIANT_COLORS[variant];
  const classes: string[] = [colors.bg, colors.text];
  
  if (includeHover && colors.hover) {
    classes.push(colors.hover);
  }
  
  if (colors.border && colors.border !== 'border-transparent') {
    classes.push(`border ${colors.border}`);
  }
  
  return classes.join(' ');
}

export const COMMON_SIZE_VARIANTS = {
  button: {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  },
  input: {
    default: 'h-10 px-3 py-2',
    sm: 'h-9 px-2 py-1',
    lg: 'h-11 px-4 py-3',
  },
  badge: {
    default: 'px-2.5 py-0.5 text-xs',
    sm: 'px-2 py-0 text-[10px]',
    lg: 'px-3 py-1 text-sm',
  },
} as const;
