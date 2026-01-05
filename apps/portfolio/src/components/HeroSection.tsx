"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { generatePDF } from "@/lib/generatePDF";
import CVView from "./CVView";

const HeroSection = () => {
  const { data, loading } = usePortfolioData();
  const profile = data?.profile;
  const traits = data?.traits ?? [];
  const ui = data?.ui;
  const [, startTransition] = useTransition();
  const [currentTraitIndex, setCurrentTraitIndex] = useState(0);

  const isLoading = loading;

  useEffect(() => {
    if (traits.length === 0) return;

    const interval = setInterval(() => {
      startTransition(() => {
        setCurrentTraitIndex((prev) => (prev + 1) % traits.length);
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [traits.length, startTransition]);

  return (
    <section
      id="about"
      className="min-h-screen flex items-center justify-center pt-24 pb-16 relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="hidden lg:flex order-2 lg:order-1 justify-center lg:justify-start"
          >
            <div className="relative group">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-accent/15 via-transparent to-accent/15 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
              />

              <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-3xl bg-gradient-to-br from-secondary via-card to-secondary overflow-hidden border border-border/50 shadow-lg">
                <Image
                  src={profile?.image ?? "/assets/profile-photo.jpg"}
                  width={384}
                  height={384}
                  priority
                  alt={profile?.name ?? ""}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </div>

              <div className="absolute -z-10 -bottom-3 -right-3 w-full h-full rounded-3xl border-2 border-accent/20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2 leading-tight">
              {ui?.hero?.greeting ?? ""}
            </h1>

            <div className="h-16 md:h-20 lg:h-24 mb-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentTraitIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                  className="block text-4xl md:text-5xl lg:text-6xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent to-accent/70"
                >
                  {isLoading ? "..." : traits[currentTraitIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl"
            >
              {isLoading ? (ui?.loading ?? "") : (profile?.bio ?? "")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shadow-md hover:shadow-lg transition-all duration-300"
                onClick={generatePDF}
              >
                <Download size={18} />
                {ui?.hero?.downloadCV ?? ""}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-border/50 hover:border-accent/50 hover:bg-accent/5"
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {ui?.hero?.contactMe ?? ""}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <div id="cv-print-content" style={{ display: 'none' }}>
          <CVView />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="hidden lg:flex justify-center mt-20"
        >
          <a
            href="#projects"
            className="group flex flex-col items-center text-muted-foreground hover:text-accent transition-colors"
          >
            <span className="text-xs mb-2 tracking-wider uppercase">{ui?.hero?.learnMore ?? ""}</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-8 h-12 rounded-full border-2 border-current flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-3 rounded-full bg-current"
              />
            </motion.div>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
