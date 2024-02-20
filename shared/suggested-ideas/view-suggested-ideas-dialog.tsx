import { Card, Dialog, Heading, IconButton } from '@radix-ui/themes';
import { Idea } from '@/shared/suggested-ideas/types';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import * as React from 'react';
import { useState } from 'react';

export function ViewSuggestedIdeasDialog({ children, ideas }: { children: React.ReactNode; ideas: Idea[] | null }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger onClick={() => setOpen(true)}>{children}</Dialog.Trigger>
      <Dialog.Content className={''}>
        <div className={'flex flex-col gap-2'}>
          <div className={'flex flex-row justify-between items-center gap-2'}>
            <Heading size={'5'} className={'!mb-2'}>
              Suggested Ideas
            </Heading>

            <IconButton
              variant={'ghost'}
              className={'!rounded-full'}
              size={'1'}
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon></CloseIcon>
            </IconButton>
          </div>

          <div className={'flex flex-col gap-2'}>
            {ideas ? (
              ideas.map(idea => (
                <Card key={idea.title} className={'flex flex-col gap-2 !bg-primary-bg'}>
                  <div className={'flex flex-row gap-2 justify-between items-start'}>
                    <Heading size={'4'}>{idea.title}</Heading>
                    <div className={'flex flex-col items-end'}>
                      <p className={'italic text-sm'}>
                        Submitted by <b>{idea.user.email}</b>
                      </p>
                      <p className={'text-xs'}>{new Date(idea.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <p>{idea.description}</p>
                </Card>
              ))
            ) : (
              <p>Loading ideas...</p>
            )}
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
