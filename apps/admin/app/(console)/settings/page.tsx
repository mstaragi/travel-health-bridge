'use client';

import React from 'react';
import { Settings, Shield, Bell, User, Lock, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Console Settings</h2>
        <p className="text-xs text-slate-500 font-medium">Manage platform configuration and operations preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingCard 
          icon={User} 
          title="Account Preferences" 
          description="Manage your ops agent profile and session duration."
        />
        <SettingCard 
          icon={Shield} 
          title="Security & Access" 
          description="Configure Layer 2A protocols and secondary auth factors."
        />
        <SettingCard 
          icon={Bell} 
          title="Notification Triggers" 
          description="Set thresholds for P1 critical alerts and city gap reports."
        />
        <SettingCard 
          icon={Database} 
          title="System Sync" 
          description="Control real-time data polling intervals and cache clearing."
        />
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Advanced Configuration</h3>
            <p className="text-xs text-slate-500">Restricted to Level 3 Administrative access</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-slate-700">
            Export Logs
          </button>
          <button className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-slate-700">
            Rebuild Cache
          </button>
          <button className="px-6 py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-rose-500/20">
            Emergency Lock
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-[#152D45] border border-slate-800 p-6 rounded-3xl group hover:border-teal-500/50 transition-all cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
          <Icon className="w-5 h-5 text-slate-400 group-hover:text-teal-400 transition-colors" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{description}</p>
        </div>
      </div>
    </div>
  );
}
