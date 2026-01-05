"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";
import { usePortfolioData } from "@/hooks/usePortfolioData";

const InternshipSection = () => {
  const { data, loading } = usePortfolioData();
  const internships = data?.internships ?? [];
  const ui = data?.ui;

  if (loading) {
    return (
      <section id="internships" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">{ui?.loading ?? ""}</div>
        </div>
      </section>
    );
  }

  if (!internships || internships.length === 0) {
    return null;
  }

  return (
    <section id="internships" className="py-24 relative overflow-hidden">
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
            <Briefcase className="text-accent" size={24} />
          </motion.div>
          <div className="flex-1">
            <p className="text-accent font-medium tracking-wider uppercase text-sm leading-none">
              {ui?.internships?.label ?? ""}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-none mt-0">
              {ui?.internships?.title ?? ""}
            </h2>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {internships.map((internship, index) => (
            <motion.div
              key={internship.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm border border-accent/10 rounded-2xl p-6 hover:border-accent/20 transition-all duration-300 hover:shadow-md h-full">
                <div className="absolute -inset-2 bg-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md"
                    >
                      <Calendar className="text-accent-foreground" size={18} />
                    </motion.div>
                    <span className="text-xs font-medium text-accent">
                      {internship.period}
                    </span>
                  </div>

                  <p className="text-foreground text-sm leading-relaxed">
                    {internship.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InternshipSection;
