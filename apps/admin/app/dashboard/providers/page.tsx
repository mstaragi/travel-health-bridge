'use client';

import React, { useState } from 'react';
import { useAdminProviders } from '@travelhealthbridge/shared/api/supabase';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  MoreVertical, 
  Filter,
  Search,
  ExternalLink,
  Ban
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProvidersPage() {
  const [filters, setFilters] = useState({
    city: '',
    badge_status: '',
    staleness_tier: '',
  });
  const [search, setSearch] = useState('');

  const { data: providers, isLoading } = useAdminProviders(filters);

  const filteredProviders = providers?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.area.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight">Provider Ecosystem</h2>
           <p className="text-sm text-slate-500 font-medium">Verify clinics, monitor staleness, and manage safety compliance.</p>
        </div>
        <button className="bg-teal-500 hover:bg-teal-400 text-white font-black px-8 py-4 rounded-2xl text-sm shadow-xl shadow-teal-500/20 transition-all active:scale-[0.98]">
           Register New Clinic
        </button>
      </div>

      {/* Advanced Control Bar */}
      <div className="bg-[#152D45] p-2 rounded-[28px] border border-slate-800 shadow-2xl flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by clinic name or area..."
            className="w-full bg-slate-900/40 border-none rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 p-1">
          <select 
            className="bg-slate-900/60 border border-slate-700/50 rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-3 text-slate-300 focus:outline-none focus:border-teal-500/50"
            value={filters.city}
            onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
          >
            <option value="">All Cities</option>
            <option value="delhi">Delhi</option>
            <option value="mumbai">Mumbai</option>
            <option value="bengaluru">Bengaluru</option>
            <option value="goa">Goa</option>
          </select>

          <select 
            className="bg-slate-900/60 border border-slate-700/50 rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-3 text-slate-300 focus:outline-none focus:border-teal-500/50"
            value={filters.badge_status}
            onChange={(e) => setFilters(f => ({ ...f, badge_status: e.target.value }))}
          >
            <option value="">All Badges</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>

          <select 
            className="bg-slate-900/60 border border-slate-700/50 rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-3 text-slate-300 focus:outline-none focus:border-teal-500/50"
            value={filters.staleness_tier}
            onChange={(e) => setFilters(f => ({ ...f, staleness_tier: e.target.value }))}
          >
            <option value="">All Tiers</option>
            <option value="fresh">Fresh</option>
            <option value="stale">Stale</option>
            <option value="very_stale">Critical</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-[#152D45] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">
                <th className="px-8 py-6">Provider / Location</th>
                <th className="px-6 py-6 font-black uppercase tabular-nums">Badge Status</th>
                <th className="px-6 py-6">Staleness</th>
                <th className="px-6 py-6">Strikes</th>
                <th className="px-6 py-6">Reliability</th>
                <th className="px-8 py-6 text-right">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-8"><div className="h-4 bg-slate-800 rounded w-full" /></td>
                  </tr>
                ))
              ) : (
                filteredProviders.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner">
                          <ShieldCheck className={cn(
                            "w-5 h-5",
                            p.badge_status === 'active' ? "text-teal-400" : "text-slate-600"
                          )} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">{p.name}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3 h-3" />
                            {p.city_id} • {p.area}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        p.badge_status === 'active' ? "bg-teal-500/10 text-teal-500 border-teal-500/20" :
                        p.badge_status === 'suspended' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                        "bg-slate-800 text-slate-400 border-slate-700"
                      )}>
                        {p.badge_status}
                      </div>
                      <div className="text-[9px] text-slate-600 font-bold mt-1.5 uppercase tracking-tighter">
                        Exp: {new Date(p.badge_expiry).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className={cn(
                        "flex items-center gap-2 text-xs font-bold",
                        p.staleness_tier === 'fresh' ? "text-emerald-500" : 
                        p.staleness_tier === 'stale' ? "text-amber-500" : "text-rose-500"
                      )}>
                        <Clock className="w-3.5 h-3.5" />
                        <span className="capitalize">{p.staleness_tier}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-medium mt-1">
                        Last activity: {new Date(p.last_activity_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i}
                            className={cn(
                              "w-1.5 h-4 rounded-full border transition-all shadow-sm",
                              i <= p.strike_count ? "bg-rose-500 border-rose-400 shadow-rose-500/30" : "bg-slate-800 border-slate-700"
                            )}
                          />
                        ))}
                      </div>
                      {p.strike_count > 0 && (
                        <p className="text-[10px] text-rose-500 font-black uppercase tracking-tighter mt-2">
                          {p.strike_count} STRIKES ISSUED
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-xl font-black text-white tabular-nums">
                        {p.reliability_score?.toFixed(1) || '—'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        SCORE (0-2)
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 shadow-lg">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 transition-all border border-slate-700 hover:border-rose-900/50 shadow-lg">
                          <Ban className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 shadow-lg">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
