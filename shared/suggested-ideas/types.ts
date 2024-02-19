export interface Idea {
  title: string;
  description: string;
  user: { id: string; email: string };
  createdAt: Date;
}
