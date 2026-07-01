import React from 'react';
import Link from 'next/link';

export default function MethodologyPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold underline text-brand hover:text-brand/80">
          ← Back to Command Center
        </Link>
      </div>

      <article className="space-y-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
          How ScamWatch Works
        </h1>
        <p className="text-sm text-text-muted">
          Our methodology is designed to prioritize public trust, accuracy, and explanation before warning.
        </p>

        <hr className="border-border" />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-text">1. Universal Ingestion Pipeline</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Every submission is wrapped in a canonical `IntelligenceObject` (such as Email, Domain, URL, or Phone number). We run Unicode normalization (NFC/NFKC) to resolve confusable characters (homoglyphs) used by scammers to bypass security checkers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-text">2. RAG Classification & Dampening</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            We use Retrieval-Augmented Generation (RAG) to compare incoming text against the database of historical verified report embeddings.
            To avoid exaggerating threats, if the match similarity falls below a cosine similarity threshold of 0.3, a dampening factor of 0.7 is applied, and the engine triggers an abstain rule if it falls below {"\\theta_{\\text{abstain}} = 0.45"}.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-text">3. Multi-Dimensional Confidence</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Instead of presenting simple, ungrounded AI predictions, confidence is calibrated across five pillars:
          </p>
          <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
            <li><strong>AI Model Accuracy</strong>: The classification confidence reported by the LLM.</li>
            <li><strong>Evidence Density</strong>: The volume of unique entities matched.</li>
            <li><strong>Community Volume</strong>: The count of individual user report submissions.</li>
            <li><strong>Historical Reputation</strong>: The baseline risk rating of the source domains/nodes.</li>
            <li><strong>Official Verification</strong>: Status of matches against verified official databases.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-text">4. Leaf-Only Explanations</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            To prevent system prompt leaks or hallucinations, the explanation you see is generated strictly by compiling the leaf nodes of the reasoning tree. No arbitrary summaries are presented.
          </p>
        </section>
      </article>
    </div>
  );
}
