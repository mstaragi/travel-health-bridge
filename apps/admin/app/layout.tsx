'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Sidebar } from "../components/Sidebar";
import { DailySummaryCard } from "@travelhealthbridge/shared/ui/DailySummaryCard";
import { useAdminDailySummary } from "@travelhealthbridge/shared/api/supabase";
import { PlusCircle } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

function AdminAppShell({ children }: { children: React.ReactNode }) {
  const { data: summary, isLoading, refetch } = useAdminDailySummary();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
            <div className="flex-1">
              <DailySummaryCard 
                data={summary || null} 
                isLoading={isLoading} 
                onRefresh={refetch}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Quick Log Floating Button */}
        <button 
          className="fixed bottom-8 right-8 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full shadow-2xl shadow-teal-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group font-bold"
          onClick={() => {}} // Opens QuickCaseModal in next step
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Quick Log Case</span>
        </button>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-slate-900`}>
        <QueryClientProvider client={queryClient}>
          <AdminAppShell>{children}</AdminAppShell>
        </QueryClientProvider>
      </body>
    </html>
  );
}
