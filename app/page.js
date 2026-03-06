"use client";
import { useState, useCallback, useEffect } from "react";
import { poems } from "@/data/poems";
import PoemCard from "@/components/PoemCard";

const SESSION_KEY = "pm_loaded";

export default function HomePage() {
  // Always start false on server — avoids SSR/client mismatch
  const [loaded, setLoaded] = useState(false);
  
  // After mount, check sessionStorage — skip loader if already visited
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setLoaded(true);
    }
    setChecked(true);
  }, []);

  const handleComplete = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setLoaded(true);
  }, []);

  // Don't render anything until we've checked sessionStorage
  // (avoids flash of loader on back-nav)
  if (!checked) return null;

  return (
    <>
      

      <main style={{
        minHeight: "100vh", padding: "0 0 120px",
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.9s ease 0.1s",
      }}>
        <header style={{
          padding: "80px 64px 64px", maxWidth: "1400px", margin: "0 auto",
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          borderBottom: "1px solid rgba(200,144,42,0.08)", marginBottom: "72px",
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "10px",
              letterSpacing: "0.25em", color: "rgba(232,220,200,0.3)",
              marginBottom: "16px", textTransform: "uppercase",
            }}>A Digital Space for Poetry</div>
            <h1 className="font-display fade-up" style={{
              fontSize: "clamp(32px,5vw,72px)", fontWeight: 400,
              letterSpacing: "0.04em", color: "var(--text)", margin: 0, lineHeight: 1.1,
            }}>Poetry Museum</h1>
          </div>
          <div style={{
            fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "14px",
            color: "rgba(232,220,200,0.35)", maxWidth: "240px", textAlign: "right", lineHeight: 1.7,
          }}>
            Hover to hear the world of each poem. Enter to dwell within it.
          </div>
        </header>

        <section style={{
          maxWidth: "1400px", margin: "0 auto", padding: "0 64px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
          gap: "2px",
        }}>
          {poems.map((poem, i) => (
            <PoemCard key={poem.slug} poem={poem} index={i} />
          ))}
        </section>

        <footer style={{
          maxWidth: "1400px", margin: "120px auto 0", padding: "32px 64px",
          borderTop: "1px solid rgba(200,144,42,0.08)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.2em", color:"rgba(232,220,200,0.18)" }}>
            POETRY MUSEUM
          </span>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.15em", color:"rgba(232,220,200,0.18)" }}>
            {poems.length} POEMS
          </span>
        </footer>
      </main>
    </>
  );
}