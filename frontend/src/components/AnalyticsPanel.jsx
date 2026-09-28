import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AnalyticsPanel = () => {
  const benchmarkData = [
    { category: 'General Diabetic Pop.', rate: 11.2 },
    { category: 'Inpatient > 7 Days', rate: 24.5 },
    { category: 'Multiple Prior Visits', rate: 38.1 },
    { category: 'Your Current Patient', rate: 62.1 }
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 mt-6">
      <h3 className="text-base font-bold text-gray-800">Population Risk Benchmarking</h3>
      <p className="text-xs text-gray-400 mb-4">Comparing current patient risk against hospital historic cohorts (%)</p>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={benchmarkData}>
            <XAxis dataKey="category" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip />
            <Bar dataKey="rate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};