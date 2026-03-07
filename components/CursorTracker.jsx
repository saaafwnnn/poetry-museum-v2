"use client";
import React, { useEffect, useRef, useState } from "react";

export default function CursorTracker() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  
  // Track visibility so it doesn't snap from the top-left (0,0) on load
  const [isVisible, setIsVisible] = useState(false);

  // Use refs to hold mutable coordinates without triggering re-renders
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const requestRef = useRef();

  useEffect(() => {
    // 1. The Event Listener: Only updates the target mouse coordinates
    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      if (!isVisible) setIsVisible(true);

      // Instantly update the dot for zero latency
      // (Subtracting 4 to center an 8x8px dot)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 4}px, ${e.clientY - 4}px, 0)`;
      }
    };

    window.addEventListener("mousemove", onMove);

    // 2. The Animation Loop: Continuously interpolates ring position
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animate = () => {
      // Smoothly move current ring coordinates toward target mouse coordinates
      ring.current.x = lerp(ring.current.x, mouse.current.x, 0.15);
      ring.current.y = lerp(ring.current.y, mouse.current.y, 0.15);

      // Update ring position using GPU-accelerated transforms
      // (Subtracting 16 to center a 32x32px ring)
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x - 16}px, ${ring.current.y - 16}px, 0)`;
      }

      // Keep the loop running
      requestRef.current = requestAnimationFrame(animate);
    };

    // Start the loop
    requestRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isVisible]);

  return (
    <>
      {/* Hide the default browser cursor to let our custom one shine */}
      <style dangerouslySetInnerHTML={{__html: `
        body { cursor: none; }
      `}} />

      {/* The Dot */}
      <div 
        ref={dotRef} 
        className="cursor-dot" 
        style={{
          opacity: isVisible ? 1 : 0,
          position: "fixed",
          top: 0,
          left: 0,
          width: "8px",
          height: "8px",
          backgroundColor: "#e4e4e7", // zinc-200
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          mixBlendMode: "difference", // Makes it visible on dark and light backgrounds
        }}
      />

      {/* The Ring */}
      <div 
        ref={ringRef} 
        className="cursor-ring" 
        style={{
          opacity: isVisible ? 1 : 0,
          position: "fixed",
          top: 0,
          left: 0,
          width: "32px",
          height: "32px",
          border: "1px solid #71717a", // zinc-500
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          transition: "opacity 0.3s ease",
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}