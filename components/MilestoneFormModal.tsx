import React, { useEffect, useState } from 'react';
import { Milestone, Project, MilestoneStatus } from '../types';
import { X, Save, Trash2, Calendar, FileText, AlertTriangle } from 'lucide-react';

interface MilestoneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
  initialData: Milestone | null;
  projects: Project[];
}

const MilestoneFormModal: React.FC<MilestoneFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  projects,
}) => {
  const [formData, setFormData] = useState<Partial<Milestone>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    projectId: projects[0]?.id || '',
    status: 'pending',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset for new entry
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        projectId: projects[0]?.id || '',
        status: 'pending',
        description: '',
      });
    }
  }, [initialData, isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId || !formData.date) return;

    // Create a robust ID if new
    const id = initialData?.id || `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    onSave({
      ...formData,
      id,
      dependencies: initialData?.dependencies || [] // Preserve dependencies as we don't edit them here yet
    } as Milestone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-slide-up">
        
        {/* Header */}
        <div className="bg-primary p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {initialData ? <FileText className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            {initialData ? 'Modifier le Jalon' : 'Nouveau Jalon'}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre du Jalon</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              placeholder="Ex: Mise en production V1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Projet Rattaché</label>
              <select
                required
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-white"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date Cible</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Statut Actuel</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['pending', 'completed', 'at_risk', 'delayed'] as MilestoneStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({ ...formData, status })}
                  className={`px-3 py-2 rounded text-xs font-bold uppercase transition-all border ${
                    formData.status === status
                      ? 'ring-2 ring-offset-1 ring-primary'
                      : 'opacity-60 hover:opacity-100'
                  } ${
                    status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                    status === 'at_risk' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    status === 'delayed' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optionnel)</label>
             <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent h-24 resize-none"
                placeholder="Détails supplémentaires..."
             />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
            {initialData ? (
               <button
                 type="button"
                 onClick={() => onDelete(initialData.id)}
                 className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
               >
                 <Trash2 className="w-4 h-4" />
                 Supprimer
               </button>
            ) : (
               <div></div> // Spacer
            )}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors text-sm font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-[#001945] text-white rounded-md shadow-md transition-all active:scale-95 text-sm font-bold"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MilestoneFormModal;