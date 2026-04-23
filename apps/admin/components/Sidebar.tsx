'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Stethoscope, 
  AlertCircle, 
  MessageSquare, 
  Activity, 
  Megaphone, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Providers', href: '/providers', icon: Stethoscope },
  { name: 'Overcharges', href: '/overcharges', icon: AlertCircle },
  { name: 'Reviews', href: '/reviews', icon: MessageSquare },
  { name: 'Monitor', href: '/sessions', icon: Activity },
  { name: 'Advisories', href: '/advisories', icon: Megaphone },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-500/20">
          THB
        </div>
        <div>
          <h1 className="text-white font-bold text-sm tracking-tight">Health Bridge</h1>
          <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Ops Console</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="font-semibold text-sm">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1 h-4 rounded-full bg-teal-500 shadow-sm shadow-teal-500/50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button 
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:text-rose-400" />
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
           <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-3 h-3 text-teal-500" />
              <span className="text-[10px] font-bold text-slate-300 uppercase">Layer 2A Security</span>
           </div>
           <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
             Personal data is redacted. Financial recoveries managed by Layer 3.
           </p>
        </div>
      </div>
    </div>
  );
}
