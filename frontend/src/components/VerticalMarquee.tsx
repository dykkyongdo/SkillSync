"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  /** pixels between items inside your column */
  gap?: number;
  /** px/sec if you prefer speed-based timing */
  speed?: number;
  /** seconds – overrides speed if provided */
  duration?: number;
  /** reverse for downward scroll */
  reverse?: boolean;
  className?: string;
};

export default function VerticalMarquee({
  children,
  gap = 24,
  speed,
  duration,
  reverse = false,
  className = "",
}: Props) {
  const stackRef = React.useRef<HTMLDivElement | null>(null);
  const [distance, setDistance] = React.useState(0);
  const [ready, setReady] = React.useState(false);

  const measure = React.useCallback(() => {
    const el = stackRef.current;
    if (!el) return;
    const h = el.getBoundingClientRect().height;
    setDistance(h);
  }, []);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      measure();
      setReady(true);
    });
    const ro = new ResizeObserver(() => measure());
    if (stackRef.current) ro.observe(stackRef.current);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [measure]);

  const computedDuration =
    duration ?? (distance > 0 && speed ? Math.max(2, distance / speed) : 8);

  const trackStyle: React.CSSProperties = {
    ["--vmq-gap" as any]: `${gap}px`,
    ["--vmq-distance" as any]: `${distance}px`,
    ["--vmq-duration" as any]: `${computedDuration}s`,
  };

  return (
    <div className={["vmq vmq-viewport", className].join(" ")}>
      <div
        className={["vmq-track", reverse ? "vmq-reverse" : ""].join(" ")}
        style={trackStyle}
      >
        {/* Stack #1 */}
        <div ref={stackRef} className="vmq-stack">
          {children}
        </div>

        {/* spacer between stacks = exact same gap as between items */}
        <div className="vmq-spacer" aria-hidden />

        {/* Stack #2 (duplicate) */}
        <div className="vmq-stack" aria-hidden>
          {children}
        </div>

        {/* optional extra spacer to guard against rounding */}
        <div className="vmq-spacer" aria-hidden />
      </div>
    </div>
  );
}
