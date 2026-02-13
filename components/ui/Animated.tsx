/** @format */

"use client";

import { ReactNode, useEffect, useRef } from "react";
import AOS from "aos";

type AOSEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "ease-in-back"
  | "ease-out-back"
  | "ease-in-out-back"
  | "ease-in-sine"
  | "ease-out-sine"
  | "ease-in-out-sine"
  | "ease-in-quad"
  | "ease-out-quad"
  | "ease-in-out-quad"
  | "ease-in-cubic"
  | "ease-out-cubic"
  | "ease-in-out-cubic"
  | "ease-in-quart"
  | "ease-out-quart"
  | "ease-in-out-quart";

interface AnimatedProps {
  children: ReactNode;
  animation?:
    | "fade"
    | "fade-up"
    | "fade-down"
    | "fade-left"
    | "fade-right"
    | "fade-up-right"
    | "fade-up-left"
    | "fade-down-right"
    | "fade-down-left"
    | "zoom-in"
    | "zoom-in-up"
    | "zoom-in-down"
    | "zoom-in-left"
    | "zoom-in-right"
    | "zoom-out"
    | "zoom-out-up"
    | "zoom-out-down"
    | "zoom-out-left"
    | "zoom-out-right"
    | "slide-up"
    | "slide-down"
    | "slide-left"
    | "slide-right"
    | "flip-up"
    | "flip-down"
    | "flip-left"
    | "flip-right";
  duration?: number;
  delay?: number;
  offset?: number;
  easing?: AOSEasing;
  once?: boolean;
  mirror?: boolean;
  anchorPlacement?: string;
  className?: string;
}

export default function Animated({
  children,
  animation = "fade-up",
  duration = 1000,
  delay = 0,
  offset = 100,
  easing = "ease-in-out" as AOSEasing,
  once = true,
  mirror = false,
  anchorPlacement = "top-bottom",
  className = "",
}: AnimatedProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    AOS.init({
      duration,
      easing,
      once,
      mirror,
      offset,
      delay,
    });

    if (elementRef.current) {
      AOS.refresh();
    }

    return () => {
      AOS.refresh();
    };
  }, [duration, easing, once, mirror, offset, delay]);

  return (
    <div
      ref={elementRef}
      data-aos={animation}
      data-aos-duration={duration}
      data-aos-delay={delay}
      data-aos-offset={offset}
      data-aos-easing={easing}
      data-aos-once={once}
      data-aos-mirror={mirror}
      data-aos-anchor-placement={anchorPlacement}
      className={className}
    >
      {children}
    </div>
  );
}

