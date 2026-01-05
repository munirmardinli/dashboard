"use client";

import { useState, useEffect, useTransition } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolioData } from "@/hooks/usePortfolioData";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, startTransition] = useTransition();
  const { data } = usePortfolioData();
  const profile = data?.profile;
  const ui = data?.ui;

  const navItems = [
    { label: ui?.navigation?.about ?? "", href: ui?.navigation?.aboutHref ?? "" },
    { label: ui?.navigation?.projects ?? "", href: ui?.navigation?.projectsHref ?? "" },
    { label: ui?.navigation?.skills ?? "", href: ui?.navigation?.skillsHref ?? "" },
    { label: ui?.navigation?.experience ?? "", href: ui?.navigation?.experienceHref ?? "" },
    { label: ui?.navigation?.contact ?? "", href: ui?.navigation?.contactHref ?? "" },
    { label: ui?.navigation?.blog ?? "", href: ui?.navigation?.blogHref ?? "" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      startTransition(() => {
        setIsScrolled(window.scrollY > 50);
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [startTransition]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass py-4" : "py-6 bg-transparent"
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a
          href="#"
          className="font-display text-xl font-semibold text-foreground"
        >
          {profile?.name}
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item, index) => (
            <a
              key={`nav-${index}-${item.href}`}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label={ui?.navigation?.toggleMenu ?? ""}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 glass border-t border-border"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              {navItems.map((item, index) => (
                <a
                  key={`mobile-nav-${index}-${item.href}`}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navigation;
