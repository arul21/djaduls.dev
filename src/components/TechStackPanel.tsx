"use client";

import { motion } from "framer-motion";
import { TECH_STACK } from "@/lib/tech-stack";
import { iconFill } from "@/lib/icon-fill";

export default function TechStackPanel() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h2 className="text-center font-heading text-lg uppercase tracking-[0.3em] text-gold sm:text-xl">
        Tech Stack
      </h2>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
        {TECH_STACK.map((tech, i) => (
          <motion.div
            key={tech.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="hextech-border flex flex-col items-center gap-2 bg-navy/40 px-2 py-4 transition-shadow hover:gold-glow"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold-dim/50 bg-navy sm:h-12 sm:w-12">
              <svg
                viewBox="0 0 24 24"
                fill={iconFill(tech.hex)}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <path d={tech.path} />
              </svg>
            </div>
            <span className="text-center text-[10px] uppercase tracking-wider text-parchment/70 sm:text-xs">
              {tech.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
