"use client";

import { motion } from "framer-motion";
import { Languages, Globe } from "lucide-react";
import { usePortfolioData } from "@/hooks/usePortfolioData";

const LanguagesSection = () => {
  const { data, loading } = usePortfolioData();
  const languages = data?.languages ?? [];
  const ui = data?.ui;

  if (loading) {
    return (
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">{ui?.loading ?? ""}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-start gap-4 mb-16 justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring" }}
            className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"
          >
            <Languages className="text-accent" size={24} />
          </motion.div>
          <div className="flex-1">
            <p className="text-accent font-medium tracking-wider uppercase text-sm leading-none">
              {ui?.languages?.label ?? ""}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-none mt-0">
              {ui?.languages?.title ?? ""}
            </h2>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-3xl blur opacity-30" />
            <div className="relative bg-gradient-to-br from-card/40 via-card/60 to-card/40 backdrop-blur-xl border border-accent/20 rounded-3xl p-8 shadow-lg">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {languages.map((lang, index) => (
                  <motion.div
                    key={lang.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group relative"
                  >
                    <div className="relative bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm border border-accent/10 rounded-2xl p-6 hover:border-accent/20 transition-all duration-300 hover:shadow-md">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-20 h-20">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="8"
                              className="text-secondary/20"
                            />
                            <motion.circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="url(#lang-grad)"
                              strokeWidth="8"
                              strokeLinecap="round"
                              initial={{ strokeDasharray: "0 251" }}
                              whileInView={{ strokeDasharray: `${(lang.proficiency / 100) * 251} 251` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, delay: 0.3 + index * 0.1 }}
                            />
                            <defs>
                              <linearGradient id="lang-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="hsl(var(--accent))" />
                                <stop offset="100%" stopColor="hsl(var(--accent) / 0.5)" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border border-accent/30">
                              <Globe className="text-accent" size={20} />
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-foreground mb-1">{lang.name}</p>
                          <p className="text-xs text-muted-foreground">{lang.level}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LanguagesSection;
