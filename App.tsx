import React, { useState, useMemo } from 'react';
import { LayoutDashboard, CalendarDays, Rocket, Plus, List, CheckCircle2, AlertOctagon, Network, Database } from 'lucide-react';
import { MOCK_PROJECTS, MOCK_MILESTONES } from './constants';
import { Project, Milestone, MilestoneWithProject } from './types';
import ProjectList from './components/ProjectList';
import MilestoneForecast from './components/MilestoneForecast';
import TimelineView from './components/TimelineView';
import AIAdvisor from './components/AIAdvisor';
import StatusGauge from './components/StatusGauge';
import PERTView from './components/PERTView';
import MilestoneFormModal from './components/MilestoneFormModal';
import DataManagement from './components/DataManagement';

// Simple implementation of Recharts for visualization (optional but adds value)
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forecast' | 'timeline' | 'projects' | 'pert' | 'data'>('forecast');
  
  // State for projects and milestones
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  // CRUD Handlers
  const handleOpenCreate = () => {
    setEditingMilestone(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleSaveMilestone = (milestone: Milestone) => {
    setMilestones((prev) => {
      const exists = prev.find((m) => m.id === milestone.id);
      if (exists) {
        return prev.map((m) => (m.id === milestone.id ? milestone : m));
      } else {
        return [...prev, milestone];
      }
    });
    setIsModalOpen(false);
  };

  const handleDeleteMilestone = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce jalon ?")) {
      setMilestones((prev) => prev.filter((m) => m.id !== id));
      setIsModalOpen(false);
    }
  };

  // Import Handlers
  const handleImportProjects = (newProjects: Project[]) => {
    setProjects(prev => {
      // Merge logic: Overwrite if ID exists, else add
      const updated = [...prev];
      newProjects.forEach(np => {
        const idx = updated.findIndex(p => p.id === np.id);
        if (idx >= 0) {
          updated[idx] = np;
        } else {
          updated.push(np);
        }
      });
      return updated;
    });
  };

  const handleImportMilestones = (newMilestones: Milestone[]) => {
    setMilestones(prev => {
      // Merge logic
      const updated = [...prev];
      newMilestones.forEach(nm => {
        const idx = updated.findIndex(m => m.id === nm.id);
        if (idx >= 0) {
          updated[idx] = nm;
        } else {
          updated.push(nm);
        }
      });
      return updated;
    });
  };

  // Combine milestone with project info for easier display
  const enrichedMilestones: MilestoneWithProject[] = useMemo(() => {
    return milestones.map(m => {
      const proj = projects.find(p => p.id === m.projectId);
      return {
        ...m,
        projectName: proj?.name || 'Inconnu',
        projectOwner: proj?.owner || 'N/A'
      };
    });
  }, [projects, milestones]);

  // Statistics for Dashboard
  const stats = useMemo(() => {
    const total = enrichedMilestones.length;
    const completed = enrichedMilestones.filter(m => m.status === 'completed').length;
    const delayed = enrichedMilestones.filter(m => m.status === 'delayed').length;
    const atRisk = enrichedMilestones.filter(m => m.status === 'at_risk').length;
    const pending = enrichedMilestones.filter(m => m.status === 'pending').length;
    
    // Data for charts: Milestones per month
    const timelineData: Record<string, number> = {};
    
    // Sort to ensure chart is chronological
    const sortedMilestones = [...enrichedMilestones].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedMilestones.forEach(m => {
      const month = new Date(m.date).toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
      timelineData[month] = (timelineData[month] || 0) + 1;
    });
    
    const chartData = Object.entries(timelineData).map(([name, count]) => ({ name, count }));

    return { total, completed, delayed, atRisk, pending, chartData };
  }, [enrichedMilestones]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fa]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded shadow-sm">
              <Rocket className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
              MilestoneMaster
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleOpenCreate}
              className="hidden sm:flex items-center gap-2 bg-primary hover:bg-[#001945] text-white px-4 py-2 rounded text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95 duration-200"
            >
              <Plus className="w-4 h-4" />
              Nouveau Jalon
            </button>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-primary border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
              SM
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Tabs - Styled with Thales Blue Accents & Interactive States */}
          <div className="flex flex-wrap gap-1 bg-white p-1 rounded-lg w-fit mb-8 border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('forecast')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 ${
                activeTab === 'forecast' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-600 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Prévisions
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 ${
                activeTab === 'timeline' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-600 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <List className="w-4 h-4" />
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('pert')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 ${
                activeTab === 'pert' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-600 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <Network className="w-4 h-4" />
              PERT
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 ${
                activeTab === 'projects' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-600 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Projets
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 ${
                activeTab === 'data' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-600 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <Database className="w-4 h-4" />
              Données
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 ${
                activeTab === 'dashboard' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-600 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          </div>

          {/* Tab Content with Animation */}
          <div key={activeTab} className="space-y-8 animate-slide-up">
            
            {/* AI Advisor - Always visible on Forecast and Dashboard */}
            {(activeTab === 'forecast' || activeTab === 'dashboard' || activeTab === 'timeline') && (
               <AIAdvisor milestones={enrichedMilestones} />
            )}

            {/* Forecast View */}
            {activeTab === 'forecast' && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-4 border-l-4 border-accent pl-3">Calendrier des Livraisons par Horizon</h2>
                <MilestoneForecast 
                  milestones={enrichedMilestones} 
                  onEdit={handleOpenEdit} 
                />
              </div>
            )}

            {/* Timeline View */}
            {activeTab === 'timeline' && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-8 ml-4 border-l-4 border-accent pl-3">Chronologie des Jalons</h2>
                <TimelineView 
                  milestones={enrichedMilestones} 
                  onEdit={handleOpenEdit}
                />
              </div>
            )}

            {/* PERT View */}
            {activeTab === 'pert' && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-4 border-l-4 border-accent pl-3">Analyse du Chemin Critique</h2>
                <PERTView projects={projects} milestones={milestones} />
              </div>
            )}

            {/* Project Grid */}
            {activeTab === 'projects' && (
              <ProjectList 
                projects={projects} 
                milestones={milestones} 
                onEditMilestone={handleOpenEdit}
              />
            )}
            
            {/* Data Management View */}
            {activeTab === 'data' && (
               <DataManagement 
                  onImportProjects={handleImportProjects}
                  onImportMilestones={handleImportMilestones}
               />
            )}

            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Gauge: Completed */}
                  <div className="h-64 hover:-translate-y-1 transition-transform duration-300">
                    <StatusGauge 
                      title="Jalons Atteints"
                      value={stats.completed}
                      total={stats.total}
                      color="#009a44" // Thales Green-ish
                      icon={CheckCircle2}
                      subtext="Livrés avec succès"
                    />
                  </div>

                  {/* Gauge: Delayed */}
                  <div className="h-64 hover:-translate-y-1 transition-transform duration-300 delay-75">
                    <StatusGauge 
                      title="Jalons Dépassés"
                      value={stats.delayed}
                      total={stats.total}
                      color="#e2001a" // Thales Red
                      icon={AlertOctagon}
                      subtext="Nécessite attention immédiate"
                    />
                  </div>

                  {/* Simple Stats Cards */}
                  <div className="h-64 flex flex-col gap-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                           <Rocket className="w-16 h-16 text-primary" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wide">Total Projets</p>
                        <p className="text-3xl font-bold text-primary">{projects.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                         <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                           <CalendarDays className="w-16 h-16 text-accent" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wide">Jalons à venir</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-accent">{stats.pending}</p>
                        </div>
                    </div>
                  </div>

                  {/* Risk Card */}
                  <div className="h-64 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                     <div className="mb-auto w-full">
                        <p className="text-slate-500 text-sm font-medium mb-4 uppercase tracking-wide">Indicateurs de Risque</p>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm text-slate-600">À Risque</span>
                           <span className="text-lg font-bold text-amber-500">{stats.atRisk}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                           <div className="bg-amber-500 h-2 rounded-full animate-[width_1s_ease-out]" style={{ width: `${(stats.atRisk / stats.total) * 100}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm text-slate-600">Dépassés</span>
                           <span className="text-lg font-bold text-danger">{stats.delayed}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                           <div className="bg-danger h-2 rounded-full animate-[width_1s_ease-out]" style={{ width: `${(stats.delayed / stats.total) * 100}%` }}></div>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[350px] hover:shadow-md transition-shadow duration-300">
                  <h3 className="font-bold text-primary mb-4 uppercase text-sm tracking-wide">Densité des livraisons par mois</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chartData}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} 
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#002663', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{fill: '#f1f5f9'}}
                      />
                      <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={50} animationDuration={1000}>
                        {stats.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#0096D6" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Form Modal */}
      <MilestoneFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMilestone}
        onDelete={handleDeleteMilestone}
        initialData={editingMilestone}
        projects={projects}
      />
    </div>
  );
}

export default App;