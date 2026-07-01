import React, { Suspense } from 'react';
import type { Metadata } from 'next';

import SearchBar from '@/components/ui/SearchBar';
import VerdictCard from '@/components/ui/VerdictCard';
import VerificationCallout from '@/components/ui/VerificationCallout';
import EntityChip from '@/components/ui/EntityChip';
import SearchContextSelector from './SearchContextSelector';
import SearchActions from './SearchActions';
import { lookup } from '@/shared/search/lookup';
import { extractEntitiesHybrid } from '@/shared/entities/extractEntitiesHybrid';
import { generateExplanation } from '@/shared/search/explain';
import { generateRecommendations } from '@/shared/search/recommend';

export const metadata: Metadata = {
  title: 'Search Results — ScamWatch',
  description: 'Calibrated assessment of a link, phone number, email, or message.',
};

function getRiskLevel(verdict: string): { label: 'Low' | 'Medium' | 'High' | 'Unknown'; color: string } {
  switch (verdict) {
    case 'Likely Safe':
      return { label: 'Low', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    case 'Use Caution':
      return { label: 'Medium', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    case 'Likely Scam':
    case 'Confirmed Reported Scam':
      return { label: 'High', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    default:
      return { label: 'Unknown', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lose_money?: string; share_pii?: string }>;
}): Promise<React.JSX.Element> {
  const { q, lose_money, share_pii } = await searchParams;
  const query = (q ?? '').trim();
  const isDemo = !query;

  const loseMoney = lose_money === 'true';
  const sharePii = share_pii === 'true';

  let result = null;
  let explanation = null;
  let recommendations = null;
  let riskInfo = null;
  let extracted: { type: string; canonical_value: string }[] = [];

  if (!isDemo) {
    result = await lookup(query);
    if (result) {
      explanation = generateExplanation(
        result.verdict,
        result.query,
        result.entityType,
        result.abstained
      );
      recommendations = generateRecommendations(
        result.verdict,
        result.entityType,
        { did_lose_money: loseMoney, did_share_pii: sharePii }
      );
      riskInfo = getRiskLevel(result.verdict);
      extracted = await extractEntitiesHybrid(query);
    }
  } else {
    // Provide a mocked result for the demo scan
    result = {
      query: 'sunpass-toll-fees.com',
      entityType: 'url' as const,
      verdict: 'Confirmed Reported Scam' as const,
      confidence: 0.95,
      reportCount: 48,
      relatedThreats: [{ slug: 'FL-001', title: 'SunPass Toll Text Scam Alert (Smishing)' }],
      abstained: false,
    };
    explanation = {
      text: 'This domain (sunpass-toll-fees.com) closely matches verified smishing campaigns impersonating the Florida SunPass toll agency. Senders request payment for fake unpaid toll balances (frequently $4.15) to harvest consumer credit card details.',
      citations: [
        { raw_value: 'sunpass-toll-fees.com', resolved_label: 'SunPass Smishing Campaign Indicator' }
      ]
    };
    recommendations = {
      verify: [
        { action: 'Official SunPass Portal', url: 'https://www.sunpass.com', org: 'SunPass' },
        { action: 'File FTC Fraud Report', url: 'https://reportfraud.ftc.gov', org: 'FTC' }
      ],
      protect: [
        { step: 'Do not click links in SMS messages from unrecognized senders.', urgency: 'high' as const },
        { step: 'If you entered payment info, contact your card issuer immediately to freeze your card.', urgency: 'high' as const },
        { step: 'Forward suspicious texts to carrier spam reporting line (7726).', urgency: 'medium' as const }
      ]
    };
    riskInfo = { label: 'High' as const, color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    extracted = [{ type: 'url', canonical_value: 'sunpass-toll-fees.com' }];
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8 print:p-0 print:m-0">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-text mb-4">Know Before You Click</h1>
        <SearchBar defaultValue={query} />
      </div>

      {isDemo && (
        <div className="p-4 bg-surface border border-border rounded-md space-y-2 print:hidden">
          <h2 className="text-sm font-bold text-brand uppercase tracking-wider">Demo Scan Report</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Below is a sample scan report illustrating how the Sentinel Intelligence Engine evaluates a suspicious indicator. Try pasting a link, message, or phone number above to run a live scan.
          </p>
        </div>
      )}

      {result ? (
        <div className="space-y-8">
          {/* Beta Mode Disclaimer Banner */}
          <div className="p-3 bg-brand/10 border border-brand/20 rounded-md text-xs text-text-muted flex items-center justify-between print:hidden">
            <span>🛡️ <strong>Beta Evaluation Mode:</strong> Showing simulated confidence calibrations and threat checks. No signal constitutes a guarantee of safety.</span>
            <span className="badge-pill bg-brand/20 text-brand text-[9px] uppercase font-bold">Beta</span>
          </div>

          {/* Submitter Context Selectors */}
          <div className="print:hidden">
            <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-surface-muted border border-border" />}>
              <SearchContextSelector />
            </Suspense>
          </div>

          {/* Verdict Indicator & Risk Level */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                <span>Checked:</span>
                {result.entityType === 'text' ? (
                  <span className="text-text font-mono">“{result.query}”</span>
                ) : (
                  <EntityChip type={result.entityType} value={result.query} />
                )}
              </div>
              {riskInfo && (
                <div className={`px-3 py-1 rounded border text-xs font-bold uppercase tracking-wider ${riskInfo.color}`}>
                  Risk Level: {riskInfo.label}
                </div>
              )}
            </div>

            <VerdictCard
              verdict={result.verdict}
              confidence={result.confidence}
              subject={result.query}
            >
              {result.reportCount > 0
                ? `${result.reportCount} community report(s) mention this indicator.`
                : 'No community reports yet. The read below is a calibrated estimate, not a guarantee.'}
            </VerdictCard>
          </div>

          {/* Detected Indicators */}
          {extracted.length > 0 && (
            <section className="rounded-lg border border-border bg-surface p-5 space-y-3">
              <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Detected Indicators</h2>
              <div className="flex flex-wrap gap-2">
                {extracted.map((e, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-background text-xs font-mono"
                  >
                    <span className="text-text-subtle font-sans text-[10px] uppercase font-bold">{e.type}:</span>
                    <span className="text-text font-semibold">{e.canonical_value}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Grounded Explanation Panel */}
          {explanation && (
            <section className="rounded-lg border border-border bg-surface p-5 space-y-3">
              <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Analysis Explanation</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {explanation.text}
              </p>
              {explanation.citations.length > 0 && (
                <div className="border-t border-border/40 pt-3 space-y-1.5">
                  <p className="text-xs font-bold text-text uppercase">Identified Infrastructure Matches:</p>
                  <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
                    {explanation.citations.map((c: { raw_value: string; resolved_label: string }, idx: number) => (
                      <li key={idx}>
                        Flagged entity: <span className="font-mono text-text">{c.raw_value}</span> identified as {c.resolved_label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Calibrated Confidence explanation */}
          <section className="rounded-lg border border-border bg-surface p-5 space-y-2">
            <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Confidence Metrics Calibration</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Confidence is evaluated at <strong>{(result.confidence * 100).toFixed(0)}%</strong>. This score combines LLM zero-shot classification, similarity matches against verified historical scams, and official warnings database integrations.
            </p>
          </section>

          {/* Recovery Checklists & Actions */}
          {recommendations && (
            <div className="space-y-6">
              {/* Verify Bucket */}
              {recommendations.verify.length > 0 && (
                <section className="rounded-lg border border-border bg-surface p-5 space-y-3">
                  <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Verify &amp; Official Reporting</h2>
                  <p className="text-xs text-text-muted">
                    We recommend routing details to these official agencies to help prevent further fraud:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {recommendations.verify.map((v) => (
                      <a
                        key={v.url}
                        href={v.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded border border-border bg-background hover:bg-hover text-text print:hidden"
                      >
                        {v.action} ({v.org}) ↗
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Protect Bucket */}
              {recommendations.protect.length > 0 && (
                <section className="rounded-lg border border-border bg-surface p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Immediate Mitigation Steps</h2>
                  <div className="space-y-3">
                    {recommendations.protect.map((p, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          className="h-4 w-4 mt-1 rounded border-border text-brand focus:ring-brand print:hidden"
                        />
                        <div className="space-y-1">
                          <p className="text-xs text-text font-medium">{p.step}</p>
                          <span
                            className={`inline-block text-[9px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded ${
                              p.urgency === 'high'
                                ? 'bg-red-500/10 text-red-500'
                                : p.urgency === 'medium'
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-green-500/10 text-green-500'
                            }`}
                          >
                            {p.urgency} Priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Action buttons (Print, Share, Save) */}
          <SearchActions />

          <div className="print:hidden">
            <VerificationCallout />
          </div>
        </div>
      ) : (
        <p className="mt-8 text-text-muted">
          Enter a link, phone number, email, or message to check it.
        </p>
      )}
    </div>
  );
}
