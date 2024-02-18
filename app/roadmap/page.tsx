import { getHydratedBoard } from '@/repository/roadmap/get-hydrated-board';
import { KanbanBoard } from '@/shared/kanban/KanbanBoard';

export default async function Page() {
  const roadmap = await getHydratedBoard(process.env.NODE_ENV === 'production' ? 'roadmap' : 'roadmap-dev');

  return (
    <div className={'w-full h-full'}>
      {roadmap && (
        <KanbanBoard
          board={roadmap}
          permissions={{
            canCreateTask: true,
            canDeleteTask: true,
            canEditTask: true,
            canMoveTask: true,
            canMoveColumn: true,
            canVote: true,
            canEditColumn: true,
            canDeleteColumn: true,
            canCreateColumn: true,
            canViewVoteSummary: true,
          }}
        />
      )}
    </div>
  );
}
