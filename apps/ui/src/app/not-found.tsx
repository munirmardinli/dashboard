"use client";

import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { useThemeStore } from '@/stores/themeStore';
import { getTheme } from '@/utils/theme';

export default function NotFound() {
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.bg,
      color: theme.text,
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 20px",
      textAlign: "center",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px",
        height: "600px",
        background: `radial-gradient(circle, ${theme.primary}20 0%, transparent 70%)`,
        filter: "blur(40px)",
        animation: "pulse 4s ease-in-out infinite",
        pointerEvents: "none"
      }} />

      <div style={{
        maxWidth: "600px",
        padding: "48px 32px",
        borderRadius: "32px",
        background: theme.paper,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${theme.divider}`,
        boxShadow: `0 20px 60px ${theme.primary}10`,
        position: "relative",
        zIndex: 1,
        animation: "fadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
      }}>
        <div style={{
          fontSize: "8rem",
          marginBottom: "24px",
          opacity: 0.3,
          animation: "float 3s ease-in-out infinite"
        }}>
          <FileQuestion size={120} strokeWidth={1.5} />
        </div>

        <h1 style={{
          fontSize: "3.5rem",
          fontWeight: 800,
          margin: "0 0 16px 0",
          background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.2
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          margin: "0 0 16px 0",
          color: theme.text
        }}>
          Seite nicht gefunden
        </h2>

        <p style={{
          fontSize: "1.125rem",
          color: theme.textSec,
          lineHeight: 1.6,
          margin: "0 0 48px 0"
        }}>
          Die Seite, die Sie suchen, existiert nicht oder wurde verschoben.
        </p>

        <Link href="/" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          background: theme.primary,
          color: "#ffffff",
          padding: "16px 32px",
          borderRadius: "16px",
          fontSize: "1.125rem",
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: `0 8px 20px ${theme.primary}40`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          border: "none",
          cursor: "pointer"
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
            e.currentTarget.style.boxShadow = `0 12px 30px ${theme.primary}50`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = `0 8px 20px ${theme.primary}40`;
          }}>
          <Home size={20} />
          Zur Startseite
        </Link>
      </div>

      <style jsx global>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
