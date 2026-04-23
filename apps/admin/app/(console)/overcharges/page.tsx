'use client';

import React, { useState } from 'react';
import { 
  useAdminOvercharges, 
  supabase,
  TABLES
} from '@travelhealthbridge/shared/api/supabase';
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Clock, 
  Building2, 
  ChevronRight,
  MoreVertical,
  Flag,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function OverchargesPage() {
  const { data: reports, isLoading, refetch } = useAdminOvercharges();
  const [isUpdating, setIsUpdating] = useState(false);

  const resolveReport = async (id: string, status: string) => {
    setIsUpdating(true);
    await supabase.from(TABLES.OVERCHARGE_REPORTS).update({ status }).eq('id', id);
    refetch();
    setIsUpdating(false);
  };

  const issueStrike = async (providerId: string) => {
    const { data: p } = await supabase.from(TABLES.PROVIDERS).select('strike_count').eq('id', providerId).single();
    if (p) {
      await supabase.from(TABLES.PROVIDERS).update({ strike_count: p.strike_count + 1 }).eq('id', providerId);
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Overcharge Queue</h2>
        <p className="text-sm text-slate-500 font-medium">Verify pricing discrepancies and enforce provider fee compliance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 italic">Scanning reports...</div>
        ) : reports?.map((report) => (
          <div 
            key={report.id} 
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all group overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left Column: Context */}
              <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                      report.status === 'Open' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      {report.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      REF: {report.id.slice(0, 8)}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    {report.provider?.name}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Reported {new Date(report.created_at).toLocaleString()}
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Patient Feedback</p>
                  <p className="text-sm text-slate-700 font-medium italic leading-relaxed">
                    "{report.patient_note || 'No patient comment provided.'}"
                  </p>
                </div>
              </div>

              {/* Center Column: Price Comparison */}
              <div className="p-6 md:w-1/3 bg-slate-50/50 flex flex-col justify-center gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Quoted Range</p>
                    <div className="flex items-center text-slate-900 font-black text-xl">
                      <IndianRupee className="w-4 h-4" />
                      {report.provider?.fee_opd?.min}-{report.provider?.fee_opd?.max}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-lg shadow-rose-500/5">
                    <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mb-1">Actual Charged</p>
                    <div className="flex items-center text-rose-600 font-black text-xl">
                      <IndianRupee className="w-4 h-4" />
                      {report.actual_fee}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 rounded-xl border border-rose-100">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <p className="text-xs text-rose-800 font-bold leading-tight">
                    Charged {Math.round((report.actual_fee / report.provider?.fee_opd?.max) * 100 - 100)}% above max quoted fee.
                  </p>
                </div>
              </div>

              {/* Right Column: Decisions */}
              <div className="p-6 md:w-1/3 flex flex-col justify-center gap-3">
                <button 
                  onClick={() => resolveReport(report.id, 'Resolved')}
                  disabled={report.status !== 'Open'}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Close as Resolved
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => issueStrike(report.provider_id)}
                    className="flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Issue Strike
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <Flag className="w-3 h-3" />
                    Flag Case
                  </button>
                </div>
                <button className="flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-teal-600 text-[10px] font-bold uppercase transition-colors">
                  <FileText className="w-3 h-3" />
                  View Original Triage
                </button>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && reports?.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-slate-300">
             <CheckCircle2 className="w-12 h-12 text-emerald-200" />
             <p className="text-slate-500 font-medium">All clear. No open overcharge reports.</p>
          </div>
        )}
      </div>

      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
         <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-teal-500" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Protocol Notice (Layer 2A)</span>
         </div>
         <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
           Financial recoveries and the ₹5,000 guarantee are handled offline by the Layer 3 Claims unit. Use this console ONLY for clinical quality enforcement and issuing strikes to providers who violate cost transparency.
         </p>
      </div>
    </div>
  );
}

const Shield = (props: any) => <FileText {...props} />;
