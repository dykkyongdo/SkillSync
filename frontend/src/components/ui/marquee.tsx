"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Orientation = "horizontal" | "vertical";

type MarqueeProps = {
  /** Items to render inside the marquee */
  items: React.ReactNode[];
  /** "horizontal" or "vertical" (default: "horizontal") */
  orientation?: Orientation;
  /** Reverse the direction (default: false) */
  reverse?: boolean;
  /** Duration per loop, accepts "8s" or "12000ms" (default: "20s") */
  duration?: string;
  /** Extra className for the outer container */
  className?: string;
  /** Gap between items (Tailwind size class) */
  gapClassName?: string;
};

/**
 * Seamless marquee using 2 identical 50%-width/height slots.
 * The track translates by exactly 50% → no jump.
 */
export default function Marquee({
  items,
  orientation = "horizontal",
  reverse = false,
  duration = "20s",
  className,
  gapClassName = "gap-6",
}: MarqueeProps) {
  const vertical = orientation === "vertical";

  return (
    <div className={cn("marquee-root", className)}>
      <div
        className={cn(
          "marquee-track",
          vertical ? "marquee-vertical" : "marquee-horizontal",
          reverse && "marquee-reverse"
        )}
        style={{ ["--marquee-duration" as keyof React.CSSProperties]: duration }}
      >
        {/* Slot A */}
        <div className={cn("marquee-slot", vertical ? "flex-col" : "flex-row", gapClassName)}>
          {items.map((it, i) => (
            <div key={`a-${i}`} className="marquee-item">
              {it}
            </div>
          ))}
        </div>
        {/* Slot B (duplicate, aria-hidden for a11y) */}
        <div
          className={cn("marquee-slot", vertical ? "flex-col" : "flex-row", gapClassName)}
          aria-hidden
        >
          {items.map((it, i) => (
            <div key={`b-${i}`} className="marquee-item">
              {it}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
