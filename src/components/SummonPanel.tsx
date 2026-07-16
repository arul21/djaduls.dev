"use client";

import { motion } from "framer-motion";
import { Mail, ScrollText } from "lucide-react";
import { contacts } from "@/lib/data";
import { GithubIcon, LinkedinIcon } from "./icons";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  mail: Mail,
  github: GithubIcon,
  linkedin: LinkedinIcon,
  scroll: ScrollText,
};

export default function SummonPanel() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-6 py-10">
      <h2 className="font-heading text-lg uppercase tracking-[0.3em] text-gold sm:text-xl">
        Summon the Champion
      </h2>
      <p className="max-w-md text-xs text-parchment/60 sm:text-sm">
        Got a project on the Rift that needs a Vanguard? Send a summon and
        let&apos;s ship something legendary together.
      </p>

      <div className="flex items-center justify-center gap-3">
        {contacts.map((contact, i) => {
          const Icon = ICONS[contact.icon] ?? Mail;
          return (
            <motion.a
              key={contact.label}
              href={contact.href}
              target={contact.href.startsWith("http") ? "_blank" : undefined}
              rel={
                contact.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              aria-label={contact.label}
              title={contact.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="clip-hex flex h-11 w-11 items-center justify-center bg-navy/60 text-parchment/70 ring-1 ring-gold-dim/40 transition-colors hover:bg-gold-dim/20 hover:text-gold-bright hover:ring-gold sm:h-12 sm:w-12"
            >
              <Icon className="h-5 w-5" />
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
