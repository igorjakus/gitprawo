export type LegislativeStageStatus = 'completed' | 'in-progress' | 'pending';

export interface LegislativeStage {
  name: string;
  status: LegislativeStageStatus;
  date?: string;
  description?: string;
}

export interface ActVersion {
  id: string;
  version: string;
  date: string;
  author: string;
  commitMessage: string;
  changes: number; // number of changes/diffs
  additions?: number;
  deletions?: number;
}

export interface Act {
  id: string;
  title: string;
  shortTitle: string;
  type: 'ustawa' | 'rozporządzenie' | 'konstytucja';
  publishDate: string;
  effectiveDate?: string;
  status: 'active' | 'draft' | 'archived';
  versions: ActVersion[];
  legislativeStages: LegislativeStage[];
  description?: string;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
}

export interface DiffSection {
  title: string;
  lines: DiffLine[];
}

export type PRStatus = 'open' | 'merged' | 'closed' | 'draft';

export interface PullRequest {
  id: number;
  actId: number;
  actTitle?: string;
  title: string;
  description?: string;
  authorId: number;
  authorLogin?: string;
  status: PRStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  mergedAt?: string;
  mergedById?: number;
}

export interface PRChange {
  id: number;
  pullRequestId: number;
  oldContentMd?: string;
  newContentMd: string;
  changeSummary?: string;
  createdAt: string;
}

export interface PRComment {
  id: number;
  pullRequestId: number;
  authorId: number;
  authorLogin?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

