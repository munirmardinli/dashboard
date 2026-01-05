"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Tag, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogData";

function countWords(htmlContent: string): number {
  const textContent = htmlContent.replace(/<[^>]*>/g, " ");
  const cleanedText = textContent.replace(/\s+/g, " ").trim();
  const words = cleanedText.split(" ").filter(word => word.length > 0 && /[a-zA-ZäöüÄÖÜß]/.test(word));
  return words.length;
}

function calculateReadTime(wordCount: number): string {
  const WORDS_PER_MINUTE = 200;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  return `${minutes} min`;
}

function processLinks(htmlContent: string): string {
  return htmlContent.replace(
    /<a\s+([^>]*\s+)?href=["']([^"']+)["']([^>]*)>/gi,
    (match, before, href, after) => {
      const isExternal = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");

      const allAttrs = `${before || ""} ${after || ""}`.trim();

      const classMatch = allAttrs.match(/class=["']([^"']+)["']/i);
      let classes = "text-accent hover:text-accent/80 transition-colors";
      if (classMatch) {
        classes = `${classMatch[1]} ${classes}`;
      }

      let newAttrs = allAttrs.replace(/class=["'][^"']*["']/i, "");
      newAttrs = `class="${classes}" ${newAttrs}`.trim();

      if (isExternal) {
        if (!newAttrs.includes('target=')) {
          newAttrs += ' target="_blank"';
        }
        if (!newAttrs.includes('rel=')) {
          newAttrs += ' rel="noopener noreferrer"';
        }
      }

      return `<a ${newAttrs} href="${href}">`;
    }
  );
}

function BlogContent() {
  const { posts, loading } = useBlogPosts();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    const postId = searchParams.get("id");
    if (postId && posts && posts.length > 0) {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        setSelectedPost(post);
      } else {
        setSelectedPost(null);
      }
    } else {
      setSelectedPost(null);
    }
  }, [searchParams, posts, mounted, loading]);

  const handlePostClick = (post: BlogPost) => {
    router.push(`/blog?id=${post.id}`);
  };

  const handleBackToList = () => {
    router.push("/blog");
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <p className="text-muted-foreground text-center">Laden...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <p className="text-muted-foreground text-center">Keine Blog-Posts gefunden.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">

          {selectedPost ? (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <button
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft size={20} />
                <span>Zurück zur Blog-Übersicht</span>
              </button>

              <div className="glass rounded-2xl p-8 md:p-12">
                {selectedPost.image && (
                  <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden">
                    <Image
                      src={selectedPost.image}
                      alt={selectedPost.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                    <Tag size={14} />
                    {selectedPost.category}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                  {selectedPost.title}
                </h1>

                {selectedPost.description && (
                  <p className="text-lg text-muted-foreground mb-8">
                    {selectedPost.description}
                  </p>
                )}

                <div className="flex items-center gap-6 text-muted-foreground mb-8 pb-8 border-b border-border flex-wrap">
                  {selectedPost.metadata?.author && (
                    <div className="flex items-center gap-2">
                      {selectedPost.metadata.author.src && (
                        <Image
                          src={selectedPost.metadata.author.src}
                          alt={selectedPost.metadata.author.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {selectedPost.metadata.author.name}
                        </span>
                        {selectedPost.metadata.author.role && (
                          <span className="text-xs text-muted-foreground">
                            {selectedPost.metadata.author.role}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedPost.metadata?.date && (
                    <span className="flex items-center gap-2">
                      <Calendar size={18} />
                      {new Date(selectedPost.metadata.date).toLocaleDateString("de-DE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {selectedPost.content && (
                    <span className="flex items-center gap-2">
                      <Clock size={18} />
                      {calculateReadTime(countWords(selectedPost.content))} Lesezeit
                    </span>
                  )}
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedPost.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className="prose prose-lg dark:prose-invert max-w-none text-justify"
                  dangerouslySetInnerHTML={{ __html: processLinks(selectedPost.content) }}
                />
              </div>
            </motion.article>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="glass rounded-2xl overflow-hidden h-full hover-lift transition-all duration-300 hover:border-accent/30">
                      {post.image && (
                        <div className="relative w-full h-48 overflow-hidden">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                            <Tag size={14} />
                            {post.category}
                          </span>
                        </div>

                        <h2 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors">
                          {post.title}
                        </h2>

                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {post.metadata?.date && (
                            <span className="flex items-center gap-1.5">
                              <Calendar size={14} />
                              {new Date(post.metadata.date).toLocaleDateString("de-DE", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                          {post.content && (
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} />
                              {calculateReadTime(countWords(post.content))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    }>
      <BlogContent />
    </Suspense>
  );
}
