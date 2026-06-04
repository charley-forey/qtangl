import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DeadlineTimeline from "@/components/marketing/DeadlineTimeline";
import MoscaCalculator from "@/components/marketing/MoscaCalculator";
import QDayArticlePage from "@/components/marketing/QDayArticlePage";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import JsonLd from "@/components/seo/JsonLd";
import {
  getQDayArticle,
  qDayArticles,
  type QDayArticleSlug,
} from "@/lib/copy/readiness-qday-hub";
import { buildFaqJsonLd, buildPageMetadata } from "@/lib/seo";

const hndlFaqs = [
  {
    question: "Is my encryption broken today?",
    answer:
      "No. Quantum-vulnerable algorithms like RSA and ECDSA still protect data today. HNDL is about ciphertext captured now that may be decrypted after a future CRQC arrives.",
  },
  {
    question: "Who faces the highest HNDL exposure?",
    answer:
      "Organizations holding data with long confidentiality requirements — healthcare records, financial archives, government data — especially when migration takes five to ten years.",
  },
  {
    question: "How is encrypted data harvested without breaking crypto?",
    answer:
      "Adversaries copy ciphertext via breach exfiltration, backups and archives, cloud misconfiguration, and bulk network collection. Storage is cheap; breaking RSA today is not required.",
  },
  {
    question: "Does TLS 1.3 protect me from HNDL?",
    answer:
      "TLS 1.3 forward secrecy limits passive decryption, but stored handshakes with ECDH remain vulnerable to future quantum attacks. Long-retention archives and backups are still primary HNDL targets.",
  },
  {
    question: "Are my backups an HNDL risk?",
    answer:
      "Yes, if backups contain ciphertext encrypted with quantum-vulnerable public-key algorithms and must stay confidential for years. Backup exfiltration is a common ransomware and breach path.",
  },
  {
    question: "Is AES-256 still safe?",
    answer:
      "Symmetric encryption like AES-256 is not the primary HNDL concern. Harvest-now-decrypt-later targets public-key layers — RSA, ECDSA, ECDH — that wrap keys or protect long-lived archives.",
  },
  {
    question: "What is the first step to reduce HNDL risk?",
    answer:
      "Run a cryptographic inventory, quantify data shelf-life against migration runway using Mosca's inequality, and begin phased post-quantum migration with evidence.",
  },
  {
    question: "Can migration undo already-harvested ciphertext?",
    answer:
      "No. Migration protects new data and future sessions. Ciphertext copied before you finish migrating may still be decryptable after Q-Day if Mosca inequality held when it was captured.",
  },
  {
    question: "What does Qtangl do about HNDL?",
    answer:
      "Qtangl scores Mosca HNDL exposure per asset, maps findings to compliance frameworks, exports CycloneDX CBOM, and provides signed verify links. Inventory aid, not formal audit.",
  },
  {
    question: "When should boards act on HNDL?",
    answer:
      "When data shelf-life plus migration time exceeds the quantum timeline (X + Y > Z). For healthcare and finance, that inequality often holds today — before Q-Day headlines.",
  },
] as const;

type QDayArticleRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(qDayArticles).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: QDayArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getQDayArticle(slug);
  if (!article) {
    return {};
  }

  return buildPageMetadata({
    path: `/q-day/${slug}`,
    title: article.metadata.title,
    description: article.metadata.description,
    image: `/q-day/${slug}/opengraph-image`,
  });
}

export default async function QDayArticleRoute({ params }: QDayArticleRouteProps) {
  const { slug } = await params;
  const article = getQDayArticle(slug);
  if (!article) {
    notFound();
  }

  return (
    <PageShell>
      <QDayArticlePage slug={slug} />
      {slug === "hndl" ? <JsonLd data={buildFaqJsonLd(hndlFaqs)} /> : null}
      {slug === "mosca-inequality" ? (
        <Section gap="tight" className="pb-0">
          <MoscaCalculator />
        </Section>
      ) : null}
      {slug === "deadlines" ? (
        <Section gap="tight" className="pb-0">
          <DeadlineTimeline />
        </Section>
      ) : null}
    </PageShell>
  );
}

export type { QDayArticleSlug };
