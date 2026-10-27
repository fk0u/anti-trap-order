"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CursorSpotlightProps {
  className?: string;
}

export function CursorSpotlight({ className }: CursorSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check if device supports fine hover (desktop mouse) and motion is not reduced
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!hasFinePointer || prefersReducedMotion) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    let animationFrameId: number | null = null;
    let pendingX = 0;
    let pendingY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      pendingX = e.clientX - rect.left;
      pendingY = e.clientY - rect.top;

      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(() => {
          setCoords({ x: pendingX, y: pendingY });
          animationFrameId = null;
        });
      }
    };

    const handleMouseLeave = () => {
      setCoords(null);
    };

    const container = containerRef.current;
    if (container) {
      container.parentElement?.addEventListener("mousemove", handleMouseMove);
      container.parentElement?.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      container?.parentElement?.removeEventListener(
        "mousemove",
        handleMouseMove
      );
      container?.parentElement?.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, []);

  if (!isSupported || !coords) {
    return <div ref={containerRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-300",
        className
      )}
      aria-hidden="true"
    >
      <div
        className="absolute h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35"
        style={{
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          background:
            "radial-gradient(circle, rgba(34, 211, 238, 0.18) 0%, rgba(16, 185, 129, 0.08) 35%, transparent 70%)",
        }}
      />
    </div>
  );
}
