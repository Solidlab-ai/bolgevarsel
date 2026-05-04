"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt(): Promise<void>;
}

export function ServiceWorkerRegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Allerede installert? Skip alt
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Registrer service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.warn("SW registration failed:", err));
    }

    // Detekter iOS (Safari har ikke beforeinstallprompt)
    const userAgent = window.navigator.userAgent;
    const iosSafari =
      /iPad|iPhone|iPod/.test(userAgent) &&
      !(window as any).MSStream;
    setIsIOS(iosSafari);

    // Tell besøk
    const visits = parseInt(localStorage.getItem("bv_visits") ?? "0", 10) + 1;
    localStorage.setItem("bv_visits", String(visits));

    // Sjekk om dismisset siste 7 dager
    const dismissedAt = localStorage.getItem("bv_install_dismissed_at");
    const dismissedRecently =
      dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 7 * 86400000;

    // Hør etter install-prompt (Android Chrome, desktop)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);

      // Vis prompt etter 1+ besøk hvis ikke avvist siste 7 dager
      // 4 sek delay så vi ikke driter til landing page conversion
      if (visits >= 1 && !dismissedRecently) {
        setTimeout(() => setShowPrompt(true), 4000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Vis iOS-guide etter 1+ besøk hvis Safari
    if (iosSafari && visits >= 1 && !dismissedRecently) {
      setTimeout(() => setShowIOSGuide(true), 5000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem("bv_installed", "true");
    }
    setInstallEvent(null);
    setShowPrompt(false);
  }

  function dismiss() {
    localStorage.setItem("bv_install_dismissed_at", String(Date.now()));
    setShowPrompt(false);
    setShowIOSGuide(false);
  }

  if (!showPrompt && !showIOSGuide) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "calc(100% - 32px)",
        width: 380,
        background: "white",
        border: "1px solid rgba(13, 31, 45, 0.08)",
        borderRadius: 18,
        padding: "16px 18px",
        boxShadow: "0 12px 40px rgba(10, 42, 61, 0.18), 0 4px 8px rgba(10, 42, 61, 0.06)",
        zIndex: 9999,
        animation: "bvSlideUp 0.4s cubic-bezier(.4,0,.2,1)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <img
          src="/icon0"
          alt="Bølgevarsel"
          width={44}
          height={44}
          style={{ borderRadius: 10, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: "italic",
              fontSize: 16,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              marginBottom: 4,
              color: "#0a2a3d",
            }}
          >
            Installer Bølgevarsel
          </p>
          {showIOSGuide ? (
            <p style={{ fontSize: 12, color: "#2c4a5e", lineHeight: 1.5 }}>
              Trykk{" "}
              <span style={{ display: "inline-block", verticalAlign: "middle" }}>
                <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                  <path d="M7 11V1m0 0L3 5m4-4l4 4M2 9v6h10V9" stroke="#1a6080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {" "}i Safari, deretter <strong>Legg til på Hjem-skjerm</strong>.
            </p>
          ) : (
            <p style={{ fontSize: 12, color: "#2c4a5e", lineHeight: 1.5 }}>
              Få bølgevarsler og live sjødata rett på hjemskjermen.
            </p>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {!showIOSGuide && (
              <button
                onClick={handleInstall}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "7px 16px",
                  background: "#0a2a3d",
                  color: "white",
                  border: "none",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Installer
              </button>
            )}
            <button
              onClick={dismiss}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: "7px 14px",
                background: "transparent",
                color: "#6b8fa3",
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {showIOSGuide ? "OK, skjønner" : "Ikke nå"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bvSlideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
