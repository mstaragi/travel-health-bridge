'use client';

import React from 'react';
import { useAdminOvercharges } from '@travelhealthbridge/shared/api/supabase';
import { 
  ShieldAlert, 
  User, 
  Stethoscope, 
  MessageCircle, 
  CheckCircle,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function OverchargesPage() {
  const { data: reports, isLoading } = useAdminOvercharges();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Overcharge Queue</h2>
          <p className="text-sm text-slate-500 font-medium">Investigate discrepancies between quoted and charged fees.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-[#152D45] rounded-3xl border border-slate-800 animate-pulse" />
          ))
        ) : (
          reports?.map((report) => (
            <div key={report.id} className="bg-[#152D45] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row group">
              {/* Status Sidebar */}
              <div className={cn(
                "w-full md:w-2 bg-gradient-to-b transition-colors",
                report.status === 'Open' ? "from-rose-500 to-rose-700" : "from-emerald-500 to-emerald-700"
              )} />
              
              <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Provider & Patient */}
                <div className="md:col-span-4 space-y-6">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Reported Provider</div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700 shadow-inner">
                        <Stethoscope className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white leading-tight">
                          {report.provider?.name || 'Unknown Provider'}
                        </h4>
                        <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-1">
                          Ref Fee: ₹{report.provider?.fee_opd || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Traveler Identity</div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-300">
                        {report.user_id || 'Guest User'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Discrepancy Detail */}
                <div className="md:col-span-5 space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fee Discrepancy</div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                      report.status === 'Open' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    )}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-[9px] font-black text-slate-500 uppercase">Quoted</div>
                      <div className="text-xl font-black text-slate-400">₹{report.reported_quoted_fee}</div>
                    </div>
                    <div className="h-8 w-px bg-slate-700" />
                    <div className="text-center">
                      <div className="text-[9px] font-black text-rose-500 uppercase">Charged</div>
                      <div className="text-3xl font-black text-white">₹{report.actual_charged_fee}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Traveler Notes</div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      "{report.notes || 'No additional comments provided.'}"
                    </p>
                  </div>
                </div>

                {/* Recommendation Intel & Actions */}
                <div className="md:col-span-3 h-full flex flex-col justify-between space-y-6">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Rec. Source</div>
                    <div className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                      {report.session?.prior_recommendation_source || 'Platform direct'}
                    </div>
                  </div>

                  <div className="space-y-2 mt-auto">
                    <button className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700 text-xs uppercase tracking-widest">
                      <MessageCircle className="w-4 h-4 text-teal-400" />
                      Contact Clinic
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 text-xs uppercase tracking-widest">
                      <CheckCircle className="w-4 h-4" />
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {reports?.length === 0 && !isLoading && (
          <div className="bg-[#152D45] rounded-3xl p-16 border border-slate-800 border-dashed text-center">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <DollarSign className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Wallet is Clean</h3>
            <p className="text-slate-500 max-w-sm mx-auto">No overcharge reports currently requiring investigation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
