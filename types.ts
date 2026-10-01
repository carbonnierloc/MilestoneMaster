export type MilestoneStatus = 'pending' | 'completed' | 'delayed' | 'at_risk';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  date: string; // ISO string YYYY-MM-DD
  status: MilestoneStatus;
  description?: string;
  dependencies?: string[]; // Array of Milestone IDs that must be completed before this one
}

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  progress: number;
}

export type TimeHorizon = '1_month' | '2_months' | '3_months' | '6_months' | 'later' | 'overdue';

export interface MilestoneWithProject extends Milestone {
  projectName: string;
  projectOwner: string;
}