export interface Team {
  id: string;
  name: string;
}

export interface Engineer {
  id: string;
  name: string;
  teamId: string;
}

export interface Branch {
  id: string;
  name: string;
  type: 'primary' | 'project' | 'release';
  teamId?: string;
  status: 'active' | 'archived';
}

export interface PullRequest {
  id: string;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  authorId: string;
  status: 'code_review' | 'addressing_comments' | 'merge_queue' | 'merging' | 'conflict' | 'testing' | 'merged' | 'failed' | 'removed';
  priority: 'high' | 'normal' | 'low';
  groupId?: string;
  queuePosition?: number;
  logs: string[];
  files: string; // JSON string of files
}

export interface FileData {
  name: string;
  content: string;
}

export interface SystemState {
  isMergePaused: boolean;
}

