import { getHydratedBoard } from '@/repository/roadmap/get-hydrated-board';
import { KanbanBoard } from '@/shared/kanban/KanbanBoard';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function Page() {
  const roadmap = await getHydratedBoard(process.env.NODE_ENV === 'production' ? 'roadmap' : 'roadmap-dev');

  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const access = user?.user_metadata?.type === 'admin';

  return (
    <div className={'w-full h-full'}>
      {roadmap && (
        <KanbanBoard
          board={roadmap}
          permissions={{
            canCreateTask: access,
            canDeleteTask: access,
            canEditTask: access,
            canMoveTask: access,
            canMoveColumn: access,
            canVote: access,
            canEditColumn: access,
            canDeleteColumn: access,
            canCreateColumn: access,
            canViewVoteSummary: access,
            canViewSuggestedIdeas: access,

            canSuggestIdea: true,
          }}
        />
      )}
    </div>
  );
}
