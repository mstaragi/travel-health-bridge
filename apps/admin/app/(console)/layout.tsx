'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Stethoscope, 
  AlertCircle, 
  MessageSquare, 
  ShieldAlert, 
  History, 
  Bell,
  Settings,
  PlusCircle,
  Activity
} from 'lucide-react';
import { DailySummaryCard, QuickCaseModal } from '@travelhealthbridge/shared/ui';
import { useAdminDailySummary } from '@travelhealthbridge/shared/api/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const { data: summaryData, isLoading: isSummaryLoading, refetch: refetchSummary } = useAdminDailySummary();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Providers', href: '/providers', icon: Stethoscope },
    { name: 'Overcharge Queue', href: '/overcharges', icon: ShieldAlert },
    { name: 'Review Intel', href: '/reviews', icon: AlertCircle },
    { name: 'Sessions', href: '/sessions', icon: History },
    { name: 'Advisories', href: '/advisories', icon: Bell },
  ];

  return (
    <div className="flex h-screen bg-[#0D2137] text-slate-200 font-sans selection:bg-teal-500/30">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-800/50 flex flex-col bg-[#0D2137] z-30">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">Travel Health Bridge</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 opacity-70">Admin Ops Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  "active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-teal-500 outline-none",
                  isActive 
                    ? "bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.05)]" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent hover:border-slate-700/50"
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-teal-500 rounded-r-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                )}
                
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800/50 space-y-4">
          <button 
            onClick={() => setIsCaseModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] border border-slate-700 shadow-xl"
          >
            <PlusCircle className="w-4 h-4 text-teal-400" />
            <span className="text-xs uppercase tracking-widest">Quick Log Case</span>
          </button>
          
          <Link 
            href="/settings" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0A1A2B]">
        {/* Header with Global Stats */}
        <header className="px-8 py-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight capitalize">
                {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Real-time operations monitoring</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Live</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-black text-white leading-none">Ops Agent</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">On Duty</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700 shadow-inner" />
              </div>
            </div>
          </div>

          <DailySummaryCard 
            data={summaryData || null} 
            isLoading={isSummaryLoading} 
            onRefresh={() => refetchSummary()} 
          />
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {children}
        </div>
      </main>

      <QuickCaseModal 
        isOpen={isCaseModalOpen} 
        onClose={() => setIsCaseModalOpen(false)}
        onSubmit={(data) => {
          console.log('Log Case:', data);
          setIsCaseModalOpen(false);
          // TODO: Call useMutation to save case
        }}
      />
    </div>
  );
}
