import React, { useMemo, useRef, useEffect } from 'react';
import { MilestoneWithProject } from '../types';
import { Calendar, CheckCircle, AlertTriangle, AlertOctagon, Clock, User, ArrowRight } from 'lucide-react';

interface TimelineViewProps {
  milestones: MilestoneWithProject[];
  onEdit?: (milestone: MilestoneWithProject) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ milestones, onEdit }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group milestones by Month Year (e.g., "Octobre 2023")
  const groupedMilestones = useMemo(() => {
    const groups: Record<string, MilestoneWithProject[]> = {};
    
    // Sort chronologically
    const sorted = [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(m => {
      const date = new Date(m.date);
      // Capitalize first letter of month
      const monthYear = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });

    return groups;
  }, [milestones]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'at_risk': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'delayed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-primary border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'at_risk': return <AlertTriangle className="w-3 h-3" />;
      case 'delayed': return <AlertOctagon className="w-3 h-3 animate-pulse" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getCardBorderColor = (status: string) => {
      switch (status) {
        case 'delayed': return 'border-danger';
        case 'at_risk': return 'border-amber-500';
        case 'completed': return 'border-success';
        default: return 'border-accent';
      }
  };

  return (
    <div className="w-full">
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-8 custom-scrollbar scroll-smooth"
      >
        <div className="flex min-w-max px-4">
          {Object.entries(groupedMilestones).map(([month, items]: [string, MilestoneWithProject[]], index, array) => (
            <div key={month} className="relative flex flex-col w-[350px]">
              
              {/* Timeline Axis Line */}
              <div className="absolute top-[24px] left-0 right-0 h-[2px] bg-slate-200" />
              
              {/* Header Section */}
              <div className="relative z-10 flex items-center mb-6 px-4">
                {/* Timeline Dot */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-md mr-3 z-10 transition-transform duration-300 hover:scale-110">
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>
                
                {/* Month Label */}
                <div className="bg-primary px-3 py-1.5 rounded shadow-sm z-10 transition-transform duration-300 hover:-translate-y-0.5">
                   <h3 className="font-bold text-white text-sm whitespace-nowrap flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-accent" />
                     {month}
                   </h3>
                </div>
              </div>

              {/* Milestones Column */}
              <div className="flex flex-col gap-3 px-4 border-l-2 border-dashed border-slate-300 ml-[23px] pb-4">
                {items.map((m) => (
                  <div 
                    key={m.id} 
                    onClick={() => onEdit && onEdit(m)}
                    className={`bg-white rounded-r-lg border-l-4 p-3 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group ${getCardBorderColor(m.status)} border-y border-r border-slate-100 cursor-pointer`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate max-w-[120px] group-hover:text-primary transition-colors">
                         {m.projectName}
                       </span>
                       <div className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(m.status)}`}>
                          {getStatusIcon(m.status)}
                          <span className="capitalize">{m.status.replace('_', ' ')}</span>
                        </div>
                    </div>
                    
                    <h4 className="font-semibold text-primary text-sm mb-2 leading-tight group-hover:text-accent transition-colors">
                      {m.title}
                    </h4>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                       <div className="flex items-center gap-1.5">
                          <div className="bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 text-xs font-medium group-hover:bg-slate-200 transition-colors">
                            {new Date(m.date).getDate()}
                          </div>
                          <span className="text-xs text-slate-400 group-hover:text-slate-600">
                             {new Date(m.date).toLocaleString('fr-FR', { weekday: 'short' })}
                          </span>
                       </div>
                       
                       <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-primary transition-colors" title={`Owner: ${m.projectOwner}`}>
                          <User className="w-3 h-3" />
                          <span className="max-w-[80px] truncate">{m.projectOwner}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* End cap/arrow for future */}
          <div className="flex items-center px-8 relative opacity-50">
             <div className="absolute top-[24px] left-0 w-full h-[2px] bg-gradient-to-r from-slate-200 to-transparent" />
             <div className="relative z-10 w-12 h-12 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-slate-400" />
             </div>
             <span className="ml-3 text-sm font-medium text-slate-400 italic">Futur...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;