"use client";

import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import ExperienceSection from "@/components/ExperienceSection";
import EducationSection from "@/components/EducationSection";
import InternshipSection from "@/components/InternshipSection";
import LanguagesSection from "@/components/LanguagesSection";
import HobbiesSection from "@/components/HobbiesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { useSystemTheme } from "@/hooks/useSystemTheme";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useEffect, useTransition } from "react";

export default function Home() {
  useSystemTheme();
  const { data } = usePortfolioData();
  const profile = data?.profile;
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (profile?.name) {
      startTransition(() => {
        document.title = `${profile.name} – Portfolio`;
      });
    }
  }, [profile?.name, startTransition]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <ProjectsSection />
        <SkillsSection />
        <LanguagesSection />
        <HobbiesSection />
        <ExperienceSection />
        <EducationSection />
        <InternshipSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
