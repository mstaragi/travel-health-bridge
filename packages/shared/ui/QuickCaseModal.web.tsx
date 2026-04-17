import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, AlertCircle, MessageSquare, Clock, Shield } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type CaseSeverity = 'P1' | 'P2' | 'P3' | 'P4';

interface QuickCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    severity: CaseSeverity;
    category: string;
    notes: string;
    case_id: string;
    opened_at: string;
  }) => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  'Medical Emergency',
  'Provider Issue',
  'Language Barrier',
  'Payment/Overcharge',
  'Travel Delay',
  'Documentation',
  'Insurance Link',
  'Other'
];

export function QuickCaseModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: QuickCaseModalProps) {
  const [severity, setSeverity] = useState<CaseSeverity>('P3');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const case_id = `THB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    onSubmit({
      severity,
      category,
      notes,
      case_id,
      opened_at: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0D2137] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-400" />
              Quick Log Case
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
              Internal Ops Only • Layer 2A
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Severity */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Impact Severity
            </label>
            <div className="grid grid-cols-4 gap-3">
              {(['P1', 'P2', 'P3', 'P4'] as CaseSeverity[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSeverity(level)}
                  className={cn(
                    "py-3 rounded-xl font-black text-sm border transition-all duration-200",
                    severity === level 
                      ? level === 'P1' ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]" :
                        level === 'P2' ? "bg-amber-500 text-white border-amber-400" :
                        level === 'P3' ? "bg-teal-500 text-white border-teal-400" :
                        "bg-slate-600 text-white border-slate-500"
                      : "bg-slate-800/50 text-slate-500 border-slate-700 hover:border-slate-600"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic">
              {severity === 'P1' ? 'Critical: Life threat or full system failure' :
               severity === 'P2' ? 'High: Urgent medical or payment block' :
               severity === 'P3' ? 'Medium: Standard inquiry / follow-up' :
               'Low: General feedback / Non-urgent'}
            </p>
          </div>

          {/* Category */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all",
                    category === cat
                      ? "bg-teal-900/40 text-teal-400 border border-teal-500"
                      : "bg-slate-800 text-slate-500 border border-slate-800 hover:border-slate-700"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Initial Observations
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter critical details from conversation..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 min-h-[100px] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!category || isLoading}
            className={cn(
              "w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all",
              !category || isLoading
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 active:scale-[0.98]"
            )}
          >
            {isLoading ? 'Processing...' : 'Log Case in One Tap'}
          </button>
        </form>
      </div>
    </div>
  );
}
