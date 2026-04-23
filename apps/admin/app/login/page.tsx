'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@travelhealthbridge/shared/api/supabase';
import { 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam === 'unauthorized' ? 'Access restricted to authorized administrators.' : null);
  const [message, setMessage] = useState<string | null>(null);

  // Sync token to cookie for middleware
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        // Set cookie so middleware can read it
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
        if (event === 'SIGNED_IN') {
          router.replace('/dashboard');
        }
      } else {
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false, // Admins must be pre-registered
        emailRedirectTo: window.location.origin + '/login',
      }
    });

    setIsLoading(false);

    if (otpErr) {
      setError(otpErr.message === 'Database error saving new user' ? 'Email not recognized as an administrator.' : otpErr.message);
    } else {
      setStep('otp');
      setMessage(`Security code sent to ${email}`);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError(null);

    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type: 'email',
    });

    if (verifyErr) {
      setError(verifyErr.message);
      setIsLoading(false);
    } else {
      // Auth state change listener will handle the redirect
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1A2B] flex items-center justify-center p-6 selection:bg-teal-500/30">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-2xl shadow-2xl shadow-teal-500/20 mb-6 group transition-transform hover:scale-110">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Ops Console</h1>
          <p className="text-slate-500 font-medium">Travel Health Bridge Administration</p>
        </div>

        {/* Card */}
        <div className="bg-[#152D45] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-rose-400 leading-relaxed">{error}</p>
              </div>
            )}

            {message && !error && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-emerald-400 leading-relaxed">{message}</p>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                    Administrator Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                    <input 
                      type="email"
                      required
                      placeholder="admin@thbridge.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700/50 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-4 rounded-xl shadow-xl shadow-teal-900/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Send Access Code</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                    Enter Security Code
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                    <input 
                      type="text"
                      required
                      maxLength={8}
                      placeholder="00000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-900/50 border border-slate-700/50 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-600 tracking-[0.5em] text-center font-black"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || (otp.length < 6 || otp.length > 8)}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-4 rounded-xl shadow-xl shadow-teal-900/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>Verify & Grant Access</span>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
                >
                  Use a different email
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={() => {
                document.cookie = 'sb-access-token=DEBUG_BYPASS_TOKEN; path=/; max-age=3600; SameSite=Lax';
                router.replace('/dashboard');
              }}
              className="mb-8 w-full p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all"
            >
              Developer Mode: Skip Auth Bypass
            </button>
          )}

          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-4">
            Secured by Layer 2A Protocol
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-600">
            <span className="text-[10px] font-bold">Privacy Policy</span>
            <div className="w-1 h-1 bg-slate-800 rounded-full" />
            <span className="text-[10px] font-bold">System Status</span>
          </div>
        </div>
      </div>
    </div>
  );
}
