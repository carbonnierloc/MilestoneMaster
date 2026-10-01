import React, { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Project, Milestone, MilestoneStatus } from '../types';

interface DataManagementProps {
  onImportProjects: (projects: Project[]) => void;
  onImportMilestones: (milestones: Milestone[]) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onImportProjects, onImportMilestones }) => {
  const projectInputRef = useRef<HTMLInputElement>(null);
  const milestoneInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // --- CSV Generation Helpers ---

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadProjectTemplate = () => {
    const headers = 'id,name,description,owner,progress';
    const example = 'proj_new_01,Nouveau Site Web,Refonte complète du portail client,Jean Dupont,10';
    downloadCSV(`${headers}\n${example}`, 'modele_projets.csv');
  };

  const handleDownloadMilestoneTemplate = () => {
    const headers = 'id,projectId,title,date,status,description,dependencies';
    const example = 'ms_new_01,proj_new_01,Lancement Beta,2024-12-01,pending,Version beta pour tests,;';
    const exampleWithDep = 'ms_new_02,proj_new_01,Go Live,2025-01-15,at_risk,Mise en prod,ms_new_01';
    downloadCSV(`${headers}\n${example}\n${exampleWithDep}`, 'modele_jalons.csv');
  };

  // --- CSV Parsing Helpers ---

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    // Simple CSV parser handling standard comma separation
    // Note: This basic parser assumes no commas within fields. 
    // For production with complex descriptions containing commas, a regex parser would be needed.
    return lines.map(line => line.split(',').map(cell => cell.trim()));
  };

  const processProjectsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);
        
        // Remove header
        const dataRows = rows.slice(1);
        
        const newProjects: Project[] = dataRows.map(row => {
          if (row.length < 5) throw new Error("Format de colonnes incorrect pour les projets");
          return {
            id: row[0] || `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: row[1],
            description: row[2],
            owner: row[3],
            progress: parseInt(row[4]) || 0
          };
        });

        onImportProjects(newProjects);
        setFeedback({ type: 'success', message: `${newProjects.length} projets importés avec succès.` });
        if (projectInputRef.current) projectInputRef.current.value = '';
      } catch (error) {
        setFeedback({ type: 'error', message: "Erreur lors de l'import des projets. Vérifiez le format CSV." });
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const processMilestonesFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);
        
        // Remove header
        const dataRows = rows.slice(1);
        
        const newMilestones: Milestone[] = dataRows.map(row => {
          if (row.length < 5) throw new Error("Format de colonnes incorrect pour les jalons");
          
          const statusRaw = row[4].toLowerCase();
          const validStatuses: MilestoneStatus[] = ['pending', 'completed', 'delayed', 'at_risk'];
          const status = validStatuses.includes(statusRaw as any) ? (statusRaw as MilestoneStatus) : 'pending';

          const deps = row[6] ? row[6].split(';') : [];

          return {
            id: row[0] || `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            projectId: row[1],
            title: row[2],
            date: row[3], // Expecting YYYY-MM-DD
            status: status,
            description: row[5] || '',
            dependencies: deps
          };
        });

        onImportMilestones(newMilestones);
        setFeedback({ type: 'success', message: `${newMilestones.length} jalons importés avec succès.` });
        if (milestoneInputRef.current) milestoneInputRef.current.value = '';
      } catch (error) {
        setFeedback({ type: 'error', message: "Erreur lors de l'import des jalons. Vérifiez le format CSV (dates YYYY-MM-DD)." });
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-primary mb-2">Centre d'Importation de Données</h2>
        <p className="text-slate-500 text-sm mb-6">
          Utilisez les fichiers CSV pour charger massivement vos projets et vos jalons. 
          Téléchargez d'abord les modèles pour respecter la structure attendue.
        </p>

        {feedback && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="ml-auto hover:underline text-xs">Fermer</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Projects Section */}
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded text-primary">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">1. Projets</h3>
            </div>
            
            <div className="space-y-4">
              <div className="text-sm text-slate-600">
                <p className="font-semibold mb-1">Structure du CSV :</p>
                <code className="bg-slate-200 px-2 py-1 rounded text-xs block mb-2 font-mono">id, name, description, owner, progress</code>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleDownloadProjectTemplate}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Modèle CSV
                </button>
                <div className="flex-1 relative">
                  <input
                    type="file"
                    accept=".csv"
                    ref={projectInputRef}
                    onChange={processProjectsFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded hover:bg-[#001945] text-sm font-medium transition-colors">
                    <Upload className="w-4 h-4" />
                    Importer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones Section */}
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
             <div className="flex items-center gap-3 mb-4">
              <div className="bg-accent/20 p-2 rounded text-accent">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">2. Jalons</h3>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-slate-600">
                <p className="font-semibold mb-1">Structure du CSV :</p>
                <code className="bg-slate-200 px-2 py-1 rounded text-xs block mb-2 font-mono">id, projectId, title, date, status, description, dependencies</code>
                <p className="text-xs text-slate-400 italic">* Dépendances séparées par des points-virgules (;)</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleDownloadMilestoneTemplate}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Modèle CSV
                </button>
                <div className="flex-1 relative">
                  <input
                    type="file"
                    accept=".csv"
                    ref={milestoneInputRef}
                    onChange={processMilestonesFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent text-white rounded hover:bg-[#0085bd] text-sm font-medium transition-colors">
                    <Upload className="w-4 h-4" />
                    Importer
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DataManagement;