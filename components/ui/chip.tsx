import { Cross2Icon } from '@radix-ui/react-icons';
import React from 'react';

export const Chip = ({ name, onDelete }: { name: string; onDelete?: () => void }) => {
  return (
    <div
      className={
        'flex flex-row gap-1 items-center justify-center px-2 h-[25px] border border-accent-border bg-accent-bg rounded-full'
      }
    >
      <div>{name}</div>
      {onDelete && (
        <Cross2Icon
          className={'cursor-pointer hover:bg-accent-bg-hover rounded-full hover:border border-accent-line'}
          onClick={onDelete}
        />
      )}
    </div>
  );
};
