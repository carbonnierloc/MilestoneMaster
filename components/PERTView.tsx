import React, { useState, useMemo, useEffect } from 'react';
import { Milestone, Project } from '../types';
import { ArrowRight, AlertCircle, Info } from 'lucide-react';

interface PERTViewProps {
  projects: Project[];
  milestones: Milestone[];
}

interface Node {
  id: string;
  milestone: Milestone;
  x: number;
  y: number;
  level: number;
  isCritical: boolean;
}

const PERTView: React.FC<PERTViewProps> = ({ projects, milestones }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  
  // Update selection if projects change
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  const projectMilestones = useMemo(() => {
    return milestones.filter(m => m.projectId === selectedProjectId);
  }, [selectedProjectId, milestones]);

  // Build the graph and calculate layout
  const { nodes, edges, maxLevel } = useMemo(() => {
    if (projectMilestones.length === 0) return { nodes: [], edges: [], maxLevel: 0 };

    const nodesMap = new Map<string, Node>();
    const edgesList: { from: string; to: string; isCritical: boolean }[] = [];

    // 1. Sort by date for logical flow
    const sorted = [...projectMilestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Assign Levels (Rank)
    // Map milestone ID to its level
    const levels = new Map<string, number>();
    
    // Initialize levels
    sorted.forEach(m => levels.set(m.id, 0));

    // Simple robust leveling: 
    // If B depends on A, Level(B) = max(Level(B), Level(A) + 1)
    // Run multiple passes to propagate
    for (let i = 0; i < sorted.length; i++) {
        sorted.forEach(m => {
            if (m.dependencies) {
                m.dependencies.forEach(depId => {
                    const depLevel = levels.get(depId) || 0;
                    const currentLevel = levels.get(m.id) || 0;
                    if (depLevel + 1 > currentLevel) {
                        levels.set(m.id, depLevel + 1);
                    }
                });
            }
        });
    }

    const maxLvl = Math.max(...Array.from(levels.values()));

    // 3. Assign Coordinates
    // Group by level to determine Y position
    const levelGroups: Record<number, string[]> = {};
    sorted.forEach(m => {
        const lvl = levels.get(m.id) || 0;
        if (!levelGroups[lvl]) levelGroups[lvl] = [];
        levelGroups[lvl].push(m.id);
    });

    const NODE_WIDTH = 220;
    const NODE_HEIGHT = 100;
    const X_SPACING = 300;
    const Y_SPACING = 140;

    sorted.forEach(m => {
        const lvl = levels.get(m.id) || 0;
        const indexInLevel = levelGroups[lvl].indexOf(m.id);
        const totalInLevel = levelGroups[lvl].length;
        
        // Center Y based on number of items
        const yOffset = (indexInLevel - (totalInLevel - 1) / 2) * Y_SPACING;

        nodesMap.set(m.id, {
            id: m.id,
            milestone: m,
            x: lvl * X_SPACING + 50, // Padding left
            y: 300 + yOffset, // Center vertically in canvas
            level: lvl,
            isCritical: false // Calculated later
        });
    });

    // 4. Determine Edges & Critical Path
    // Simplify Critical Path logic: It's the path connecting the latest nodes
    // In a real PERT, it's slack = 0. Here we approximate by checking the longest chain to the last node.
    
    // Find the last node (highest level, latest date)
    let lastNodeId = sorted[sorted.length - 1].id;
    const criticalPathNodes = new Set<string>();
    
    // Backtrack from last node
    const markCritical = (currentId: string) => {
        criticalPathNodes.add(currentId);
        const node = nodesMap.get(currentId);
        if (node?.milestone.dependencies) {
            // Find the dependency that pushes this date the most (or simply the latest one)
            // For now, mark all distinct dependencies as part of critical flow for visualization
            // Or better: find the dependency with the max level (immediate predecessor)
            let maxDepLevel = -1;
            node.milestone.dependencies.forEach(depId => {
                const depLvl = levels.get(depId) || 0;
                if (depLvl > maxDepLevel) maxDepLevel = depLvl;
            });

            node.milestone.dependencies.forEach(depId => {
                 const depLvl = levels.get(depId) || 0;
                 if (depLvl === maxDepLevel) {
                     markCritical(depId);
                 }
            });
        }
    };
    
    if (projectMilestones.length > 0) {
        markCritical(lastNodeId);
    }

    // Update nodes with critical status
    nodesMap.forEach(node => {
        if (criticalPathNodes.has(node.id)) {
            node.isCritical = true;
        }
    });

    // Create Edges
    sorted.forEach(m => {
        if (m.dependencies) {
            m.dependencies.forEach(depId => {
                const source = nodesMap.get(depId);
                const target = nodesMap.get(m.id);
                if (source && target) {
                    edgesList.push({
                        from: depId,
                        to: m.id,
                        isCritical: criticalPathNodes.has(depId) && criticalPathNodes.has(m.id) && (target.level === source.level + 1)
                    });
                }
            });
        }
    });

    return { nodes: Array.from(nodesMap.values()), edges: edgesList, maxLevel: maxLvl };
  }, [projectMilestones]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-500 text-green-700';
      case 'at_risk': return 'bg-amber-50 border-amber-500 text-amber-700';
      case 'delayed': return 'bg-red-50 border-danger text-danger';
      default: return 'bg-white border-primary text-primary';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[600px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-primary uppercase tracking-wide">Sélectionner le Projet :</label>
                <select 
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="p-2 border border-slate-300 rounded text-sm text-slate-700 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent min-w-[250px]"
                >
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-danger"></span>
                    <span className="text-slate-600 font-medium">Chemin Critique</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-slate-300"></span>
                    <span className="text-slate-600 font-medium">Dépendance</span>
                </div>
            </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg overflow-auto relative custom-scrollbar shadow-inner">
            {projectMilestones.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Info className="w-12 h-12 mb-2 opacity-50" />
                    <p>Aucun jalon pour ce projet.</p>
                 </div>
            ) : (
                <div 
                    className="relative min-w-full min-h-full" 
                    style={{ width: `${Math.max(1000, (maxLevel + 1) * 300 + 100)}px`, height: '800px' }}
                >
                    {/* SVG Layer for Edges */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                            </marker>
                            <marker id="arrowhead-critical" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#e2001a" />
                            </marker>
                        </defs>
                        {edges.map((edge, idx) => {
                            const source = nodes.find(n => n.id === edge.from);
                            const target = nodes.find(n => n.id === edge.to);
                            if (!source || !target) return null;

                            // Calculate path
                            const startX = source.x + 200; // Node width
                            const startY = source.y + 40; // Approx half height
                            const endX = target.x;
                            const endY = target.y + 40;

                            const c1x = startX + 50;
                            const c1y = startY;
                            const c2x = endX - 50;
                            const c2y = endY;

                            return (
                                <g key={`${edge.from}-${edge.to}`}>
                                    <path 
                                        d={`M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`}
                                        stroke={edge.isCritical ? "#e2001a" : "#cbd5e1"}
                                        strokeWidth={edge.isCritical ? 3 : 2}
                                        fill="none"
                                        markerEnd={edge.isCritical ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Nodes Layer */}
                    {nodes.map(node => (
                        <div
                            key={node.id}
                            className={`absolute flex flex-col p-3 rounded-lg shadow-md border-l-4 w-[200px] z-10 transition-transform hover:scale-105 ${getStatusColor(node.milestone.status)} ${node.isCritical ? 'ring-2 ring-danger ring-offset-2' : ''}`}
                            style={{ 
                                left: node.x, 
                                top: node.y,
                                // If status is delayed, add red shadow
                                boxShadow: node.milestone.status === 'delayed' ? '0 4px 6px -1px rgba(226, 0, 26, 0.2)' : ''
                            }}
                        >
                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                                {new Date(node.milestone.date).toLocaleDateString()}
                            </div>
                            <div className="font-bold text-sm leading-tight mb-2">
                                {node.milestone.title}
                            </div>
                            
                            {node.isCritical && (
                                <div className="absolute -top-3 -right-3 bg-danger text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                                    CRITIQUE
                                </div>
                            )}

                             {/* Status Badge */}
                             <div className="mt-auto pt-2 border-t border-current/10 flex items-center justify-between text-xs font-medium">
                                <span className="capitalize">{node.milestone.status.replace('_', ' ')}</span>
                                {node.milestone.status === 'delayed' && <AlertCircle className="w-4 h-4" />}
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default PERTView;