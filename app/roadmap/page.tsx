import { KanbanBoard } from '@/app/roadmap/KanbanBoard';
import { getHydratedBoard } from '@/repository/roadmap/get-hydrated-board';

export default async function Page() {
  const roadmap = await getHydratedBoard(process.env.NODE_ENV === 'production' ? 'roadmap' : 'roadmap-dev');

  return <div className={'w-full h-full'}>{roadmap && <KanbanBoard board={roadmap} />}</div>;
}
