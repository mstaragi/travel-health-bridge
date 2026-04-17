import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DailySummaryData {
  triage_sessions_today: number | null;
  non_covered_hits_today: number | null;
  open_overcharges: number | null;
  open_p1_p2_cases: number | null;
  stale_providers_count?: number | null;
}

interface DailySummaryCardProps {
  data: DailySummaryData | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

function MetricTile({ 
  label, 
  value, 
  isLoading, 
  useColorCoding = true 
}: { 
  label: string; 
  value: number | null; 
  isLoading?: boolean; 
  useColorCoding?: boolean;
}) {
  const getColors = () => {
    if (value === null || !useColorCoding) return "bg-slate-800/50 text-slate-400 border-slate-700";
    if (value < 5) return "bg-emerald-900/20 text-emerald-400 border-emerald-900/50";
    if (value <= 15) return "bg-amber-900/20 text-amber-400 border-amber-900/50";
    return "bg-rose-900/20 text-rose-400 border-rose-900/50";
  };

  return (
    <div className={cn(
      "flex-1 min-w-[160px] p-4 rounded-xl border transition-all duration-300",
      getColors()
    )}>
      <div className="text-3xl font-black mb-1">
        {isLoading ? (
          <div className="h-9 w-12 bg-slate-700/50 animate-pulse rounded" />
        ) : (
          value ?? '—'
        )}
      </div>
      <div className="text-xs font-bold uppercase tracking-wider opacity-70">
        {label}
      </div>
    </div>
  );
}

export function DailySummaryCard({
  data,
  isLoading = false,
  onRefresh,
  className,
}: DailySummaryCardProps) {
  return (
    <div className={cn(
      "bg-[#152D45] rounded-2xl border border-slate-800 p-6 shadow-2xl",
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
          Today's Global Snapshot
        </h3>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors border border-slate-700"
          >
            ↻ Refresh
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Triage Sessions"
          value={data?.triage_sessions_today ?? null}
          isLoading={isLoading}
          useColorCoding={false}
        />
        <MetricTile
          label="City Gaps"
          value={data?.non_covered_hits_today ?? null}
          isLoading={isLoading}
        />
        <MetricTile
          label="Open Overcharges"
          value={data?.open_overcharges ?? null}
          isLoading={isLoading}
        />
        <MetricTile
          label="P1 + P2 Cases"
          value={data?.open_p1_p2_cases ?? null}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-800/50 pt-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            (data?.stale_providers_count ?? 0) > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
          )} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {data?.stale_providers_count ?? 0} Stale Providers Flagged
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Refreshes every 5 mins
        </span>
      </div>
    </div>
  );
}
