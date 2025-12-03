import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface SkipLinkProps {
 href: string;
 children: React.ReactNode;
 className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
 return (
 <a
 href={href}
 className={cn(
"sr-only focus:not-sr-only",
"focus:absolute focus:top-4 focus:left-4 focus:z-50",
"focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground",
"focus:rounded-md focus: focus:outline-none focus:ring-2 focus:ring-ring",
 className
 )}
 >
 {children}
 </a>
 );
}

interface FocusTrapProps {
 children: React.ReactNode;
 active?: boolean;
 className?: string;
}

export function FocusTrap({ children, active = true, className }: FocusTrapProps) {
 const containerRef = useRef<HTMLDivElement>(null);
 const firstFocusableRef = useRef<HTMLElement | null>(null);
 const lastFocusableRef = useRef<HTMLElement | null>(null);

 useEffect(() => {
 if (!active || !containerRef.current) return;

 const container = containerRef.current;
 const focusableElements = container.querySelectorAll<HTMLElement>(
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
 );

 if (focusableElements.length === 0) return;

 firstFocusableRef.current = focusableElements[0];
 lastFocusableRef.current = focusableElements[focusableElements.length - 1];

 firstFocusableRef.current?.focus();

 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key !=="Tab") return;

 if (e.shiftKey) {
 if (document.activeElement === firstFocusableRef.current) {
 e.preventDefault();
 lastFocusableRef.current?.focus();
 }
 } else {
 if (document.activeElement === lastFocusableRef.current) {
 e.preventDefault();
 firstFocusableRef.current?.focus();
 }
 }
 };

 container.addEventListener("keydown", handleKeyDown);

 return () => {
 container.removeEventListener("keydown", handleKeyDown);
 };
 }, [active]);

 return (
 <div ref={containerRef} className={className}>
 {children}
 </div>
 );
}

interface VisuallyHiddenProps {
 children: React.ReactNode;
 as?: keyof JSX.IntrinsicElements;
 className?: string;
}

export function VisuallyHidden({
 children,
 as: Component ="span",
 className,
}: VisuallyHiddenProps) {
 return (
 <Component
 className={cn(
"absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
"[clip:rect(0,0,0,0)]",
 className
 )}
 >
 {children}
 </Component>
 );
}

interface AnnouncerProps {
 message: string;
 politeness?:"polite" |"assertive";
}

export function LiveRegionAnnouncer({ message, politeness ="polite" }: AnnouncerProps) {
 return (
 <div
 role="status"
 aria-live={politeness}
 aria-atomic="true"
 className="sr-only"
 >
 {message}
 </div>
 );
}

export function useAnnouncer() {
 const [message, setMessage] = useState("");
 const [politeness, setPoliteness] = useState<"polite" |"assertive">("polite");

 const announce = (msg: string, level:"polite" |"assertive" ="polite") => {
 setMessage("");
 setTimeout(() => {
 setPoliteness(level);
 setMessage(msg);
 }, 100);
 };

 return {
 announce,
 Announcer: () => (
 <LiveRegionAnnouncer message={message} politeness={politeness} />
 ),
 };
}

interface KeyboardShortcutProps {
 keys: string[];
 onTrigger: () => void;
 enabled?: boolean;
 description?: string;
}

export function useKeyboardShortcut({
 keys,
 onTrigger,
 enabled = true,
 description,
}: KeyboardShortcutProps) {
 useEffect(() => {
 if (!enabled) return;

 const handleKeyDown = (e: KeyboardEvent) => {
 const pressedKeys: string[] = [];
 if (e.ctrlKey) pressedKeys.push("ctrl");
 if (e.shiftKey) pressedKeys.push("shift");
 if (e.altKey) pressedKeys.push("alt");
 if (e.metaKey) pressedKeys.push("meta");
 
 const key = e.key.toLowerCase();
 if (!["control","shift","alt","meta"].includes(key)) {
 pressedKeys.push(key);
 }

 const normalizedKeys = keys.map((k) => k.toLowerCase());
 const matches = normalizedKeys.every((k) => pressedKeys.includes(k));

 if (matches) {
 e.preventDefault();
 onTrigger();
 }
 };

 window.addEventListener("keydown", handleKeyDown);

 return () => {
 window.removeEventListener("keydown", handleKeyDown);
 };
 }, [keys, onTrigger, enabled]);

 return {
 keys: keys.join("+"),
 description,
 };
}

interface FocusVisibleRingProps {
 children: React.ReactNode;
 className?: string;
 ringClassName?: string;
}

export function FocusVisibleRing({
 children,
 className,
 ringClassName,
}: FocusVisibleRingProps) {
 const [isFocusVisible, setIsFocusVisible] = useState(false);

 return (
 <div
 className={cn("relative", className)}
 onFocus={() => setIsFocusVisible(true)}
 onBlur={() => setIsFocusVisible(false)}
 onMouseDown={() => setIsFocusVisible(false)}
 >
 {children}
 {isFocusVisible && (
 <div
 className={cn(
"absolute inset-0 rounded-md pointer-events-none",
"ring-2 ring-ring ring-offset-2 ring-offset-background",
 ringClassName
 )}
 aria-hidden="true"
 />
 )}
 </div>
 );
}

export function useFocusManagement(containerRef: React.RefObject<HTMLElement>) {
 const focusFirst = () => {
 if (!containerRef.current) return;

 const focusable = containerRef.current.querySelector<HTMLElement>(
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
 );

 focusable?.focus();
 };

 const focusLast = () => {
 if (!containerRef.current) return;

 const focusable = Array.from(
 containerRef.current.querySelectorAll<HTMLElement>(
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
 )
 );

 focusable[focusable.length - 1]?.focus();
 };

 const focusNext = () => {
 if (!containerRef.current) return;

 const focusable = Array.from(
 containerRef.current.querySelectorAll<HTMLElement>(
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
 )
 );

 const currentIndex = focusable.findIndex(
 (el) => el === document.activeElement
 );

 if (currentIndex < focusable.length - 1) {
 focusable[currentIndex + 1]?.focus();
 }
 };

 const focusPrevious = () => {
 if (!containerRef.current) return;

 const focusable = Array.from(
 containerRef.current.querySelectorAll<HTMLElement>(
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
 )
 );

 const currentIndex = focusable.findIndex(
 (el) => el === document.activeElement
 );

 if (currentIndex > 0) {
 focusable[currentIndex - 1]?.focus();
 }
 };

 return {
 focusFirst,
 focusLast,
 focusNext,
 focusPrevious,
 };
}
