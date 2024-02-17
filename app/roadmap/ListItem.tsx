import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { ItemType } from '@/app/roadmap/types';
import { ThickArrowUpIcon } from '@radix-ui/react-icons';
import { Heading, IconButton } from '@radix-ui/themes';
import cx from 'classnames';

export const ListItem = ({
  item,
  index,
  onItemClicked,
}: {
  item: ItemType;
  index: number;
  onItemClicked: (item: ItemType) => void;
}) => {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => {
        return (
          <div
            className="bg-primary-bg border border-primary-border p-3 rounded-md mb-4 shadow-md"
            ref={provided.innerRef}
            snapshot={snapshot}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className={'flex flex-row justify-between items-start'}>
              <Heading size={''}>{item.id}</Heading>
              <div className={'flex flex-col items-center'}>
                <IconButton
                  variant={item.userUpvoted ? 'classic' : 'soft'}
                  onClick={() => {
                    onItemClicked(item);
                  }}
                >
                  <ThickArrowUpIcon />
                </IconButton>
                {Boolean(item.totalVotes) ? (
                  <p className={cx('text-[var(--jade-9)]', item.userUpvoted ? 'font-bold' : '')}>+{item.totalVotes}</p>
                ) : (
                  <p className={'invisible'}>1</p>
                )}
              </div>
            </div>
            <span>Content</span>
          </div>
        );
      }}
    </Draggable>
  );
};
