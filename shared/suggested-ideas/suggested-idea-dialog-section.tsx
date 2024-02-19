import { Button } from '@radix-ui/themes';
import { ChatBubbleIcon } from '@radix-ui/react-icons';
import { SuggestFeatureDialog } from '@/shared/suggested-ideas/suggest-feature-dialog';
import { submitIdea as submitIdeaRepo } from '@/repository/roadmap/submit-idea';
import { useState } from 'react';
import { Idea } from '@/shared/suggested-ideas/types';
import { ViewSuggestedIdeasDialog } from '@/shared/suggested-ideas/view-suggested-ideas-dialog';
import { getSuggestedIdeas } from '@/repository/roadmap/get-suggested-ideas';

export function SuggestedIdeaDialogSection({ boardId }: { boardId: string }) {
  const [suggestedIdeas, setSuggestedIdeas] = useState<Idea[] | null>(null);

  return (
    <div className={'flex flex-row gap-2 items-center'}>
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
      <SuggestFeatureDialog submitFeature={async input => await submitIdeaRepo({ ...input, boardId })}>
        <Button variant={'soft'} size={'4'} className={'!mt-3 !border-2 !border-solid !border-accent-border'}>
          Suggest Feature
          <ChatBubbleIcon />
        </Button>
      </SuggestFeatureDialog>
    </div>
  );
}
