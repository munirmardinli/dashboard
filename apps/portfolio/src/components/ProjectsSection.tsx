"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github, FolderOpen, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import Image from "next/image";

const ProjectsSection = () => {
  const { data, loading } = usePortfolioData();
  const projects = data?.projects ?? [];
  const ui = data?.ui;

  if (loading) {
    return (
      <section id="projects" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">{ui?.loading ?? ""}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
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
              {ui?.projects?.label ?? ""}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-none mt-0">
              {ui?.projects?.title ?? ""}
            </h2>
          </div>
        </motion.div>

        <div className="relative max-w-7xl mx-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-3xl blur opacity-30"></div>
          <div className="relative bg-gradient-to-br from-card/40 via-card/60 to-card/40 backdrop-blur-xl border border-accent/20 rounded-3xl p-8 shadow-lg">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="group relative"
                >
                  <div className="relative bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm border border-accent/10 rounded-2xl overflow-hidden hover:border-accent/20 transition-all duration-300 hover:shadow-md">
                    <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/30 relative overflow-hidden">
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderOpen size={48} className="text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        {project.repoUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 flex-1"
                            asChild
                          >
                            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                              <Github size={16} />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.demoUrl && (
                          <Button
                            size="sm"
                            className="gap-2 flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                            asChild
                          >
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={16} />
                              {ui?.projects?.demo ?? ""}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
