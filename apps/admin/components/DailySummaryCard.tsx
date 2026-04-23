'use client';

import React, { useEffect, useState } from 'react';

// Mock values for UI verification
export default function DailySummaryCard() {
  const [sessionCount, setSessionCount] = useState(120);
  const [cityGaps, setCityGaps] = useState(18); // >15 Red
  const [openCases, setOpenCases] = useState(8);   // Amber
  const [staleProviders, setStaleProviders] = useState(2); // Green

  useEffect(() => {
    // Polling logic would go here
    const interval = setInterval(() => {
      // Refresh metric mocked
    }, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  const getMetricColor = (val: number) => {
    if (val < 5) return 'text-green-600';
    if (val <= 15) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white shadow rounded-lg mb-8">
      <div className="p-4 border border-gray-100 rounded">
        <div className="text-sm text-gray-500 font-medium">{"Today's sessions"}</div>
        <div className="text-3xl font-bold text-gray-900 mt-2">{sessionCount}</div>
      </div>
      <div className="p-4 border border-gray-100 rounded">
        <div className="text-sm text-gray-500 font-medium">{"City gaps today"}</div>
        <div className={`text-3xl font-bold mt-2 ${getMetricColor(cityGaps)}`}>{cityGaps}</div>
      </div>
      <div className="p-4 border border-gray-100 rounded">
        <div className="text-sm text-gray-500 font-medium">{"Open cases"}</div>
        <div className={`text-3xl font-bold mt-2 ${getMetricColor(openCases)}`}>{openCases}</div>
      </div>
      <div className="p-4 border border-gray-100 rounded">
        <div className="text-sm text-gray-500 font-medium">{"Stale providers"}</div>
        <div className={`text-3xl font-bold mt-2 ${getMetricColor(staleProviders)}`}>{staleProviders}</div>
      </div>
    </div>
  );
}
