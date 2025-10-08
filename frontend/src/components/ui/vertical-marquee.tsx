"use client";

import * as React from "react";

/**
 * Seamless vertical marquee that measures its stack height and animates exactly
 * that distance to avoid any jump. Duplicate stacks ensure continuous flow.
 *
 * Props:
 * - reverse: move downward instead of up
 * - speed: pixels per second (animation duration auto-computed)
 * - gap: gap between items (in px)
 * - padY: top/bottom padding inside each stack (in px)
 */
export default function VerticalMarquee({
  children,
  reverse = false,
  speed = 80, // px / second (increase for faster)
  gap = 24,
  padY = 32,
  className = "",
}: {
  children: React.ReactNode;
  reverse?: boolean;
  speed?: number;
  gap?: number;
  padY?: number;
  className?: string;
}) {
  const outerRef = React.useRef<HTMLDivElement | null>(null);
  const stackRef = React.useRef<HTMLDivElement | null>(null);
  const [stackH, setStackH] = React.useState(0);

  React.useEffect(() => {
    if (!stackRef.current) return;
    const ro = new ResizeObserver(() => {
      const h = stackRef.current?.getBoundingClientRect().height ?? 0;
      setStackH(h);
    });
    ro.observe(stackRef.current);
    return () => ro.disconnect();
  }, []);

  // Duration based on measured height so the speed feels identical on both sides.
  const duration = stackH > 0 ? stackH / speed : 10; // seconds

  // CSS custom props for the track
  const styleVars = {
    // animation distance
    ["--vmq-stack-h" as any]: `${stackH}px`,
    // duration
    ["--vmq-duration" as any]: `${duration}s`,
    // spacing
    ["--vmq-gap" as any]: `${gap}px`,
    ["--vmq-pad" as any]: `${padY}px`,
  };

  return (
    <div ref={outerRef} className={["relative h-full w-full overflow-hidden", className].join(" ")}>
      <div className={reverse ? "vmq-track vmq-reverse" : "vmq-track"} style={styleVars as React.CSSProperties}>
        {/* We render three identical stacks to always cover the viewport */}
        <div className="vmq-stack" ref={stackRef} aria-hidden={false}>
          {children}
        </div>
        <div className="vmq-stack" aria-hidden>{children}</div>
        <div className="vmq-stack" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
