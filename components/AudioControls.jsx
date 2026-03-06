"use client";
import { useState, useEffect } from "react";
import { startAmbience, stopAmbience, setAmbienceVolume } from "@/lib/audioEngine";

export default function AudioControls({ poem }) {
  const [musicOn, setMusicOn] = useState(false);

  const toggleMusic = () => {
    if (musicOn) {
      stopAmbience(poem.slug);
      setMusicOn(false);
    } else {
      startAmbience(poem.slug, poem.audio.notes, poem.audio.waveform, 0.09);
      setMusicOn(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAmbience(poem.slug);
  }, [poem.slug]);

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Music toggle */}
      <button
        onClick={toggleMusic}
        className={`audio-btn ${musicOn ? "active" : ""}`}
        aria-label={musicOn ? "Stop ambient music" : "Play ambient music"}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: musicOn ? "var(--accent)" : "transparent",
            border: "1px solid currentColor",
            display: "inline-block",
            transition: "background 0.3s",
          }}
        />
        {musicOn ? "MUSIC ON" : "MUSIC OFF"}
      </button>

      {/* Waveform visualizer — pure CSS bars */}
      {musicOn && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "3px",
            height: "16px",
            opacity: 0.6,
          }}
        >
          {[0.6, 1.0, 0.75, 0.9, 0.5, 0.8, 0.65].map((h, i) => (
            <div
              key={i}
              style={{
                width: "2px",
                height: `${h * 100}%`,
                background: "var(--accent)",
                animation: `waveBar ${0.8 + i * 0.12}s ease-in-out infinite alternate`,
                transformOrigin: "bottom",
              }}
            />
          ))}
          <style>{`
            @keyframes waveBar {
              from { transform: scaleY(0.3); }
              to   { transform: scaleY(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
