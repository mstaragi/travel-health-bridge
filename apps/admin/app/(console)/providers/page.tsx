'use client';

import React, { useState } from 'react';
import { 
  useAdminProviders, 
  supabase,
  TABLES
} from '@travelhealthbridge/shared/api/supabase';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldAlert, 
  ShieldCheck, 
  Ban, 
  UserPlus, 
  MessageSquare,
  MapPin,
  Clock,
  ChevronRight,
  RefreshCcw,
  Mail,
  AlertTriangle
} from 'lucide-react';

export default function ProvidersPage() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const { data: providers, isLoading, refetch } = useAdminProviders(filters);

  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (id: string, status: string) => {
    setIsUpdating(true);
    await supabase.from(TABLES.PROVIDERS).update({ badge_status: status }).eq('id', id);
    refetch();
    setIsUpdating(false);
  };

  const issueStrike = async (id: string, currentStrikes: number) => {
    setIsUpdating(true);
    await supabase.from(TABLES.PROVIDERS).update({ strike_count: currentStrikes + 1 }).eq('id', id);
    refetch();
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Provider Network</h2>
          <p className="text-sm text-slate-500 font-medium">Manage clinical verification, quality strikes, and status.</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20">
          <UserPlus className="w-4 h-4" />
          Onboard New Clinic
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by clinic name or area..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          />
        </div>
        <select 
          className="bg-slate-50 border border-slate-200 rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500"
          onChange={(e) => setFilters(p => ({ ...p, badge_status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
        </select>
        <select 
          className="bg-slate-50 border border-slate-200 rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500"
          onChange={(e) => setFilters(p => ({ ...p, staleness_tier: e.target.value }))}
        >
          <option value="">All Freshness</option>
          <option value="fresh">Fresh</option>
          <option value="stale">Stale (14d+)</option>
          <option value="very_stale">Very Stale (30d+)</option>
        </select>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Provider Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">City/Area</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Badge Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Freshness</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Strikes</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-20 text-slate-400 italic">Scanning network...</td></tr>
              ) : providers?.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{p.slug}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {p.city_id} • {p.area}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      p.badge_status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      p.badge_status === 'suspended' ? "bg-rose-50 text-rose-700 border-rose-100" :
                      "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {p.badge_status === 'active' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {p.badge_status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest",
                      p.staleness_tier === 'fresh' ? "text-emerald-600" :
                      p.staleness_tier === 'stale' ? "text-amber-600" :
                      "text-rose-600"
                    )}>
                      <Clock className="w-3 h-3" />
                      {p.staleness_tier}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "text-xs font-black px-2 py-0.5 rounded",
                      p.strike_count > 0 ? "bg-rose-500 text-white" : "text-slate-300"
                    )}>
                      {p.strike_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => issueStrike(p.id, p.strike_count)}
                         title="Issue Strike"
                         className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-lg"
                       >
                         <AlertTriangle className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => updateStatus(p.id, p.badge_status === 'active' ? 'suspended' : 'active')}
                         title={p.badge_status === 'active' ? 'Suspend' : 'Activate'}
                         className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 transition-all rounded-lg"
                       >
                         {p.badge_status === 'active' ? <Ban className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                       </button>
                       <button className="p-2 text-slate-400 hover:text-slate-900 transition-all rounded-lg">
                         <MoreVertical className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layer 2A Summary Note */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 p-4 rounded-2xl">
        <Info className="w-5 h-5 text-amber-600" />
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          <span className="font-bold">Layer 2A Notice:</span> Badge status changes reflect in the consumer triage algorithm within 60 seconds. Suspended providers are immediately excluded from all traveler recommendations.
        </p>
      </div>
    </div>
  );
}

const Info = (props: any) => <AlertTriangle {...props} />;
const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
