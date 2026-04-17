'use client';

import React, { useState } from 'react';
import { 
  supabase,
  TABLES
} from '@travelhealthbridge/shared/api/supabase';
import { useQuery } from '@tanstack/react-query';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit, 
  MapPin, 
  Calendar, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdvisoriesPage() {
  const { data: advisories, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'advisories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAdvisory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advisory?')) return;
    setIsDeleting(true);
    await supabase.from('advisories').delete().eq('id', id);
    refetch();
    setIsDeleting(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Travel Advisories</h2>
          <p className="text-sm text-slate-500 font-medium">Broadcast safety alerts and clinical updates to all travelers.</p>
        </div>
        <button className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-xl shadow-slate-900/20">
          <Plus className="w-4 h-4" />
          Create New Alert
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-slate-400 italic font-medium">Retrieving network alerts...</div>
        ) : advisories?.map((ad) => (
          <div key={ad.id} className="bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group overflow-hidden">
             <div className={cn(
               "h-1 px-8",
               ad.severity === 'danger' ? "bg-rose-500" : ad.severity === 'warning' ? "bg-amber-500" : "bg-teal-500"
             )} />
             <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                   <div className={cn(
                     "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                     ad.severity === 'danger' ? "bg-rose-50 text-rose-700 border-rose-100" : 
                     ad.severity === 'warning' ? "bg-amber-50 text-amber-700 border-amber-100" : 
                     "bg-teal-50 text-teal-700 border-teal-100"
                   )}>
                      {ad.severity}
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                         <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteAdvisory(ad.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 leading-tight mb-2">
                  {ad.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3 mb-6">
                  {ad.content}
                </p>

                <div className="flex flex-col gap-3 pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <MapPin className="w-3 h-3 text-teal-600" />
                      {ad.scope || 'Global — Network Wide'}
                   </div>
                   <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      Expires: {new Date(ad.expires_at).toLocaleDateString()}
                   </div>
                </div>
             </div>
          </div>
        ))}

        {!isLoading && advisories?.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center gap-4">
             <Globe className="w-12 h-12 text-slate-200" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No active advisories found</p>
          </div>
        )}
      </div>

      {/* Advisory Policy Warning */}
      <div className="bg-[#152D45] p-8 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden group mt-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <AlertTriangle className="w-6 h-6 text-amber-400" />
             <span className="text-sm font-black text-white uppercase tracking-widest">Safety Broadcast Protocol</span>
          </div>
          <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-[600px] mb-6 decoration-teal-500/50">
            Advisories appear across all traveler apps in {advisories?.length ? 'active' : 'relevant'} regions. Danger-level alerts trigger persistent top-shelf notification banners in the triage flow.
          </p>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Audit Logged</span>
             </div>
             <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Signed Content</span>
             </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
          <Megaphone size={160} className="text-white" />
        </div>
      </div>
    </div>
  );
}
