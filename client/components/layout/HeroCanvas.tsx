import * as React from "react";
import { cn } from "@/lib/utils";

interface HeroCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  overlay?: boolean;
  gradient?: boolean;
  animated?: boolean;
}

const HeroCanvas = React.forwardRef<HTMLDivElement, HeroCanvasProps>(
  ({ className, overlay = true, gradient = true, animated = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden",
          gradient && "gradient-mesh",
          className
        )}
        {...props}
      >
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background z-10 pointer-events-none" />
        )}
        
        {animated && (
          <>
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float opacity-60" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: "2s" }} />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-chart-2/10 rounded-full blur-3xl animate-float opacity-40" style={{ animationDelay: "4s" }} />
          </>
        )}
        
        <div className="relative z-20 w-full">
          {children}
        </div>
      </div>
    );
  }
);
HeroCanvas.displayName = "HeroCanvas";

export { HeroCanvas };
