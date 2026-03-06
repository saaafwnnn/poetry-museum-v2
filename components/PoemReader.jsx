"use client";
import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AudioControls from "./AudioControls";
import ShareModal from "./ShareModal";

export default function PoemReader({ poem }) {
  const [shareText, setShareText] = useState(null);
  const [sharePos, setSharePos] = useState({ x: 0, y: 0 });
  const [showShareModal, setShowShareModal] = useState(false);
  const containerRef = useRef(null);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setShareText(null);
      return;
    }
    const text = sel.toString().trim();
    if (text.length < 10) {
      setShareText(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setSharePos({ x: rect.left + rect.width / 2, y: rect.top - 12 });
    setShareText(text);
  }, []);

  const handleShareClick = () => {
    window.getSelection()?.removeAllRanges();
    setShowShareModal(true);
  };

  return (
    <>
      {/* Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: poem.atmosphere.hue,
          zIndex: -2,
        }}
      />
      {/* Radial atmosphere */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `radial-gradient(ellipse 70% 60% at 30% 40%, ${poem.atmosphere.accent}0f 0%, transparent 70%)`,
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      <main
        ref={containerRef}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "32px 64px",
            borderBottom: `1px solid ${poem.atmosphere.accent}18`,
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.22em",
              color: "rgba(232,220,200,0.35)",
              textDecoration: "none",
              transition: "color 0.3s",
            }}
          >
            ← MUSEUM
          </Link>
          <AudioControls poem={poem} />
        </motion.nav>

        {/* Poem body */}
        <article
          onMouseUp={handleMouseUp}
          style={{
            flex: 1,
            maxWidth: "680px",
            margin: "0 auto",
            padding: "80px 64px 120px",
            width: "100%",
          }}
        >
          {/* Title block */}
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: "64px" }}
          >
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(28px, 5vw, 56px)",
                fontWeight: 400,
                letterSpacing: "0.04em",
                color: poem.atmosphere.textColor,
                margin: "0 0 12px",
                lineHeight: 1.1,
              }}
            >
              {poem.title}
            </h1>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.22em",
                color: poem.atmosphere.accent,
                opacity: 0.8,
              }}
            >
              {poem.year}
            </div>
          </motion.header>

          {/* Lines */}
          <div style={{ userSelect: "text" }}>
            {poem.lines.map((line, i) => (
              <motion.span
                key={i}
                className="poem-line"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.6 + i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: line === "" ? "normal" : "italic",
                  fontSize: "clamp(17px, 2vw, 22px)",
                  lineHeight: line === "" ? "2.2" : "1.85",
                  color: poem.atmosphere.textColor,
                  opacity: line === "" ? 1 : 0.88,
                }}
              >
                {line === "" ? "\u00A0" : line}
              </motion.span>
            ))}
          </div>

          {/* Share hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
            style={{
              marginTop: "80px",
              paddingTop: "40px",
              borderTop: `1px solid ${poem.atmosphere.accent}18`,
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              color: "rgba(232,220,200,0.22)",
            }}
          >
            SELECT ANY LINE TO SHARE
          </motion.div>
        </article>
      </main>

      {/* Floating share button */}
      <AnimatePresence>
        {shareText && !showShareModal && (
          <motion.button
            key="share-btn"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            onClick={handleShareClick}
            style={{
              position: "fixed",
              left: sharePos.x,
              top: sharePos.y,
              transform: "translateX(-50%) translateY(-100%)",
              zIndex: 500,
              background: poem.atmosphere.accent,
              color: "#0a0905",
              border: "none",
              padding: "7px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.15em",
            }}
          >
            SHARE
          </motion.button>
        )}
      </AnimatePresence>

      {/* Share modal */}
      <AnimatePresence>
        {showShareModal && (
          <ShareModal
            key="modal"
            selectedText={shareText}
            poem={poem}
            onClose={() => {
              setShowShareModal(false);
              setShareText(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
