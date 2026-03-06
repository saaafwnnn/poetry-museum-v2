"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
let generateShareImage;

if (typeof window !== "undefined") {
  generateShareImage = require("@/lib/shareImage").generateShareImage;
}

export default function ShareModal({ selectedText, poem, onClose }) {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e12));
    const [genCount, setGenCount] = useState(0);

  const generate = useCallback(async (s) => {
    setLoading(true);
    setImgUrl(null);
    try {
      const url = await generateShareImage({ text: selectedText, poem, seed: s });
      setImgUrl(url);
    } finally {
      setLoading(false);
    }
  }, [selectedText, poem]);

  // Auto-generate on open
  useEffect(() => {
    generate(seed);
  }, []); // eslint-disable-line

  const handleRegenerate = () => {
    const newSeed = Math.floor(Math.random() * 1e12);
        setSeed(newSeed);
    setGenCount(c => c + 1);
    generate(newSeed);
  };

  const handleDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `${poem.slug}-quote.png`;
    a.click();
  };

  const accent = poem.atmosphere.accent;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(6,5,4,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, backdropFilter: "blur(12px)",
        padding: "24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0e0c09",
          border: `1px solid ${accent}28`,
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${accent}14`,
        }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "10px",
            letterSpacing: "0.2em", color: `${accent}90`,
          }}>
            SHARE A LINE
            {genCount > 0 && (
              <span style={{ opacity: 0.5, marginLeft: "12px" }}>
                v{genCount + 1}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none",
            color: "rgba(232,220,200,0.3)", fontSize: "20px",
            lineHeight: 1,
          }}>×</button>
        </div>

        {/* Image preview */}
        <div style={{
          position: "relative",
          background: "#080705",
          minHeight: "320px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                  padding: "48px 0",
                }}
              >
                {/* Animated watercolor loading indicator */}
                <div style={{ position: "relative", width: "48px", height: "48px" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      position: "absolute",
                      inset: `${i * 6}px`,
                      borderRadius: "50%",
                      border: `1px solid ${accent}`,
                      opacity: 0.3 + i * 0.2,
                      animation: `ping ${1.2 + i * 0.3}s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                  <style>{`
                    @keyframes ping {
                      0%,100% { transform: scale(0.85); opacity: 0.2; }
                      50% { transform: scale(1.1); opacity: 0.6; }
                    }
                  `}</style>
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "10px",
                  letterSpacing: "0.18em", color: `${accent}60`,
                }}>
                  PAINTING…
                </div>
              </motion.div>
            ) : imgUrl ? (
              <motion.img
                key={`img-${genCount}`}
                src={imgUrl}
                alt="Share preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  width: "100%",
                  display: "block",
                }}
              />
            ) : null}
          </AnimatePresence>
        </div>

        {/* Selected line preview */}
        <div style={{ padding: "16px 24px 0" }}>
          <div style={{
            fontFamily: "var(--font-body)", fontStyle: "italic",
            fontSize: "15px", lineHeight: 1.65,
            color: "rgba(232,220,200,0.55)",
            paddingLeft: "14px",
            borderLeft: `1px solid ${accent}40`,
          }}>
            {selectedText.length > 120 ? selectedText.slice(0, 120) + "…" : selectedText}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: "flex", gap: "10px", flexWrap: "wrap",
          padding: "20px 24px 24px",
        }}>
          {/* Regenerate */}
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="audio-btn"
            style={{
              flex: "1 1 auto",
              opacity: loading ? 0.4 : 1,
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.7 }}>
              <path d="M10 6A4 4 0 1 1 6 2M6 2l2-2M6 2l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            REGENERATE ARTWORK
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={!imgUrl || loading}
            className={`audio-btn ${imgUrl && !loading ? "active" : ""}`}
            style={{
              flex: "1 1 auto",
              justifyContent: "center",
              opacity: !imgUrl || loading ? 0.3 : 1,
            }}
          >
            ↓ SAVE PNG
          </button>
        </div>

        {/* Subtle hint */}
        <div style={{
          padding: "0 24px 16px",
          fontFamily: "var(--font-mono)", fontSize: "9px",
          letterSpacing: "0.14em", color: "rgba(232,220,200,0.18)",
          textAlign: "center",
        }}>
          EACH ARTWORK IS UNIQUE · SELECT A LINE TO SHARE
        </div>
      </motion.div>
    </motion.div>
  );
}
