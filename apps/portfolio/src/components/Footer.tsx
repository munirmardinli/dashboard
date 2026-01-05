"use client";

import { usePortfolioData } from "@/hooks/usePortfolioData";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { data } = usePortfolioData();
  const profile = data?.profile;
  const ui = data?.ui;

  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {profile?.name ?? ""}. {ui?.footer?.rights ?? ""}
          </p>
          <p className="text-sm text-muted-foreground">
            {ui?.footer?.created ?? ""}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
