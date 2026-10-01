import React, { useMemo } from 'react';
import { MilestoneWithProject, TimeHorizon } from '../types';
import { Calendar, AlertTriangle, CheckCircle, Clock, AlertOctagon } from 'lucide-react';

interface MilestoneForecastProps {
  milestones: MilestoneWithProject[];
  onEdit?: (milestone: MilestoneWithProject) => void;
}

const getHorizon = (dateStr: string): TimeHorizon => {
  const today = new Date();
  const target = new Date(dateStr);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 30) return '1_month';
  if (diffDays <= 60) return '2_months';
  if (diffDays <= 90) return '3_months';
  if (diffDays <= 180) return '6_months';
  return 'later';
};

const HorizonColumn: React.FC<{ 
    title: string; 
    items: MilestoneWithProject[]; 
    headerClass: string; 
    bgHeader: string;
    onEdit?: (m: MilestoneWithProject) => void;
}> = ({ title, items, headerClass, bgHeader, onEdit }) => (
  <div className={`flex flex-col gap-3 min-w-[280px] flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-0 overflow-hidden`}>
    <div className={`flex items-center gap-2 p-4 border-b border-slate-100 ${bgHeader}`}>
      <Clock className={`w-4 h-4 ${headerClass}`} />
      <h3 className={`font-bold text-sm uppercase tracking-wider ${headerClass}`}>{title}</h3>
      <span className="ml-auto bg-white/20 text-white px-2 py-0.5 rounded text-xs font-medium backdrop-blur-sm border border-white/20 shadow-sm">
        {items.length}
      </span>
    </div>
    
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] p-4 pt-2 custom-scrollbar">
      {items.length === 0 ? (
        <div className="text-slate-400 text-sm italic text-center py-4 opacity-70">Aucun jalon</div>
      ) : (
        items.map((m) => (
          <div 
            key={m.id} 
            onClick={() => onEdit && onEdit(m)}
            className="p-3 rounded border border-slate-100 shadow-sm bg-slate-50 group hover:bg-white hover:border-accent/40 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-semibold text-primary truncate max-w-[150px] group-hover:text-accent transition-colors" title={m.projectName}>
                {m.projectName}
              </span>
              <StatusIcon status={m.status} />
            </div>
            <h4 className="font-medium text-slate-800 text-sm mb-2 leading-snug">{m.title}</h4>
            <div className="flex items-center text-xs text-slate-500">
              <Calendar className="w-3 h-3 mr-1 text-slate-400 group-hover:text-primary transition-colors" />
              {new Date(m.date).toLocaleDateString('fr-FR')}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
    case 'at_risk': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'delayed': return <AlertOctagon className="w-4 h-4 text-danger animate-pulse" />;
    default: return <Clock className="w-4 h-4 text-slate-300" />;
  }
};

const MilestoneForecast: React.FC<MilestoneForecastProps> = ({ milestones, onEdit }) => {
  const grouped = useMemo(() => {
    const groups: Record<TimeHorizon, MilestoneWithProject[]> = {
      'overdue': [],
      '1_month': [],
      '2_months': [],
      '3_months': [],
      '6_months': [],
      'later': []
    };

    milestones.forEach(m => {
      const horizon = getHorizon(m.date);
      groups[horizon].push(m);
    });
    
    // Sort by date within groups
    Object.keys(groups).forEach(key => {
        groups[key as TimeHorizon].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return groups;
  }, [milestones]);

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex gap-4 min-w-[1000px]">
        {grouped['overdue'].length > 0 && (
           <HorizonColumn 
             title="En Retard" 
             items={grouped['overdue']} 
             headerClass="text-white"
             bgHeader="bg-danger"
             onEdit={onEdit}
           />
        )}
        <HorizonColumn 
          title="< 1 Mois" 
          items={grouped['1_month']} 
          headerClass="text-white"
          bgHeader="bg-[#002663]" // Primary
          onEdit={onEdit}
        />
        <HorizonColumn 
          title="1 - 2 Mois" 
          items={grouped['2_months']} 
          headerClass="text-white"
          bgHeader="bg-[#004280]" // Lighter Navy
          onEdit={onEdit}
        />
        <HorizonColumn 
          title="2 - 3 Mois" 
          items={grouped['3_months']} 
          headerClass="text-white"
          bgHeader="bg-[#005e9e]" // Mid Blue
          onEdit={onEdit}
        />
        <HorizonColumn 
          title="3 - 6 Mois" 
          items={grouped['6_months']} 
          headerClass="text-white"
          bgHeader="bg-[#007abb]" // Approaching Accent
          onEdit={onEdit}
        />
      </div>
    </div>
  );
};

export default MilestoneForecast;