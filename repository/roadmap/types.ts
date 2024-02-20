// Define types for the hierarchical structure
export type Board = {
  id: string;
  name: string;
  columns: BoardColumn[];
};

export type BoardColumn = {
  id: string;
  title: string;
  position: number;
  items: BoardItem[];
};

export type BoardItem = {
  id: string;
  title: string;
  createdAt: Date;
  totalVotes: number;
  uniqueVoters: number;
  position: number;
};
