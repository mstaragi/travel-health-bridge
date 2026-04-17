'use client';

import React from 'react';
import { useAdminSessions } from '@travelhealthbridge/shared/api/supabase';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Zap, 
  ArrowRightLeft,
  Calendar,
  User,
  CheckCircle,
  Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ReviewsPage() {
  const { data: sessions, isLoading } = useAdminSessions();
  
  // Extract feedback records from sessions
  const reviews = sessions?.filter(s => !!s.feedback).map(s => ({
    ...s.feedback,
    session: s
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Review Intelligence</h2>
          <p className="text-sm text-slate-500 font-medium">Verify traveler sentiment and internal acknowledgment queue.</p>
        </div>
        <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Acknowledgment Rate</div>
          <div className="text-sm font-black text-emerald-400">92%</div>
        </div>
      </div>

      <div className="columns-1 lg:columns-2 gap-8 space-y-8">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-[#152D45] rounded-3xl border border-slate-800 animate-pulse break-inside-avoid" />
          ))
        ) : (
          reviews.map((review) => {
            const isDisplaced = review.prior_recommendation_source !== 'No — Travel Health Bridge was my first step';
            const reuseIntent = review.reuse_intent === 'yes';

            return (
              <div key={review.id} className="bg-[#152D45] border border-slate-800 rounded-[2rem] p-8 shadow-2xl break-inside-avoid relative overflow-hidden group">
                {/* Header: User & Stars */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700 shadow-inner">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white leading-tight">
                        {review.session?.user_id || 'Anonymous Traveler'}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Zap key={s} className={cn(
                              "w-3 h-3",
                              s <= (review.rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-700"
                            )} />
                          ))}
                        </div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-800 px-2 py-1 rounded-md font-bold uppercase tracking-widest">
                      {review.session?.city_id || 'Global'}
                    </span>
                  </div>
                </div>

                {/* Analysis Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {isDisplaced && (
                    <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3 h-3" />
                      Displaced: {review.prior_recommendation_source.split(' ')[0]}
                    </div>
                  )}
                  {reuseIntent && (
                    <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <ThumbsUp className="w-3 h-3" />
                      Reuse Intent: YES
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 mb-6">
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    "{review.comment || 'No written comment provided.'}"
                  </p>
                </div>

                {/* Internal Ack Control */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                     <Clock className="w-3.5 h-3.5" />
                     Acknowledgment Pending
                   </div>
                   <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest border border-slate-700 transition-all">
                     <CheckCircle className="w-4 h-4 text-teal-500" />
                     Mark Ack
                   </button>
                </div>

                {/* Policy Reminder Overlay Background */}
                <div className="absolute top-0 right-0 p-2 opacity-10">
                   <MessageSquare className="w-32 h-32 text-slate-600 rotate-12" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {reviews.length === 0 && !isLoading && (
        <div className="bg-[#152D45] rounded-3xl p-16 border border-slate-800 border-dashed text-center">
          <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-black text-white mb-2">No feedback processed</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Waiting for travelers to complete their post-visit summaries.</p>
        </div>
      )}
    </div>
  );
}
