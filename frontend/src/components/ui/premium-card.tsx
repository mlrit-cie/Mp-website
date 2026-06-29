import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardEntrance, HOVER_LIFT, HOVER_LIFT_SUBTLE } from "@/lib/motion";

export interface PremiumCardProps extends HTMLMotionProps<"div"> {
  /** Stagger position in a list/grid — adds an entrance delay. */
  index?: number;
  /** Full hover lift (item cards) vs. subtle (large panels). Set false to disable. */
  interactive?: boolean | "subtle";
  /**
   * Opt in to scroll-triggered entrance (IntersectionObserver). Default is
   * animate-on-mount, which is safe for cards that render after an async fetch
   * (whileInView can fail to fire for already-in-view elements, leaving them
   * stuck at opacity 0).
   */
  inView?: boolean;
}

/**
 * Premium floating card — the internal-page counterpart to the landing's
 * gallery cards. Layered soft shadow, large radius, expo motion. Visual styling
 * lives in the `.premium-card` utility (index.css); transforms come from Framer.
 */
export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, index = 0, interactive = true, inView = false, children, ...props }, ref) => {
    const hover =
      interactive === "subtle"
        ? HOVER_LIFT_SUBTLE
        : interactive
          ? HOVER_LIFT
          : undefined;

    const viewProps = inView
      ? { initial: "hidden" as const, whileInView: "visible" as const, viewport: { once: true, margin: "-40px" } }
      : { initial: "hidden" as const, animate: "visible" as const };

    return (
      <motion.div
        ref={ref}
        variants={cardEntrance(index)}
        whileHover={hover}
        className={cn("premium-card", className)}
        {...viewProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
PremiumCard.displayName = "PremiumCard";
