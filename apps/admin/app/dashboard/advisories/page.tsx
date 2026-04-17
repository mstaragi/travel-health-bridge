'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, TABLES, queryKeys } from '@travelhealthbridge/shared/api/supabase';
import { 
  Bell, 
  MapPin, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Plus,
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdvisoriesPage() {
  const { data: advisories, isLoading } = useQuery({
    queryKey: queryKeys.admin.advisories,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.ADVISORIES)
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Health Advisories</h2>
          <p className="text-sm text-slate-500 font-medium">Broadcast localized medical alerts and city-wide safety notices.</p>
        </div>
        <button className="bg-rose-500 hover:bg-rose-400 text-white font-black px-8 py-4 rounded-2xl text-sm shadow-xl shadow-rose-500/20 transition-all active:scale-[0.98] flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Alert
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-[#152D45] rounded-3xl border border-slate-800 animate-pulse" />
          ))
        ) : (
          advisories?.map((advisory) => {
            const isExpired = new Date(advisory.expiry_at) < new Date();
            const severity = advisory.urgency || 'Medium';

            return (
              <div key={advisory.id} className="bg-[#152D45] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row group">
                {/* Severity Indicator */}
                <div className={cn(
                  "w-full md:w-3 bg-gradient-to-b transition-colors",
                  isExpired ? "from-slate-700 to-slate-900" :
                  severity === 'High' ? "from-rose-500 to-rose-700" :
                  severity === 'Medium' ? "from-amber-500 to-amber-700" :
                  "from-teal-500 to-teal-700"
                )} />

                <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Alert Identity */}
                  <div className="md:col-span-8 flex gap-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner",
                      isExpired ? "bg-slate-900 border-slate-800 text-slate-700" :
                      severity === 'High' ? "bg-rose-900/40 border-rose-500/20 text-rose-500" :
                      "bg-amber-900/40 border-amber-500/20 text-amber-500"
                    )}>
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-teal-500" />
                          {advisory.city_id || 'All India'}
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                          isExpired ? "bg-slate-800 text-slate-500 border-slate-700" :
                          "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}>
                          {isExpired ? 'Expired' : 'Live Broadcast'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white leading-tight">
                        {advisory.condition || 'General Health Advisory'}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                        {advisory.content || 'Please follow standard precautions in the affected areas.'}
                      </p>
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="md:col-span-4 flex flex-col justify-between h-full space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                        <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Published</div>
                        <div className="text-[11px] font-bold text-slate-300">
                          {new Date(advisory.published_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                        <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Expiry</div>
                        <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-rose-500" />
                          {new Date(advisory.expiry_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all border border-slate-700 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        Extend
                      </button>
                      <button className="flex-1 bg-rose-900/20 hover:bg-rose-900/40 text-rose-500 font-bold py-3 rounded-xl transition-all border border-rose-500/20 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-500" />
                        Kill Switch
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {advisories?.length === 0 && !isLoading && (
          <div className="bg-[#152D45] rounded-3xl p-16 border border-slate-800 border-dashed text-center">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <Bell className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Total Serenity</h3>
            <p className="text-slate-500 max-w-sm mx-auto">No active medical alerts or advisories currently published.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function XCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
