"use client";
import { useEffect, useRef } from "react";

export default function CursorTracker() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let ringX = 0, ringY = 0;
    let raf;

    const onMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = x + "px";
        dotRef.current.style.top = y + "px";
      }
      // Smooth ring follow
      const lerp = (a, b, t) => a + (b - a) * t;
      const animate = () => {
        ringX = lerp(ringX, x, 0.1);
        ringY = lerp(ringY, y, 0.1);
        if (ringRef.current) {
          ringRef.current.style.left = ringX + "px";
          ringRef.current.style.top = ringY + "px";
        }
        raf = requestAnimationFrame(animate);
      };
      if (!raf) animate();
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
