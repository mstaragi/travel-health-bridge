'use client';

import React from 'react';
import { 
  useAdminSessions, 
  useAdminDailySummary 
} from '@travelhealthbridge/shared/api/supabase';
import { 
  calculateDisplacementRate, 
  calculateReuseIntentRate 
} from '@travelhealthbridge/shared/utils/displacement';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Search, 
  AlertTriangle,
  PhoneOff,
  MapPinOff,
  ArrowRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function OverviewPage() {
  const { data: sessions, isLoading: isSessionsLoading } = useAdminSessions();
  const { data: summary } = useAdminDailySummary();

  // Extract feedback for rates
  const feedbackData = sessions?.map(s => s.feedback).filter(Boolean).flat() || [];
  const displacementRate = calculateDisplacementRate(feedbackData);
  const reuseRate = calculateReuseIntentRate(feedbackData);

  // Group no-answers (simulated from sessions for now)
  const noAnswerEvents = sessions?.filter(s => s.call_now_tapped_at && !s.feedback) || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Primary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Displacement Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl p-8 shadow-2xl shadow-teal-500/20 group">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 text-teal-100/80 mb-4 font-black uppercase tracking-widest text-xs">
              <Target className="w-4 h-4" />
              Core Impact Metric
            </div>
            <h3 className="text-white text-lg font-black tracking-tight leading-tight mb-2">
              True Displacement Rate
            </h3>
            <div className="flex items-baseline gap-3 mt-auto">
              <span className="text-6xl font-black text-white tracking-tighter">
                {displacementRate.toFixed(1)}%
              </span>
              <span className="text-teal-200 font-bold text-sm bg-teal-400/20 px-3 py-1 rounded-full border border-teal-300/30">
                Rolling 7-Day
              </span>
            </div>
            <p className="text-teal-50/70 text-sm mt-6 leading-relaxed max-w-[280px]">
              Percentage of travelers we successfully diverted from hotel/Google recommendations to verified providers.
            </p>
          </div>
          {/* Decorative Background Element */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* PMF Signal Card */}
        <div className="relative overflow-hidden bg-[#152D45] border border-slate-800 rounded-3xl p-8 shadow-2xl group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-500 mb-4 font-black uppercase tracking-widest text-xs">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              PMF Signal
            </div>
            <h3 className="text-white text-lg font-black tracking-tight leading-tight mb-2">
              Reuse Intent
            </h3>
            <div className="flex items-baseline gap-3 mt-auto">
              <span className="text-6xl font-black text-white tracking-tighter">
                {reuseRate.toFixed(1)}%
              </span>
              <span className="text-slate-400 font-bold text-sm bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                Travelers say "Yes"
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-6 leading-relaxed">
              Users who confirmed they would use Travel Health Bridge in another city.
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Provider No-Answers */}
        <div className="bg-[#152D45] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <PhoneOff className="w-4 h-4 text-rose-500" />
              Provider No-Answers
            </h3>
            <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-1 rounded border border-rose-500/20 font-black">
              7D REPORT
            </span>
          </div>
          <div className="divide-y divide-slate-800/50">
            {noAnswerEvents.slice(0, 5).map((event, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 font-black">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Pending Verification</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      {event.city_id} • {event.symptom}
                    </p>
                  </div>
                </div>
                <div className="text-right px-4">
                  <p className="text-xs font-black text-rose-400">No Answer</p>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase">{new Date(event.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {noAnswerEvents.length === 0 && (
              <div className="p-12 text-center text-slate-600 italic text-sm">
                No recent no-answer events reported.
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-900/50 border-t border-slate-800">
            <button className="text-[10px] font-black uppercase tracking-widest text-teal-400 hover:text-teal-300 w-full flex items-center justify-center gap-2 group transition-colors">
              View All Incident Logs
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* City Gaps */}
        <div className="bg-[#152D45] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <MapPinOff className="w-4 h-4 text-amber-500" />
              Top Requested Cities (Uncovered)
            </h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20 font-black">
              LIVE
            </span>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              {[
                { name: 'Hyderabad', hits: 42, trends: 'up' },
                { name: 'Chennai', hits: 31, trends: 'stable' },
                { name: 'Kochi', hits: 18, trends: 'up' },
              ].map((city) => (
                <div key={city.name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between font-bold text-xs uppercase tracking-widest">
                    <span className="text-slate-300">{city.name}</span>
                    <span className="text-white">{city.hits} hits</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${(city.hits / 50) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-slate-900/50 border-t border-slate-800">
            <button className="text-[10px] font-black uppercase tracking-widest text-teal-400 hover:text-teal-300 w-full flex items-center justify-center gap-2 group transition-colors">
              Update Expansion Map
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
