"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { startAmbience, stopAmbience, primeAudio } from "@/lib/audioEngine";

export default function PoemCard({ poem, index }) {
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    // Slight delay so fast mouse-overs don't trigger audio
    timerRef.current = setTimeout(() => {
      startAmbience(poem.slug, poem.audio.notes, poem.audio.waveform, 0.05);
    }, 300);
  }, [poem]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    clearTimeout(timerRef.current);
    stopAmbience(poem.slug);
  }, [poem.slug]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/poem/${poem.slug}`} style={{ textDecoration: "none" }}>
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "relative",
            padding: "40px 36px 36px",
            border: `1px solid ${hovered ? poem.atmosphere.accent + "40" : "rgba(200,144,42,0.1)"}`,
            background: hovered ? poem.atmosphere.hue : "transparent",
            transition: "background 0.8s ease, border-color 0.6s ease",
            overflow: "hidden",
            minHeight: "240px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Accent glow top-left */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                key="glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0 }}
                style={{
                  position: "absolute",
                  top: -60,
                  left: -60,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${poem.atmosphere.accent}18 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>

          {/* Index number */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "rgba(232,220,200,0.2)",
              marginBottom: "24px",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>

          {/* Title */}
          <div>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(18px, 2.2vw, 26px)",
                fontWeight: 400,
                color: hovered ? poem.atmosphere.textColor : "var(--text)",
                marginBottom: "8px",
                transition: "color 0.5s",
                letterSpacing: "0.03em",
              }}
            >
              {poem.title}
            </h2>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.18em",
                color: hovered
                  ? poem.atmosphere.accent
                  : "rgba(232,220,200,0.3)",
                transition: "color 0.5s",
                marginBottom: "20px",
              }}
            >
              {poem.year}
            </div>
          </div>

          {/* Preview / hover line */}
          <div style={{ position: "relative", minHeight: "52px" }}>
            <AnimatePresence mode="wait">
              {!hovered ? (
                <motion.p
                  key="preview"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontStyle: "italic",
                    fontSize: "15px",
                    color: "rgba(232,220,200,0.4)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {poem.preview}
                </motion.p>
              ) : (
                <motion.p
                  key="hoverline"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontStyle: "italic",
                    fontSize: "15px",
                    color: poem.atmosphere.textColor,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {poem.lines[0]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom arrow */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                key="arrow"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "absolute",
                  bottom: "24px",
                  right: "28px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  color: poem.atmosphere.accent,
                  opacity: 0.7,
                }}
              >
                ENTER →
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
    </motion.div>
  );
}