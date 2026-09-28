import React from 'react';

export const MetricsCard = ({ title, value, subtext, icon: Icon, color = "blue" }) => {
  return (
    <div className="p-5 bg-white rounded-xl shadow-md border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h4 className="text-2xl font-bold text-gray-800 mt-1">{value}</h4>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      {Icon && (
        <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};