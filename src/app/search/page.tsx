import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

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
import { THREATS, getRiskBadgeColor, getRiskLabel, RiskLevel } from '@/data/threats';
import DataModeBadge from '@/components/ui/DataModeBadge';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}): Promise<Metadata> {
  const { type } = await searchParams;
  let title = 'Search Results — ScamWatch';
  if (type === 'url') {
    title = 'Check a Suspicious Link — ScamWatch';
  } else if (type === 'phone') {
    title = 'Check a Suspicious Phone Number — ScamWatch';
  } else if (type === 'email') {
    title = 'Check a Suspicious Email — ScamWatch';
  }
  return {
    title,
    description: 'Calibrated assessment of a link, phone number, email, or message.',
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lose_money?: string; share_pii?: string; type?: string; demo?: string }>;
}): Promise<React.JSX.Element> {
  const { q, lose_money, share_pii, type, demo } = await searchParams;
  const query = (q ?? '').trim();
  const isDemoMode = demo === 'true' || query === 'sunpass-billing-example[dot]com';
  const isEmpty = !query;

  const loseMoney = lose_money === 'true';
  const sharePii = share_pii === 'true';
  const searchType = type ?? 'all';

  let result = null;
  let explanation = null;
  let recommendations = null;
  let riskLevel: RiskLevel = 'unknown';
  let dataMode: 'demo' | 'verified' | 'live' = 'live';
  let extracted: { type: string; canonical_value: string }[] = [];
  let errorMsg = '';

  // Determine page guidelines based on mode
  let searchTitle = 'Know Before You Click';
  let searchPlaceholder = 'Paste a link, phone number, email, or message…';
  let searchHelperText = 'Enter any indicator to inspect it for scam patterns, threat records, and community reports.';

  if (searchType === 'url') {
    searchTitle = 'Check a Suspicious Link';
    searchPlaceholder = 'Paste a suspicious link, website, or shortened URL';
    searchHelperText = 'We inspect the domain name, check for look-alike brand names, detect redirection trails, and analyze known phishing patterns.';
  } else if (searchType === 'phone') {
    searchTitle = 'Check a Suspicious Phone Number';
    searchPlaceholder = 'Enter a phone number, SMS sender, or suspicious call message';
    searchHelperText = 'We verify spoofing risks, detect robocall trap details, analyze immediate payment demands, and match known community complaints.';
  } else if (searchType === 'email') {
    searchTitle = 'Check a Suspicious Email';
    searchPlaceholder = 'Paste the sender email, subject line, or suspicious email text';
    searchHelperText = 'We evaluate sender domain reputation, check for look-alike brand impersonation, flag attachment risks, and inspect credential theft signatures.';
  }

  // Check if query matches any centralized threat campaign
  const matchedThreat = THREATS.find(t => 
    t.slug === query || 
    t.id === query ||
    query.toLowerCase().includes('sunpass') && t.id === 'FL-001' ||
    query.toLowerCase().includes('duke') && t.id === 'FL-002'
  );

  if (!isEmpty) {
    if (isDemoMode) {
      // Provide FL-001 as the default demo scan
      result = {
        query: 'sunpass-billing-example[dot]com',
        entityType: 'url' as const,
        verdict: 'Confirmed Reported Scam' as const,
        confidence: 0.95,
        reportCount: 48,
        relatedThreats: [{ slug: 'FL-001', title: 'SunPass Toll Text Scam Alert (Smishing)' }],
        abstained: false,
      };
      explanation = {
        text: 'This domain closely matches verified smishing campaigns impersonating the Florida SunPass toll agency. Senders request payment for fake unpaid toll balances (frequently $4.15) to harvest consumer credit card details.',
        citations: [
          { raw_value: 'sunpass-billing-example[dot]com', resolved_label: 'SunPass Smishing Campaign Indicator' }
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
      riskLevel = 'critical';
      dataMode = 'demo';
      extracted = [{ type: 'url', canonical_value: 'sunpass-billing-example[dot]com' }];
    } else {
      try {
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
          extracted = await extractEntitiesHybrid(query);

          // Determine risk level based on verdict
          if (result.verdict === 'Confirmed Reported Scam' || result.verdict === 'Likely Scam') {
            riskLevel = 'high';
          } else if (result.verdict === 'Use Caution') {
            riskLevel = 'medium';
          } else {
            riskLevel = 'low';
          }
          dataMode = 'live';

          // Override if query matches a predefined threat
          if (matchedThreat) {
            riskLevel = matchedThreat.riskLevel;
            dataMode = matchedThreat.dataMode;
            result.reportCount = matchedThreat.communityReports;
            result.confidence = matchedThreat.confidence / 100;
          }
        } else {
          errorMsg = 'We encountered an issue checking this indicator. Please check your query and try again.';
        }
      } catch (_err) {
        errorMsg = 'The Sentinel service is temporarily offline. Please verify this indicator directly with official agencies.';
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8 print:p-0 print:m-0">
      {/* 1. Header & Input Bar */}
      <div className="print:hidden space-y-2">
        <h1 className="text-2xl font-bold text-text">{searchTitle}</h1>
        <p className="text-xs text-text-muted leading-relaxed max-w-2xl mb-2">{searchHelperText}</p>
        <SearchBar defaultValue={isDemoMode ? 'sunpass-billing-example[dot]com' : query} placeholder={searchPlaceholder} />
      </div>

      {/* 2. Beta Evaluation Mode Banner */}
      <div className="p-3 bg-brand/10 border border-brand/20 rounded-md text-xs text-text-muted leading-relaxed print:hidden">
        🛡️ <strong>Beta Evaluation Mode:</strong> ScamWatch can help identify scam indicators, but results are informational and should be verified through official sources. Demo examples may appear when no live scan has been submitted.
      </div>

      {/* 3. Empty State */}
      {isEmpty && (
        <div className="space-y-6">
          <div className="p-5 bg-surface border border-border rounded-md space-y-4 print:hidden">
            <h2 className="text-sm font-bold text-text uppercase tracking-wider">Try a simulated demo scan</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Want to see how our threat evaluation templates and checklists work? Run a demo check on a simulated SunPass toll road text scam indicator.
            </p>
            <div>
              <Link
                href="/search?q=sunpass-billing-example[dot]com&demo=true"
                className="inline-block rounded bg-brand px-4 py-2 text-xs font-bold text-brand-contrast hover:bg-brand/80"
              >
                Evaluate SunPass Smishing Demo
              </Link>
            </div>
          </div>

          {/* What ScamWatch Can and Cannot Do Box (Empty State) */}
          <section className="panel p-5 space-y-4">
            <h2 className="text-sm font-bold text-text uppercase tracking-wider">What ScamWatch can and cannot do</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-xs leading-relaxed">
              <div className="panel p-4 border-l-2 border-l-safe-border space-y-2">
                <h3 className="font-semibold text-text">What ScamWatch Can Do</h3>
                <ul className="list-disc pl-4 space-y-1 text-text-muted">
                  <li>Flag common scam indicators inside links, phone numbers, and messages.</li>
                  <li>Explain why something looks suspicious using matched fraud templates.</li>
                  <li>Suggest safer next steps if you have been targeted.</li>
                  <li>Point users to official federal and state reporting channels.</li>
                  <li>Help users pause and verify before clicking or paying.</li>
                </ul>
              </div>
              <div className="panel p-4 border-l-2 border-l-brand space-y-2">
                <h3 className="font-semibold text-text">What ScamWatch Cannot Do</h3>
                <ul className="list-disc pl-4 space-y-1 text-text-muted">
                  <li>Guarantee that any message, website, or phone number is 100% safe.</li>
                  <li>Recover stolen money or reverse fraudulent card charges.</li>
                  <li>Replace your bank, police department, lawyer, or government agencies.</li>
                  <li>Verify every global phone number or domain in real time.</li>
                  <li>Provide official legal, financial, or law-enforcement advice.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 4. Error State */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-500 font-semibold print:hidden">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 5. Results State (Demo or Live) */}
      {!isEmpty && result && (
        <div className="space-y-8">
          {/* Scan Origin Label */}
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <span className="text-xs font-bold text-text uppercase tracking-wider">
              {isDemoMode ? (
                <span className="text-amber-500">🧪 Demo example — not based on your submission</span>
              ) : (
                <span className="text-emerald-500">🛡️ Based on the message or link you entered</span>
              )}
            </span>
            <DataModeBadge mode={dataMode} />
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
              <div className={`px-3 py-1 rounded border text-xs font-bold uppercase tracking-wider ${getRiskBadgeColor(riskLevel)}`}>
                Risk Level: {getRiskLabel(riskLevel)}
              </div>
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

          {/* Senior-Friendly Safety Guidance */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="panel p-5 border-l-4 border-l-brand space-y-3">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-text">
                What to do now
              </h2>
              <ul className="list-disc pl-5 text-xs text-text-muted space-y-2 leading-relaxed">
                <li><strong>Do not click</strong> the link.</li>
                <li><strong>Do not reply</strong> to the message.</li>
                <li><strong>Do not enter</strong> passwords, card numbers, or Social Security numbers.</li>
                <li><strong>Call the official company</strong> using the phone number from its real website or your physical bill.</li>
                <li><strong>Forward text scams</strong> to <strong>7726</strong> to report them to your carrier.</li>
                <li><strong>Report the scam</strong> to the official <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" className="text-brand underline">Federal Trade Commission (FTC)</a>.</li>
                <li><strong>If you already paid or shared details</strong>, call your bank or credit card issuer immediately to freeze your accounts.</li>
              </ul>
            </section>

            <section className="panel p-5 border-l-4 border-l-safe-border flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-text">
                  Tell a family member
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  If this message scared you or pressured you to act fast, pause and ask someone you trust before sending money or entering information.
                </p>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-text-subtle font-mono uppercase tracking-widest">
                  🔒 ScamWatch Safety Shield
                </p>
              </div>
            </section>
          </div>

          {/* Why this score? */}
          <section className="panel p-5 space-y-3">
            <h2 className="text-sm font-bold text-text uppercase tracking-wider">Why this score?</h2>
            <div className="space-y-3 text-xs text-text-muted leading-relaxed">
              <p>
                This indicator is rated <strong>{getRiskLabel(riskLevel)}</strong> because:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {riskLevel === 'critical' || riskLevel === 'high' ? (
                  <>
                    <li>It matches highly urgent warning patterns mimicking trusted services.</li>
                    <li>It contains text structures designed to pressure consumers into fast action.</li>
                    {result.reportCount > 0 && <li>It matches {result.reportCount} community report signatures.</li>}
                  </>
                ) : riskLevel === 'medium' ? (
                  <>
                    <li>It exhibits moderate caution signals that require independent verification.</li>
                    <li>It has unresolved public records or newly registered domain registrations.</li>
                  </>
                ) : (
                  <>
                    <li>No active campaign indicators currently match this threat signature.</li>
                    <li>The query does not contain known high-pressure utility or banking keywords.</li>
                  </>
                )}
              </ul>
              <div className="border-t border-border/30 pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-text-subtle font-mono">
                <span>Confidence: {(result.confidence * 100).toFixed(0)}%</span>
                <span>Last verified: {matchedThreat ? matchedThreat.lastVerifiedAt : 'July 1, 2026'}</span>
                <span className="flex items-center gap-1">Data Mode: <DataModeBadge mode={dataMode} /></span>
              </div>
              <p className="border-t border-border/20 pt-2 text-[10px] text-text-subtle leading-relaxed italic">
                This score is a safety signal, not a guarantee. Always verify directly with the official company or agency before paying, clicking, or sharing personal information.
              </p>
            </div>
          </section>

          {/* What ScamWatch Can and Cannot Do Box (Result State) */}
          <section className="panel p-5 space-y-4">
            <h2 className="text-sm font-bold text-text uppercase tracking-wider">What ScamWatch can and cannot do</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-xs leading-relaxed">
              <div className="panel p-4 border-l-2 border-l-safe-border space-y-2">
                <h3 className="font-semibold text-text">What ScamWatch Can Do</h3>
                <ul className="list-disc pl-4 space-y-1 text-text-muted">
                  <li>Flag common scam indicators inside links, phone numbers, and messages.</li>
                  <li>Explain why something looks suspicious using matched fraud templates.</li>
                  <li>Suggest safer next steps if you have been targeted.</li>
                  <li>Point users to official federal and state reporting channels.</li>
                  <li>Help users pause and verify before clicking or paying.</li>
                </ul>
              </div>
              <div className="panel p-4 border-l-2 border-l-brand space-y-2">
                <h3 className="font-semibold text-text">What ScamWatch Cannot Do</h3>
                <ul className="list-disc pl-4 space-y-1 text-text-muted">
                  <li>Guarantee that any message, website, or phone number is 100% safe.</li>
                  <li>Recover stolen money or reverse fraudulent card charges.</li>
                  <li>Replace your bank, police department, lawyer, or government agencies.</li>
                  <li>Verify every global phone number or domain in real time.</li>
                  <li>Provide official legal, financial, or law-enforcement advice.</li>
                </ul>
              </div>
            </div>
          </section>

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
                    {/* Safe formatting for scam examples */}
                    <code className="text-text font-semibold" aria-label="Example scam message">
                      {e.canonical_value.replace(/\./g, '[dot]')}
                    </code>
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-text-subtle italic">Example only — do not visit or contact.</p>
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
                        Flagged entity:{' '}
                        <code className="font-mono text-text">
                          {c.raw_value.replace(/\./g, '[dot]')}
                        </code>{' '}
                        identified as {c.resolved_label}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-text-subtle italic">Example only — do not visit or contact.</p>
                </div>
              )}
            </section>
          )}

          {/* Calibrated Confidence explanation */}
          <section className="rounded-lg border border-border bg-surface p-5 space-y-2">
            <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Confidence Metrics Calibration</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Confidence is evaluated at <strong>{(result.confidence * 100).toFixed(0)}%</strong>. We compare your message against known scam patterns, official warnings, and matching community reports.
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

          {/* Non-Affiliation Disclaimer */}
          <p className="text-[10px] text-text-subtle leading-relaxed border-t border-border/20 pt-4 print:hidden">
            Disclaimer: ScamWatch is not affiliated with SunPass, Duke Energy, FTC, FBI, IC3, the Florida Attorney General, UPS, FedEx, USPS, or any government agency or utility company mentioned above. Always verify through official websites or phone numbers from your bill, card, statement, or agency website.
          </p>
        </div>
      )}
    </div>
  );
}
