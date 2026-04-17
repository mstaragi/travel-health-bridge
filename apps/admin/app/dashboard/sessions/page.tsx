'use client';

import React from 'react';
import { useAdminSessions } from '@travelhealthbridge/shared/api/supabase';
import { calculateDisplacementRate } from '@travelhealthbridge/shared/utils/displacement';
import { 
  History, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Link as LinkIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SessionsPage() {
  const { data: sessions, isLoading } = useAdminSessions();

  const feedbackData = sessions?.map(s => s.feedback).filter(Boolean).flat() || [];
  const displacementRate = calculateDisplacementRate(feedbackData);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Displacement Header */}
      <div className="bg-[#152D45] rounded-3xl p-8 border border-slate-800 shadow-2xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-1">
            Execution Focus
          </h3>
          <h2 className="text-3xl font-black text-white">True Displacement Rate</h2>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-teal-400 tracking-tighter">
            {displacementRate.toFixed(1)}%
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Rolling 7-Day Performance
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by User ID or Symptom..."
            className="w-full bg-[#152D45] border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#152D45] border border-slate-800 px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex-1 md:flex-none bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-teal-500/20 transition-all">
            Export CSV
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-[#152D45] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">
                <th className="px-6 py-5">Timestamp</th>
                <th className="px-6 py-5">User ID</th>
                <th className="px-6 py-5">Symptom</th>
                <th className="px-6 py-5">Urgency</th>
                <th className="px-6 py-5">Displacement Source</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-6 font-medium text-slate-800">
                      <div className="h-4 bg-slate-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : (
                sessions?.map((session) => {
                  const hasFeedback = !!session.feedback;
                  const isStale = !hasFeedback && (new Date().getTime() - new Date(session.created_at).getTime() > 48 * 60 * 60 * 1000);
                  
                  return (
                    <tr 
                      key={session.id} 
                      className={cn(
                        "hover:bg-slate-800/20 transition-colors group cursor-pointer",
                        isStale && "bg-amber-900/5"
                      )}
                    >
                      <td className="px-6 py-5">
                        <div className="text-xs text-white font-medium">
                          {new Date(session.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
                          {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-200">{session.user_id || 'Guest'}</span>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">{session.city_id}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-medium text-slate-300 capitalize">{session.symptom}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                          session.urgency === 'emergency' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                          session.urgency === 'urgent' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}>
                          {session.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs text-slate-400 max-w-[150px] truncate">
                          {session.feedback?.prior_recommendation_source || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {hasFeedback ? (
                          <div className="flex items-center gap-1.5 text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Feedback</span>
                          </div>
                        ) : isStale ? (
                          <div className="flex items-center gap-1.5 text-amber-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Stale (48h+)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-white">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
