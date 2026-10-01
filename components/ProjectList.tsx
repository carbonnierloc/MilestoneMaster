import React from 'react';
import { Project, Milestone } from '../types';
import { Folder, MoreVertical, TrendingUp, Edit2 } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  milestones: Milestone[];
  onEditMilestone?: (milestone: Milestone) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, milestones, onEditMilestone }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const projectMilestones = milestones
          .filter(m => m.projectId === project.id)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const nextMilestone = projectMilestones.find(m => new Date(m.date) >= new Date());

        return (
          <div 
            key={project.id} 
            className="group bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:shadow-xl hover:-translate-y-1 hover:border-accent/30 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary group-hover:text-accent transition-colors duration-300">{project.name}</h3>
                  <p className="text-xs text-slate-500">{project.owner}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-slate-100">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
              {project.description}
            </p>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Progression</span>
                <span className="font-bold text-primary">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-accent h-1.5 rounded-full transition-all duration-1000 ease-out group-hover:bg-primary" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                 <TrendingUp className="w-4 h-4 text-accent" />
                 <span className="text-xs text-slate-500 uppercase font-semibold">Prochain jalon:</span>
              </div>
              <div 
                 className={`mt-1 font-medium text-sm truncate pl-6 transition-colors duration-300 flex items-center justify-between group/milestone ${nextMilestone ? 'cursor-pointer hover:bg-slate-50 rounded px-1 py-1 -ml-1' : ''}`}
                 onClick={() => nextMilestone && onEditMilestone && onEditMilestone(nextMilestone)}
              >
                {nextMilestone ? (
                  <>
                    <span className={nextMilestone.status === 'delayed' ? 'text-danger' : 'text-slate-800 group-hover:text-primary'}>
                      {nextMilestone.title} <span className="text-slate-400 text-xs">({new Date(nextMilestone.date).toLocaleDateString()})</span>
                    </span>
                    <Edit2 className="w-3 h-3 text-slate-300 group-hover/milestone:text-accent opacity-0 group-hover/milestone:opacity-100 transition-all" />
                  </>
                ) : (
                  <span className="text-slate-400 italic">Aucun jalon futur</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectList;