export type Id = string;

export type Column = {
  id: Id;
  title: string;
};

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
  sessionVotes?: boolean;
  totalVotes?: number;
};

export interface BoardPermissions {
  canVote: boolean;
  canMoveTask: boolean;
  canMoveColumn: boolean;
  canEditTask: boolean;
  canEditColumn: boolean;
  canDeleteTask: boolean;
  canDeleteColumn: boolean;
  canCreateTask: boolean;
  canCreateColumn: boolean;
  canViewVoteSummary: boolean;
}
