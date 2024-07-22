'use client';

import { Button, Dialog, Heading, IconButton, TextArea, TextField } from '@radix-ui/themes';
import { useState } from 'react';
import { AsyncButton } from '@/shared/async-button';
import * as React from 'react';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';

export function SuggestFeatureDialog({
  children,
  submitFeature,
}: {
  children: React.ReactNode;
  submitFeature: (input: { title: string; description: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger onClick={() => setOpen(true)}>{children}</Dialog.Trigger>
      <Dialog.Content className={'!w-[400px]'}>
        <div className={'flex flex-col gap-2'}>
          <div className={'flex flex-row justify-between items-center gap-2'}>
            <Heading size={'5'} className={'!mb-2'}>
              Submit Idea
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

          <div className={'flex flex-col'}>
            <Heading size={'4'}>Title</Heading>
            <TextField.Root
              value={title}
              placeholder={'Feature title'}
              onChange={e => setTitle(e.target.value)}
            ></TextField.Root>
          </div>

          <div className={'flex flex-col'}>
            <Heading size={'4'}>Description</Heading>
            <TextArea
              value={description}
              placeholder={'Feature description'}
              onChange={e => setDescription(e.target.value)}
            ></TextArea>
          </div>

          <AsyncButton
            className={'!mt-3'}
            size="3"
            onClick={async () => {
              await submitFeature({ title, description });
              setOpen(false);
            }}
          >
            Submit
          </AsyncButton>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
