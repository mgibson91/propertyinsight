import { Button } from '@radix-ui/themes';
import { ChatBubbleIcon } from '@radix-ui/react-icons';
import { SuggestFeatureDialog } from '@/shared/suggested-ideas/suggest-feature-dialog';
import { submitIdea as submitIdeaRepo } from '@/repository/roadmap/submit-idea';
import { useState } from 'react';
import { Idea } from '@/shared/suggested-ideas/types';
import { ViewSuggestedIdeasDialog } from '@/shared/suggested-ideas/view-suggested-ideas-dialog';
import { getSuggestedIdeas } from '@/repository/roadmap/get-suggested-ideas';
import { BoardPermissions } from '@/shared/kanban/types';

export function SuggestedIdeaDialogSection({
  boardId,
  permissions,
}: {
  boardId: string;
  permissions: BoardPermissions;
}) {
  const [suggestedIdeas, setSuggestedIdeas] = useState<Idea[] | null>(null);

  return (
    <div className={'flex flex-row gap-5 items-center'}>
      {permissions?.canViewSuggestedIdeas && (
        <ViewSuggestedIdeasDialog ideas={suggestedIdeas}>
          <Button
            variant={'soft'}
            size={'4'}
            className={'!mt-3 !border-2 !border-solid !border-accent-border'}
            onClick={async () => {
              const ideas = await getSuggestedIdeas({ boardId });
              setSuggestedIdeas(ideas);
            }}
          >
            View Suggested Ideas
          </Button>
        </ViewSuggestedIdeasDialog>
      )}

      {permissions?.canSuggestIdea && (
        <SuggestFeatureDialog submitFeature={async input => await submitIdeaRepo({ ...input, boardId })}>
          <Button variant={'soft'} size={'4'} className={'!mt-3 !border-2 !border-solid !border-accent-border'}>
            Suggest Idea
            <ChatBubbleIcon />
          </Button>
        </SuggestFeatureDialog>
      )}
    </div>
  );
}
