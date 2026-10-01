import React, { useState } from 'react';
import { MilestoneWithProject } from '../types';
import { analyzeScheduleRisks } from '../services/geminiService';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  milestones: MilestoneWithProject[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ milestones }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeScheduleRisks(milestones);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-[#eef2ff] to-[#f0f9ff] rounded border border-[#bfdbfe] p-6 shadow-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-accent/10 rounded-full blur-xl"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded shadow-sm border border-slate-100">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-bold text-primary">Assistant IA de Delivery</h2>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-[#001945] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              {analysis ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {analysis ? "Rafraîchir l'analyse" : "Analyser les risques"}
            </>
          )}
        </button>
      </div>

      {!analysis && !loading && (
        <p className="text-slate-600 text-sm max-w-2xl">
          Cliquez sur le bouton pour générer une analyse des risques, des goulots d'étranglement et des recommandations basées sur vos jalons à venir (1-6 mois).
        </p>
      )}

      {analysis && (
        <div className="bg-white/90 backdrop-blur rounded p-5 border border-slate-200 text-slate-800 text-sm leading-relaxed prose prose-blue max-w-none shadow-sm">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;