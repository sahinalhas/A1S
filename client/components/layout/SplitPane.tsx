import * as React from "react";
import { cn } from "@/lib/utils";

interface SplitPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  ratio?: "1:1" | "1:2" | "2:1" | "1:3" | "3:1";
  gap?: "sm" | "md" | "lg";
  reverse?: boolean;
  leftPane?: React.ReactNode;
  rightPane?: React.ReactNode;
}

const SplitPane = React.forwardRef<HTMLDivElement, SplitPaneProps>(
  ({
    className,
    orientation = "horizontal",
    ratio = "1:1",
    gap = "md",
    reverse = false,
    leftPane,
    rightPane,
    children,
    ...props
  }, ref) => {
    const gapClasses = {
      sm: orientation === "horizontal" ? "gap-3" : "gap-y-3",
      md: orientation === "horizontal" ? "gap-6" : "gap-y-6",
      lg: orientation === "horizontal" ? "gap-8" : "gap-y-8",
    };

    const ratioClasses = {
      "1:1": orientation === "horizontal" 
        ? "grid-cols-1 lg:grid-cols-2" 
        : "grid-rows-2",
      "1:2": orientation === "horizontal" 
        ? "grid-cols-1 lg:grid-cols-[1fr_2fr]" 
        : "grid-rows-[1fr_2fr]",
      "2:1": orientation === "horizontal" 
        ? "grid-cols-1 lg:grid-cols-[2fr_1fr]" 
        : "grid-rows-[2fr_1fr]",
      "1:3": orientation === "horizontal" 
        ? "grid-cols-1 lg:grid-cols-[1fr_3fr]" 
        : "grid-rows-[1fr_3fr]",
      "3:1": orientation === "horizontal" 
        ? "grid-cols-1 lg:grid-cols-[3fr_1fr]" 
        : "grid-rows-[3fr_1fr]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid w-full",
          ratioClasses[ratio],
          gapClasses[gap],
          reverse && "flex-row-reverse",
          className
        )}
        {...props}
      >
        <div className="relative animate-slide-right">
          {leftPane || (children && React.Children.toArray(children)[0])}
        </div>
        <div className="relative animate-slide-left">
          {rightPane || (children && React.Children.toArray(children)[1])}
        </div>
      </div>
    );
  }
);
SplitPane.displayName = "SplitPane";

export { SplitPane };
