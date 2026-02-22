"use client";

import { useThemeStore } from "@/stores/themeStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { getTheme } from "@/utils/theme";
import Link from "next/link";
import { useRouter } from 'next/navigation'
import Image from "next/image";
import { useEffect, useState } from "react";
import { useI18nStore } from "@/stores/i18nStore";
import { ConfigAPI } from "@/utils/api";

export default function Root() {
  const mode = useThemeStore((state) => state.mode);
  const activePath = useSidebarStore((state) => state.activePath);
  const theme = getTheme(mode);
  const router = useRouter();
  const [dashboardUrl, setDashboardUrl] = useState("/q/?view=privateTodos");
  const [onboardingFeatures, setOnboardingFeatures] = useState<OnboardingFeature[]>([]);

  const { t } = useI18nStore();

  useEffect(() => {
    if (activePath) {
      setDashboardUrl(activePath);
    }
  }, [activePath]);

  useEffect(() => {
    ConfigAPI.getOnboardingConfig().then(setOnboardingFeatures);
  }, []);

  console.log(onboardingFeatures);
  return (
    <div style={{
      minHeight: "100vh",
      background: theme.bg,
      color: theme.text,
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 20px"
    }}>
      <div style={{ marginTop: "120px", textAlign: "center", maxWidth: "800px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px", animation: "fadeInUp 0.6s ease-out" }}>
          <Image src="/dashboard.png" alt="Logo" width={80} height={80} priority />
        </div>

        <h1 style={{
          fontSize: "3.5rem",
          fontWeight: 800,
          margin: "0 0 24px 0",
          background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.2,
          animation: "fadeInUp 0.6s ease-out 0.1s backwards"
        }}>
          {t("ui.managementDashboard")}
        </h1>

        <p style={{
          fontSize: "1.25rem",
          color: theme.textSec,
          lineHeight: 1.6,
          margin: "0 0 48px 0",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto",
          animation: "fadeInUp 0.6s ease-out 0.2s backwards"
        }}>
          {t("ui.managementDashboardDescription")}
        </p>

        <div
          role="link"
          onClick={() => router.push(dashboardUrl)}
          onKeyDown={(e) => e.key === "Enter" && router.push(dashboardUrl)}
          tabIndex={0}
          style={{
            display: "inline-block",
            background: theme.primary,
            color: "#ffffff",
            padding: "16px 48px",
            borderRadius: "16px",
            fontSize: "1.125rem",
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: `0 8px 20px ${theme.primary}40`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "none",
            cursor: "pointer",
            animation: "fadeInUp 0.6s ease-out 0.3s backwards"
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = `0 12px 30px ${theme.primary}50`;
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `0 8px 20px ${theme.primary}40`;
          }}>
          {t("ui.openDashboard")}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        maxWidth: "1200px",
        width: "100%",
        marginTop: "120px",
        marginBottom: "80px"
      }}>
        {onboardingFeatures.map((feature: OnboardingFeature, index: number) => (
          <div key={index} tabIndex={0} onClick={() => router.push(feature.link)} style={{ textDecoration: 'none' }} role="link" onKeyDown={(e) => e.key === "Enter" && router.push(feature.link)}>
            <div style={{
              background: theme.paper,
              padding: "32px",
              borderRadius: "24px",
              border: `1px solid ${theme.divider}`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
              animation: `fadeInUp 0.6s ease-out ${0.4 + index * 0.1}s backwards`,
              color: theme.text
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                e.currentTarget.style.boxShadow = `0 20px 40px ${theme.primary}15`;
                e.currentTarget.style.borderColor = theme.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = theme.divider;
              }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "16px", transition: "transform 0.3s ease" }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 8px 0", color: theme.text }}>
                {feature.title}
              </h3>
              <p style={{ margin: 0, color: theme.textSec, lineHeight: 1.5 }}>
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: "auto",
        padding: "40px 0",
        color: theme.textSec,
        fontSize: "0.875rem",
        borderTop: `1px solid ${theme.divider}`,
        width: "100%",
        textAlign: "center"
      }}>
        <p>{t("ui.footer")}</p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
