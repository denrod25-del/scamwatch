import React from 'react';
import Link from 'next/link';

export default function FounderDashboard(): React.JSX.Element {
  // Mock metrics and feedback for the Public Beta Founder Console
  const FEEDBACK_ITEMS = [
    {
      id: 'fb-001',
      type: 'incorrect_analysis',
      comments: 'This was flagged as Likely Safe but it is a known Florida SunPass toll smish text.',
      rating: 2,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'fb-002',
      type: 'suggestion',
      comments: 'Please add a Spanish translation. Many older residents in Miami need this in Spanish.',
      rating: 5,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  const INVITES = [
    { code: 'FL-BETA-2026', status: 'Active', uses: 12 },
    { code: 'MIAMI-SAFE', status: 'Active', uses: 8 },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <span className="badge-pill bg-brand/10 text-brand text-[10px] uppercase font-bold tracking-wider">
            Internal Operations Only
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-text">
            Founder Command Console
          </h1>
        </div>
        <Link href="/" className="text-xs font-semibold underline text-text-subtle hover:text-brand">
          ← Back to App
        </Link>
      </div>

      {/* Grid: Stats and Provider Cost tracker */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-text-subtle">Weekly Searches</span>
          <p className="text-2xl font-bold text-text">1,248</p>
          <span className="text-[10px] text-safe">+12% vs last week</span>
        </div>

        <div className="panel p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-text-subtle">OpenAI API Cost</span>
          <p className="text-2xl font-bold text-text">$12.40</p>
          <span className="text-[10px] text-text-muted">Budget: $250.00 / mo</span>
        </div>

        <div className="panel p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-text-subtle">Supabase Cloud Cost</span>
          <p className="text-2xl font-bold text-text">$5.00</p>
          <span className="text-[10px] text-text-muted">Budget: $50.00 / mo</span>
        </div>

        <div className="panel p-5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-text-subtle">Abstention Rate</span>
          <p className="text-2xl font-bold text-text">4.2%</p>
          <span className="text-[10px] text-safe">Target: &lt; 5%</span>
        </div>
      </div>

      {/* Main Body: Feedback Items and Invites */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Col: Feedback */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-text">
            Beta User Feedback Queue
          </h2>
          <div className="space-y-4">
            {FEEDBACK_ITEMS.map((item) => (
              <div key={item.id} className="panel p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="badge-pill bg-safe/10 text-safe text-[9px] uppercase font-bold tracking-wider">
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-text-subtle">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-text italic">
                  &ldquo;{item.comments}&rdquo;
                </p>
                <div className="text-xs text-text-muted">
                  User Rating: <span className="font-bold text-brand">{item.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Invite Code Manager */}
        <div className="space-y-6">
          <section className="panel p-5 space-y-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-text">
              Beta Invite Code Manager
            </h3>
            <div className="space-y-3">
              {INVITES.map((invite) => (
                <div key={invite.code} className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                  <div>
                    <p className="font-mono font-bold text-text">{invite.code}</p>
                    <p className="text-[10px] text-text-muted">{invite.uses} uses registered</p>
                  </div>
                  <span className="badge-pill bg-safe/10 text-safe text-[9px] uppercase font-bold">
                    {invite.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-text">
              System Health Signals
            </h3>
            <div className="space-y-2 text-xs text-text-muted">
              <div className="flex justify-between">
                <span>Database Connectivity</span>
                <span className="text-safe font-bold">OK</span>
              </div>
              <div className="flex justify-between">
                <span>LLM Gateway Latency</span>
                <span>480ms</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
