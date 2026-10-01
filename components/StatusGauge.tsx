import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { LucideIcon } from 'lucide-react';

interface StatusGaugeProps {
  title: string;
  value: number;
  total: number;
  color: string;
  icon: LucideIcon;
  subtext?: string;
}

const StatusGauge: React.FC<StatusGaugeProps> = ({ title, value, total, color, icon: Icon, subtext }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  // Data for the gauge: [Filled part, Empty part]
  const data = [
    { name: 'Value', value: value },
    { name: 'Remaining', value: total - value },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-between h-full relative overflow-hidden">
      
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-2 z-10">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">{title}</h3>
        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Gauge Chart */}
      <div className="w-full h-[120px] relative -mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%" // Move center down to create semi-circle effect
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="90%"
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell key="filled" fill={color} />
              <Cell key="empty" fill="#f1f5f9" /> {/* slate-100 */}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centered Percentage Text */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <span className="text-3xl font-bold text-slate-800">{percentage}%</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center z-10 mt-2">
         <p className="text-sm text-slate-500 font-medium">
           {value} <span className="text-xs text-slate-400">/ {total} jalons</span>
         </p>
         {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

export default StatusGauge;
