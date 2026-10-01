import { Project, Milestone } from './types';

// Helper to generate dates relative to today
const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Refonte Site E-commerce',
    description: 'Migration vers une architecture headless et refonte UX complète.',
    owner: 'Sophie Martin',
    progress: 35,
  },
  {
    id: 'p2',
    name: 'App Mobile CRM',
    description: 'Application pour les forces de vente terrain avec mode offline.',
    owner: 'Thomas Dubois',
    progress: 60,
  },
  {
    id: 'p3',
    name: 'Migration Cloud GCP',
    description: 'Déplacement de l\'infrastructure on-premise vers Google Cloud Platform.',
    owner: 'Karim Benali',
    progress: 15,
  },
  {
    id: 'p4',
    name: 'Intégration IA Support',
    description: 'Chatbot intelligent RAG pour le service client niveau 1.',
    owner: 'Alice Durand',
    progress: 80,
  },
  {
    id: 'p5',
    name: 'Dashboard Analytics RH',
    description: 'Centralisation des données collaborateurs et visualisation PowerBI.',
    owner: 'Marc Levy',
    progress: 90,
  },
  {
    id: 'p6',
    name: 'Refonte API Gateway',
    description: 'Sécurisation et standardisation des APIs du groupe.',
    owner: 'Julie Nostra',
    progress: 45,
  },
  {
    id: 'p7',
    name: 'Mise en conformité RGPD V2',
    description: 'Audit et mise à jour des processus de consentement cookies.',
    owner: 'David Chen',
    progress: 20,
  },
  {
    id: 'p8',
    name: 'Architecture Micro-services',
    description: 'Découpage du monolithe Legacy en services autonomes.',
    owner: 'Sarah Connor',
    progress: 5,
  }
];

export const MOCK_MILESTONES: Milestone[] = [
  // Overdue / Past (Recent)
  { id: 'm01', projectId: 'p2', title: 'Atelier Conception Technique', date: addDays(-5), status: 'completed' },
  { id: 'm02', projectId: 'p5', title: 'Recette Utilisateur (UAT)', date: addDays(-2), status: 'delayed' },

  // Project 1 (E-commerce) Chain - Designed for PERT
  { id: 'm1', projectId: 'p1', title: 'Validation Maquettes UX', date: addDays(5), status: 'completed' },
  { id: 'm6', projectId: 'p1', title: 'Début Développement Front', date: addDays(20), status: 'pending', dependencies: ['m1'] },
  { id: 'm8', projectId: 'p1', title: 'Livraison Page Accueil', date: addDays(35), status: 'pending', dependencies: ['m6'] },
  { id: 'm15', projectId: 'p1', title: 'Intégration Paiement Stripe', date: addDays(70), status: 'pending', dependencies: ['m6'] }, // Parallel branch
  { id: 'm22', projectId: 'p1', title: 'Tests de Charge Black Friday', date: addDays(130), status: 'pending', dependencies: ['m8', 'm15'] }, // Converge
  { id: 'm29', projectId: 'p1', title: 'Début Phase 2: Marketplace', date: addDays(240), status: 'pending', dependencies: ['m22'] },

  // Other Projects
  { id: 'm2', projectId: 'p2', title: 'Tests unitaires Core', date: addDays(7), status: 'pending', dependencies: ['m01'] },
  { id: 'm3', projectId: 'p4', title: 'Déploiement MVP en Prod', date: addDays(10), status: 'at_risk' },
  { id: 'm4', projectId: 'p5', title: 'Mise en Production Finale', date: addDays(12), status: 'pending', dependencies: ['m02'] },
  { id: 'm5', projectId: 'p6', title: 'Choix de la solution Kong', date: addDays(15), status: 'completed' },
  
  { id: 'm7', projectId: 'p7', title: 'Audit Juridique Initial', date: addDays(25), status: 'delayed' },
  
  { id: 'm9', projectId: 'p3', title: 'Audit Sécurité Infrastructure', date: addDays(40), status: 'pending' },
  { id: 'm10', projectId: 'p2', title: 'Feature: Mode Offline', date: addDays(45), status: 'at_risk', dependencies: ['m2'] },
  { id: 'm11', projectId: 'p6', title: 'POC Gateway', date: addDays(50), status: 'pending', dependencies: ['m5'] },
  { id: 'm12', projectId: 'p8', title: 'Design System Backend', date: addDays(55), status: 'pending' },
  { id: 'm13', projectId: 'p4', title: 'Retours Client MVP', date: addDays(58), status: 'pending', dependencies: ['m3'] },

  { id: 'm14', projectId: 'p2', title: 'Formation Utilisateurs Pilotes', date: addDays(65), status: 'pending', dependencies: ['m10'] },
  
  { id: 'm16', projectId: 'p3', title: 'Déploiement Environnement Staging', date: addDays(75), status: 'pending', dependencies: ['m9'] },
  { id: 'm17', projectId: 'p7', title: 'Mise à jour bandeau cookies', date: addDays(80), status: 'pending', dependencies: ['m7'] },
  { id: 'm18', projectId: 'p6', title: 'Migration API Authentification', date: addDays(85), status: 'at_risk', dependencies: ['m11'] },

  { id: 'm19', projectId: 'p3', title: 'Migration Base de Données', date: addDays(100), status: 'pending', dependencies: ['m16'] },
  { id: 'm20', projectId: 'p4', title: 'V2: Analyse Sentiment', date: addDays(110), status: 'delayed', dependencies: ['m13'] },
  { id: 'm21', projectId: 'p8', title: 'Extraction Service Commande', date: addDays(120), status: 'pending', dependencies: ['m12'] },
  
  { id: 'm23', projectId: 'p2', title: 'Déploiement National iOS/Android', date: addDays(140), status: 'pending', dependencies: ['m14'] },
  { id: 'm24', projectId: 'p6', title: 'Décommissionnement Legacy Gateway', date: addDays(150), status: 'pending', dependencies: ['m18'] },
  { id: 'm25', projectId: 'p7', title: 'Audit de conformité Final', date: addDays(160), status: 'pending', dependencies: ['m17'] },
  { id: 'm26', projectId: 'p3', title: 'Tests de bascule DRP', date: addDays(170), status: 'pending', dependencies: ['m19'] },
  
  { id: 'm27', projectId: 'p3', title: 'Arrêt Data Center Physique', date: addDays(190), status: 'pending', dependencies: ['m26'] },
  { id: 'm28', projectId: 'p8', title: 'Extraction Service Facturation', date: addDays(210), status: 'pending', dependencies: ['m21'] },
];