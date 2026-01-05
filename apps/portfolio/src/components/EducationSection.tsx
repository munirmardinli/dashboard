"use client";

import { motion } from "framer-motion";
import { GraduationCap, Calendar } from "lucide-react";
import { usePortfolioData } from "@/hooks/usePortfolioData";

const EducationSection = () => {
  const { data, loading } = usePortfolioData();
  const education = data?.education ?? [];
  const ui = data?.ui;

  if (loading) {
    return (
      <section id="education" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">{ui?.loading ?? ""}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="education" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-start gap-4 mb-16 justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring" }}
            className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"
          >
            <GraduationCap className="text-accent" size={24} />
          </motion.div>
          <div className="flex-1">
            <p className="text-accent font-medium tracking-wider uppercase text-sm leading-none">
              {ui?.education?.label ?? ""}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-none mt-0">
              {ui?.education?.title ?? ""}
            </h2>
          </div>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-accent/50 to-accent hidden md:block" />

          <div className="space-y-8">
            {education.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative pl-8 md:pl-12"
              >
                <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-accent shadow-md ring-4 ring-background hidden md:block" />

                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-xl" />

                  <div className="relative bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm border border-accent/10 rounded-2xl p-6 hover:border-accent/20 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md"
                      >
                        <Calendar className="text-accent-foreground" size={20} />
                      </motion.div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                        {edu.period}
                      </span>
                    </div>

                    <p className="text-foreground leading-relaxed">
                      {edu.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
