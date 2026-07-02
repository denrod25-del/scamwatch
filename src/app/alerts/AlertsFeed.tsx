'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { THREATS, getRiskBadgeColor, getRiskLabel, Threat } from '@/data/threats';
import DataModeBadge from '@/components/ui/DataModeBadge';

const BORDER_COLORS = {
  critical: 'border-l-red-700',
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-emerald-500',
};

export default function AlertsFeed(): React.JSX.Element {
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedDataMode, setSelectedDataMode] = useState<string>('all');

  // Extract unique filter options dynamically from THREATS
  const categories = useMemo(() => {
    const set = new Set(THREATS.map(t => t.category));
    return Array.from(set);
  }, []);

  const locations = useMemo(() => {
    const set = new Set(THREATS.map(t => t.affectedArea));
    return Array.from(set);
  }, []);

  const filteredThreats = useMemo(() => {
    return THREATS.filter((t) => {
      const matchRisk = selectedRisk === 'all' || t.riskLevel === selectedRisk;
      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchChannel = selectedChannel === 'all' || t.channels.includes(selectedChannel);
      const matchLocation = selectedLocation === 'all' || t.affectedArea === selectedLocation;
      const matchDataMode = selectedDataMode === 'all' || t.dataMode === selectedDataMode;
      return matchRisk && matchCategory && matchChannel && matchLocation && matchDataMode;
    });
  }, [selectedRisk, selectedCategory, selectedChannel, selectedLocation, selectedDataMode]);

  const clearFilters = () => {
    setSelectedRisk('all');
    setSelectedCategory('all');
    setSelectedChannel('all');
    setSelectedLocation('all');
    setSelectedDataMode('all');
  };

  return (
    <div className="space-y-6">
      {/* Filters block */}
      <div className="panel p-4 bg-surface-muted border border-border/40 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-5 text-xs">
        {/* Risk Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-risk" className="font-semibold text-text-subtle uppercase tracking-wider block">Risk Level</label>
          <select
            id="filter-risk"
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full bg-background border border-border px-2.5 py-1.5 rounded focus:border-brand focus:outline-none text-text"
          >
            <option value="all">All Risks</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-category" className="font-semibold text-text-subtle uppercase tracking-wider block">Scam Category</label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-background border border-border px-2.5 py-1.5 rounded focus:border-brand focus:outline-none text-text"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Channel Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-channel" className="font-semibold text-text-subtle uppercase tracking-wider block">Channel</label>
          <select
            id="filter-channel"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-full bg-background border border-border px-2.5 py-1.5 rounded focus:border-brand focus:outline-none text-text"
          >
            <option value="all">All Channels</option>
            <option value="text">Text (SMS)</option>
            <option value="phone">Phone Call</option>
            <option value="email">Email</option>
            <option value="website">Website</option>
            <option value="social">Social Media</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-location" className="font-semibold text-text-subtle uppercase tracking-wider block">Location</label>
          <select
            id="filter-location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-background border border-border px-2.5 py-1.5 rounded focus:border-brand focus:outline-none text-text"
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Data Mode Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-datamode" className="font-semibold text-text-subtle uppercase tracking-wider block">Data Mode</label>
          <select
            id="filter-datamode"
            value={selectedDataMode}
            onChange={(e) => setSelectedDataMode(e.target.value)}
            className="w-full bg-background border border-border px-2.5 py-1.5 rounded focus:border-brand focus:outline-none text-text"
          >
            <option value="all">All Modes</option>
            <option value="demo">Demo Data</option>
            <option value="verified">Verified Data</option>
            <option value="live">Live Data</option>
          </select>
        </div>
      </div>

      {/* Filter Stats & Reset */}
      <div className="flex items-center justify-between text-xs text-text-subtle">
        <span>Showing {filteredThreats.length} alert(s)</span>
        {(selectedRisk !== 'all' || selectedCategory !== 'all' || selectedChannel !== 'all' || selectedLocation !== 'all' || selectedDataMode !== 'all') && (
          <button onClick={clearFilters} className="underline hover:text-brand font-semibold">
            Clear Filters
          </button>
        )}
      </div>

      {/* Threat List */}
      {filteredThreats.length === 0 ? (
        <div className="panel p-8 text-center space-y-2 border border-dashed border-border/80">
          <p className="text-sm font-semibold text-text">No alerts match these filters.</p>
          <p className="text-xs text-text-muted">Try removing a filter or checking all Florida alerts.</p>
          <button
            onClick={clearFilters}
            className="mt-2 inline-block rounded bg-brand px-3 py-1.5 text-xs font-bold text-brand-contrast hover:bg-brand/80"
          >
            Show All Alerts
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredThreats.map((threat) => (
            <div
              key={threat.id}
              className={`panel p-5 border-l-4 ${BORDER_COLORS[threat.riskLevel]} flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-base font-semibold text-text leading-tight">{threat.title}</span>
                  <span className={`badge-pill text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border ${getRiskBadgeColor(threat.riskLevel)}`}>
                    {getRiskLabel(threat.riskLevel)}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{threat.summary}</p>
              </div>

              <div className="border-t border-border/30 pt-3 space-y-2 text-[10px] text-text-subtle">
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                  <div>
                    <span className="font-semibold text-text uppercase block tracking-wider">Category</span>
                    <span className="text-text-muted">{threat.category}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-text uppercase block tracking-wider">Affected Area</span>
                    <span className="text-text-muted">{threat.affectedArea}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-text uppercase block tracking-wider">Community Reports</span>
                    <span className="text-text-muted">{threat.communityReports} reports</span>
                  </div>
                  <div>
                    <span className="font-semibold text-text uppercase block tracking-wider">Official Sources</span>
                    <span className="text-text-muted">{threat.officialSourceCount} warning source(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-text-subtle">Last Verified: {threat.lastVerifiedAt}</span>
                    <DataModeBadge mode={threat.dataMode} />
                  </div>
                  <Link href={`/threat/${threat.slug}`} className="underline font-semibold hover:text-brand text-xs">
                    Analyze Campaign ↗
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
