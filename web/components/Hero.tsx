"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { hero, siteMetadata } from "@/lib/constants";

export default function Hero() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300/80">
          {hero.eyebrow}
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {hero.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          {siteMetadata.tagline}
        </p>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
          {hero.description}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={hero.primaryCta.href}
            className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:text-cyan-100"
          >
            {hero.secondaryCta.label}
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {hero.valueProps.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300"
            >
              {item}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.22),transparent_60%)] blur-3xl" />
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_80px_rgba(8,15,29,0.45)]">
          <Image
            src="/qtangl_banner.png"
            alt="Qtangl optimization concept diagram"
            width={1024}
            height={472}
            className="w-full rounded-[1.5rem] border border-white/10 bg-white object-cover"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
}
