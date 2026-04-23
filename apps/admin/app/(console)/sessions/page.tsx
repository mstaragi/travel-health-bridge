'use client';

import React, { useState } from 'react';
import { 
  useAdminSessions, 
  useAdminCases,
  supabase,
  TABLES
} from '@travelhealthbridge/shared/api/supabase';
import { 
  Activity, 
  MessageCircle, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight,
  AlertTriangle,
  History,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SessionsPage() {
  const [view, setView] = useState<'sessions' | 'cases'>('sessions');
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  const { data: sessions, isLoading: isLoadingSessions } = useAdminSessions(filters);
  const { data: cases, isLoading: isLoadingCases } = useAdminCases(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Operations</h2>
          <p className="text-sm text-slate-500 font-medium">Monitor active triages and manage clinical assistance cases.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setView('sessions')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              view === 'sessions' ? "bg-white text-teal-600 shadow-lg shadow-teal-500/10" : "text-slate-500"
            )}
          >
            Triage Feed
          </button>
          <button 
            onClick={() => setView('cases')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              view === 'cases' ? "bg-white text-teal-600 shadow-lg shadow-teal-500/10" : "text-slate-500"
            )}
          >
            WhatsApp Cases
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={view === 'sessions' ? "Search sessions by ID or symptom..." : "Search cases by ID or provider..."} 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden min-h-[500px]">
        {view === 'sessions' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Triage Context</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Recommendation</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status Indicators</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingSessions ? (
                  <tr><td colSpan={5} className="text-center py-40 text-slate-400 italic">Streaming session data...</td></tr>
                ) : sessions?.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{s.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{s.symptom}</span>
                        <span className="text-[10px] text-teal-600 font-black uppercase tracking-widest mt-1">{s.city_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-bold text-slate-600 group-hover:text-teal-700 transition-all cursor-help">Recommended Clinic Profile</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Indicator icon={Phone} active={!!s.call_now_tapped_at} label="Call Made" />
                        <Indicator icon={MessageSquare} active={!!s.feedback?.[0]} label="Feedback" />
                        <Indicator icon={AlertTriangle} active={false} label="Red Flag" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 text-slate-300 hover:text-teal-600 transition-colors">
                         <ChevronRight className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-slate-100">
             {isLoadingCases ? (
               <div className="py-40 text-center text-slate-400 italic">Connecting to WhatsApp logs...</div>
             ) : cases?.map((c) => (
               <div key={c.tag} className="p-6 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row items-center gap-6">
                 <div className="flex items-center gap-4 shrink-0">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xs",
                      c.severity === 'P1' ? "bg-rose-600" : c.severity === 'P2' ? "bg-amber-600" : "bg-teal-600"
                    )}>
                      {c.severity}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Case ID: {c.tag}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(c.opened_at).toLocaleDateString()}</p>
                    </div>
                 </div>
                 
                 <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                      "{c.notes || 'No case logs documented yet.'}"
                    </p>
                 </div>

                 <div className="shrink-0 flex items-center gap-4">
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Case Status</span>
                       <span className={cn(
                         "text-xs font-bold",
                         c.status === 'Open' ? "text-rose-600" : "text-emerald-600"
                       )}>
                         {c.status}
                       </span>
                    </div>
                    <button className="p-2.5 bg-slate-100 hover:bg-teal-50 text-slate-400 hover:text-teal-600 rounded-xl transition-all">
                       <ChevronRight className="w-5 h-5" />
                    </button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 p-4 rounded-2xl">
        <Activity className="w-5 h-5 text-teal-600" />
        <p className="text-[11px] text-teal-800 font-medium leading-relaxed">
           Real-time data synchronization is active. Each row represents a verified traveller interaction in IST (UTC+5:30). Red flags trigger automated Layer 3 operational push notifications.
        </p>
      </div>
    </div>
  );
}

function Indicator({ icon: Icon, active, label }: { icon: any, active: boolean, label: string }) {
  return (
    <div className={cn(
      "p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-help",
      active ? "bg-teal-50 border-teal-100 text-teal-600" : "bg-slate-50 border-slate-100 text-slate-200"
    )} title={label}>
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
}
