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
            canCreateTask: false,
            canDeleteTask: false,
            canEditTask: false,
            canMoveTask: false,
            canVote: false,
            canEditColumn: false,
            canDeleteColumn: false,
            canCreateColumn: false,
            canViewVoteSummary: false,
            canMoveColumn: false,
            canViewSuggestedIdeas: false,

            canSuggestIdea: true,
          }}
        />
      )}
    </div>
  );
}
