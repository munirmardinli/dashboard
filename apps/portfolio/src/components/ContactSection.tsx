"use client";

import { useActionState, useOptimistic, useEffect, useRef, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { Mail, MapPin, Linkedin, Github, Send, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePortfolioData } from "@/hooks/usePortfolioData";

function createSubmitContactForm(ui?: PortfolioData["ui"]) {
  return async function submitContactForm(
    prevState: FormState | null,
    formData: FormData
  ): Promise<FormState> {
    const errorSend = ui?.contact?.messages?.errorSend ?? "";
    const genericError = ui?.contact?.messages?.errorGeneric ?? "";
    const successMessage = ui?.contact?.messages?.successMessage ?? "";

    try {
      const response = await fetch("https://formspree.io/f/xkgraakd", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || errorSend);
      }

      return {
        message: successMessage,
        success: true,
      };
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : genericError,
        success: false,
      };
    }
  };
}

function SubmitButton({ sendingText, sendText }: { sendingText?: string; sendText?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="relative"
          >
            <Loader2 size={18} className="text-accent-foreground" />
          </motion.div>
          {sendingText ?? ""}
        </>
      ) : (
        <>
          <Send size={18} />
          {sendText ?? ""}
        </>
      )}
    </Button>
  );
}

const ContactSection = () => {
  const { toast } = useToast();
  const { data, loading } = usePortfolioData();
  const contact = data?.contact;
  const ui = data?.ui;
  const [state, formAction] = useActionState(createSubmitContactForm(ui), null);
  const [optimisticState, addOptimistic] = useOptimistic(
    { name: "", email: "", message: "" },
    (state, newState: { name: string; email: string; message: string }) => newState
  );
  const [, startTransition] = useTransition();
  const prevStateRef = useRef<FormState | null>(null);

  useEffect(() => {
    if (state && prevStateRef.current?.success !== state.success) {
      if (state.success) {
        startTransition(() => {
          addOptimistic({ name: "", email: "", message: "" });
        });
        toast({
          title: ui?.contact?.messages?.successTitle ?? "",
          description: state.message,
        });
      } else {
        toast({
          title: ui?.contact?.messages?.errorTitle ?? "",
          description: state.message,
          variant: "destructive",
        });
      }
    }
    prevStateRef.current = state;
  }, [state, toast, addOptimistic, startTransition]);

  if (loading || !contact) {
    return (
      <section id="contact" className="py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">{contact?.loading ?? ""}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
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
            <MessageSquare className="text-accent" size={24} />
          </motion.div>
          <div className="flex-1">
            <p className="text-accent font-medium tracking-wider uppercase text-sm leading-none">
              {ui?.contact?.title ?? ""}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-none mt-0">
              {ui?.contact?.subtitle ?? ""}
            </h2>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-3xl blur opacity-30" />
            <div className="relative bg-gradient-to-br from-card/40 via-card/60 to-card/40 backdrop-blur-xl border border-accent/20 rounded-3xl p-8 shadow-lg">
              <div className="grid lg:grid-cols-2 gap-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                    {ui?.contact?.contactInfo ?? ""}
                  </h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    {ui?.contact?.description ?? ""}
                  </p>

                  <div className="space-y-4 mb-8">
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-4 text-foreground hover:text-accent transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/20 transition-colors">
                        <Mail size={20} className="text-accent" />
                      </div>
                      <span>{contact.email}</span>
                    </a>

                    <div className="flex items-center gap-4 text-foreground">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                        <MapPin size={20} className="text-accent" />
                      </div>
                      <span>{contact.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <a
                      href={contact.social.linkedin}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center hover:from-accent/30 hover:to-accent/20 hover:text-accent-foreground transition-colors"
                      aria-label={ui?.contact?.ariaLabels?.linkedin ?? ""}
                    >
                      <Linkedin size={20} className="text-accent" />
                    </a>
                    <a
                      href={contact.social.github}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center hover:from-accent/30 hover:to-accent/20 hover:text-accent-foreground transition-colors"
                      aria-label={ui?.contact?.ariaLabels?.github ?? ""}
                    >
                      <Github size={20} className="text-accent" />
                    </a>
                    <a
                      href={`mailto:${contact.email}`}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center hover:from-accent/30 hover:to-accent/20 hover:text-accent-foreground transition-colors"
                      aria-label={ui?.contact?.ariaLabels?.email ?? ""}
                    >
                      <Mail size={20} className="text-accent" />
                    </a>
                  </div>
                </motion.div>
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  action={(formData) => {
                    const data = {
                      name: formData.get("name") as string,
                      email: formData.get("email") as string,
                      message: formData.get("message") as string,
                    };
                    addOptimistic(data);
                    formAction(formData);
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {ui?.contact?.form?.name ?? ""}
                    </label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={optimisticState.name}
                      placeholder={ui?.contact?.form?.namePlaceholder ?? ""}
                      required
                      className="bg-background/60 backdrop-blur-sm border-accent/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {ui?.contact?.form?.email ?? ""}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={optimisticState.email}
                      placeholder={ui?.contact?.form?.emailPlaceholder ?? ""}
                      required
                      className="bg-background/60 backdrop-blur-sm border-accent/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {ui?.contact?.form?.message ?? ""}
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      defaultValue={optimisticState.message}
                      placeholder={ui?.contact?.form?.messagePlaceholder ?? ""}
                      rows={5}
                      required
                      className="bg-background/60 backdrop-blur-sm border-accent/10 resize-none"
                    />
                  </div>

                  <SubmitButton
                    sendingText={ui?.contact?.form?.sending}
                    sendText={ui?.contact?.form?.send}
                  />
                </motion.form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
