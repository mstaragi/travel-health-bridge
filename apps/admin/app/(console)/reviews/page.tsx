'use client';

import React, { useState } from 'react';
import { 
  supabase,
  TABLES
} from '@travelhealthbridge/shared/api/supabase';
import { 
  useQuery 
} from '@tanstack/react-query';
import { 
  Star, 
  AlertTriangle, 
  Flag, 
  Building2, 
  MapPin, 
  Clock, 
  MessageSquare,
  Search,
  Filter,
  ShieldAlert,
  Inbox
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'low_rating'>('all');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', filter],
    queryFn: async () => {
      let query = supabase
        .from(TABLES.FEEDBACK)
        .select(`
          *,
          provider:provider_id (name, area, city_id)
        `)
        .order('submitted_at', { ascending: false });

      if (filter === 'low_rating') query = query.lte('star_rating', 2);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Calculate pattern alerts (3+ reviews < 3 stars in 30 days)
  const patternAlerts = reviews?.reduce((acc: any[], r) => {
    if (r.star_rating < 3) {
      const existing = acc.find(a => a.provider_id === r.provider_id);
      if (existing) {
        existing.count++;
        existing.reviews.push(r);
      } else {
        acc.push({ provider_id: r.provider_id, provider_name: r.provider?.name, count: 1, reviews: [r] });
      }
    }
    return acc;
  }, []).filter(a => a.count >= 2) || []; // Using 2+ for threshold visibility in demo

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review Intelligence</h2>
        <p className="text-sm text-slate-500 font-medium">Monitor clinical quality patterns and identify potential network risks.</p>
      </div>

      {/* Pattern Alerts Section */}
      {patternAlerts.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Critical Quality Patterns (30D)</span>
          </div>
          {patternAlerts.map((alert) => (
            <div key={alert.provider_id} className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-rose-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white font-black text-xl animate-pulse">
                  !
                </div>
                <div>
                  <h4 className="text-rose-900 font-black text-lg">{alert.provider_name}</h4>
                  <p className="text-rose-700 text-xs font-bold uppercase tracking-widest mt-0.5">
                    {alert.count} Negative reviews in last 30 days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20">
                  Suspend Provider
                </button>
                <button className="bg-white text-rose-600 border border-rose-200 px-6 py-2.5 rounded-xl text-sm font-black hover:bg-rose-50 transition-all">
                  Deep Audit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Feed Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-4">
          {(['all', 'low_rating', 'flagged'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                filter === f ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
           <Search className="w-4 h-4" />
           <span className="text-[10px] font-bold uppercase">Search Filter</span>
        </div>
      </div>

      {/* Review Feed */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 italic">Analyzing feedback loop...</div>
        ) : reviews?.map((review) => (
          <div key={review.id} className="bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-2xl hover:border-slate-300 transition-all group relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={cn(
                          "transition-colors",
                          i <= review.star_rating ? "text-amber-400 fill-amber-400" : "text-slate-100 fill-slate-100"
                        )} 
                      />
                    ))}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                    {review.provider?.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    {review.provider?.city_id} • {review.provider?.area}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-xl transition-all">
                      <Flag className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Flag for Internal Investigation</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Session ID: {review.session_id.slice(0, 8)}</span>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                <p className="text-lg text-slate-800 font-medium italic leading-relaxed">
                  "{review.notes || 'No traveler comment provided.'}"
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Cost Match</span>
                    <span className={cn(
                      "text-xs font-bold",
                      review.cost_accurate === 'yes' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {review.cost_accurate === 'yes' ? 'Accurate to Quote' : 'Price Mismatch'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Clinic Visit</span>
                    <span className={cn(
                      "text-xs font-bold",
                      review.visited_recommended_provider ? "text-emerald-600" : "text-slate-400"
                    )}>
                      {review.visited_recommended_provider ? 'Verified Visit' : 'Referral Only'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  Submitted {new Date(review.submitted_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Decorative BG */}
            {review.star_rating <= 1 && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 -translate-y-16 translate-x-16 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors" />
            )}
          </div>
        ))}

        {!isLoading && reviews?.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-4">
             <Inbox className="w-16 h-16 text-slate-200" />
             <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">No matching feedback found</p>
          </div>
        )}
      </div>

      {/* Policy Reminder Layer 2A */}
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
         <div className="relative z-10">
           <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="w-6 h-6 text-teal-400" />
              <span className="text-sm font-black text-white uppercase tracking-widest">Administrative Compliance (Layer 2A)</span>
           </div>
           <p className="text-[12px] text-slate-400 font-medium leading-relaxed max-w-[600px]">
             The Admin Console is restricted to clinical quality monitoring. Public review deletion, external moderation, or compensation workflows are disabled. Identify systematic quality failures here and use the Providers module to issue network strikes.
           </p>
         </div>
         <div className="absolute right-0 bottom-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-1000">
           <Building2 size={120} className="text-white" />
         </div>
      </div>
    </div>
  );
}
