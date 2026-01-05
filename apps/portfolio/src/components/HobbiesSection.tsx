"use client";

import { motion } from "framer-motion";
import { Code, BookOpen, Bike, Waves, Music, Mountain, Heart, LucideIcon } from "lucide-react";
import { usePortfolioData } from "@/hooks/usePortfolioData";

const iconMap: Record<string, LucideIcon> = {
  code: Code,
  autoStories: BookOpen,
  directionsBike: Bike,
  pool: Waves,
  libraryMusic: Music,
  hiking: Mountain,
};

const HobbiesSection = () => {
  const { data, loading } = usePortfolioData();
  const hobbies = data?.hobbies ?? [];
  const ui = data?.ui;

  if (loading) {
    return (
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">{ui?.loading ?? ""}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent/3 rounded-full blur-3xl" />
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
            <Heart className="text-accent" size={24} />
          </motion.div>
          <div className="flex-1">
            <p className="text-accent font-medium tracking-wider uppercase text-sm leading-none">
              {ui?.hobbies?.label ?? ""}
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-none mt-0">
              {ui?.hobbies?.title ?? ""}
            </h2>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-3xl blur opacity-30" />
            <div className="relative bg-gradient-to-br from-card/40 via-card/60 to-card/40 backdrop-blur-xl border border-accent/20 rounded-3xl p-8 shadow-lg">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {hobbies.map((hobby, index) => {
                  const IconComponent = iconMap[hobby.icon];

                  return (
                    <motion.div
                      key={hobby.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 200
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="group relative"
                    >
                      <div className="relative bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm border border-accent/10 rounded-2xl p-6 hover:border-accent/20 transition-all duration-300 hover:shadow-md">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:from-accent/25 group-hover:to-accent/15 transition-all duration-300">
                            {IconComponent && (
                              <IconComponent size={28} className="text-accent" />
                            )}
                          </div>
                          <p className="text-xs font-semibold text-foreground text-center leading-tight">
                            {hobby.name}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HobbiesSection;
