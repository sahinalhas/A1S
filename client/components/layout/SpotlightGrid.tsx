import * as React from "react";
import { cn } from "@/lib/utils";

interface SpotlightGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  stagger?: boolean;
}

const SpotlightGrid = React.forwardRef<HTMLDivElement, SpotlightGridProps>(
  ({ className, columns = 3, gap = "md", stagger = true, children, ...props }, ref) => {
    const gapClasses = {
      sm: "gap-3",
      md: "gap-6",
      lg: "gap-8",
    };

    const columnClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid w-full",
          columnClasses[columns],
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <div
            className={cn(
              "spotlight",
              stagger && "stagger-item"
            )}
            style={stagger ? { animationDelay: `${index * 0.1}s` } : undefined}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }
);
SpotlightGrid.displayName = "SpotlightGrid";

export { SpotlightGrid };
