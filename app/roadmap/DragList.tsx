'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DragDropContext, Draggable, DropResult } from '@hello-pangea/dnd';
import './styles.css';
import { ItemType } from '@/app/roadmap/types';
import { Column } from '@/app/roadmap/Column';
import { Heading, IconButton } from '@radix-ui/themes';
import { ThickArrowUpIcon } from '@radix-ui/react-icons';
import cx from 'classnames';

interface ListMap {
  [key: string]: ItemType[];
}

const Board: ListMap = {
  Suggested: [
    {
      id: 'Suggested-item-00',
      prefix: 'Suggested',
      content: 'item 0',
      userUpvoted: true,
      totalVotes: 10,
    },
    {
      id: 'Suggested-item-1',
      prefix: 'Suggested',
      content: 'item 1',
      userUpvoted: true,
      totalVotes: 1,
    },
    {
      id: 'Suggested-item-2',
      prefix: 'Suggested',
      content: 'item 2',
      totalVotes: 10,
    },
  ],
  Planned: [
    {
      id: 'Planned-item-0',
      prefix: 'Planned',
      content: 'item 0',
    },
    {
      id: 'Planned-item-1',
      prefix: 'Planned',
      content: 'item 1',
    },
  ],
  Done: [
    {
      id: 'Done-item-0',
      prefix: 'Done',
      content: 'item 0',
    },
  ],
};

const TestBoard: ListMap = {
  Suggested: [
    {
      id: 'Suggested-item-0',
      prefix: 'Suggested',
      content: 'item 0',
    },
    {
      id: 'Suggested-item-1',
      prefix: 'Suggested',
      content: 'item 1',
    },
    {
      id: 'Suggested-item-2',
      prefix: 'Suggested',
      content: 'item 2',
    },
    // {
    //   id: 'Suggested-item-3',
    //   prefix: 'Suggested',
    //   content: 'item 3',
    // },
    // {
    //   id: 'Suggested-item-4',
    //   prefix: 'Suggested',
    //   content: 'item 4',
    // },
    // {
    //   id: 'Suggested-item-5',
    //   prefix: 'Suggested',
    //   content: 'item 5',
    // },
    // {
    //   id: 'Suggested-item-6',
    //   prefix: 'Suggested',
    //   content: 'item 6',
    // },
    // {
    //   id: 'Suggested-item-7',
    //   prefix: 'Suggested',
    //   content: 'item 7',
    // },
    // {
    //   id: 'Suggested-item-8',
    //   prefix: 'Suggested',
    //   content: 'item 8',
    // },
    // {
    //   id: 'Suggested-item-9',
    //   prefix: 'Suggested',
    //   content: 'item 9',
    // },
  ],
  Planned: [
    {
      id: 'Planned-item-0',
      prefix: 'Planned',
      content: 'item 0',
    },
    {
      id: 'Planned-item-1',
      prefix: 'Planned',
      content: 'item 1',
    },
    // {
    //   id: 'Planned-item-2',
    //   prefix: 'Planned',
    //   content: 'item 2',
    // },
    // {
    //   id: 'Planned-item-3',
    //   prefix: 'Planned',
    //   content: 'item 3',
    // },
    // {
    //   id: 'Planned-item-4',
    //   prefix: 'Planned',
    //   content: 'item 4',
    // },
    // {
    //   id: 'Planned-item-5',
    //   prefix: 'Planned',
    //   content: 'item 5',
    // },
    // {
    //   id: 'Planned-item-6',
    //   prefix: 'Planned',
    //   content: 'item 6',
    // },
    // {
    //   id: 'Planned-item-7',
    //   prefix: 'Planned',
    //   content: 'item 7',
    // },
    // {
    //   id: 'Planned-item-8',
    //   prefix: 'Planned',
    //   content: 'item 8',
    // },
    // {
    //   id: 'Planned-item-9',
    //   prefix: 'Planned',
    //   content: 'item 9',
    // },
  ],
  Done: [
    {
      id: 'Done-item-0',
      prefix: 'Done',
      content: 'item 0',
    },
    {
      id: 'Done-item-1',
      prefix: 'Done',
      content: 'item 1',
    },
    {
      id: 'Done-item-2',
      prefix: 'Done',
      content: 'item 2',
    },
    // {
    //   id: 'Done-item-3',
    //   prefix: 'Done',
    //   content: 'item 3',
    // },
    // {
    //   id: 'Done-item-4',
    //   prefix: 'Done',
    //   content: 'item 4',
    // },
    // {
    //   id: 'Done-item-5',
    //   prefix: 'Done',
    //   content: 'item 5',
    // },
    // {
    //   id: 'Done-item-6',
    //   prefix: 'Done',
    //   content: 'item 6',
    // },
    // {
    //   id: 'Done-item-7',
    //   prefix: 'Done',
    //   content: 'item 7',
    // },
    // {
    //   id: 'Done-item-8',
    //   prefix: 'Done',
    //   content: 'item 8',
    // },
    // {
    //   id: 'Done-item-9',
    //   prefix: 'Done',
    //   content: 'item 9',
    // },
  ],
};

export const DragList = () => {
  const lists = useMemo(() => ['Suggested', 'Planned', 'Done'], []);

  // const [elements, setElements] = useState<ListMap>(Board);
  const [elements, setElements] = useState<ListMap>(TestBoard);

  // const lists = useMemo(() => ['Suggested', 'Planned', 'Done'], []);
  // const getItems = (count: number, prefix: string) =>
  //   Array.from({ length: count }).map((k, i) => {
  //     // const randomId = Math.floor(Math.random() * 1000);
  //     const randomId = i;
  //     return {
  //       // id: `item-${Date.now() + randomId}`,
  //       id: `${prefix}-item-${randomId}`,
  //       prefix,
  //       content: `item ${randomId}`,
  //       // content: `item ${Date.now() + randomId}`,
  //     };
  //   });
  // const generateLists = useCallback(
  //   () => lists.reduce((acc, listKey) => ({ ...acc, [listKey]: getItems(10, listKey) }), {}),
  //   [lists]
  // );
  //
  // const [elements, setElements] = useState<ListMap>(generateLists());

  const removeFromList = (list: ItemType[], index: number): [ItemType, ItemType[]] => {
    const result = Array.from(list);
    const [removed] = result.splice(index, 1);
    return [removed, result];
  };

  const addToList = useCallback((list: ItemType[], index: number, element: ItemType): ItemType[] => {
    const result = Array.from(list);
    result.splice(index, 0, element);
    return result;
  }, []);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) {
        return;
      }

      const listCopy: typeof elements = { ...elements };
      const sourceList = listCopy?.[result.source.droppableId];

      const [removedElement, newSourceList] = removeFromList(sourceList, result.source.index);

      listCopy[result.source.droppableId] = newSourceList;
      const destinationList = listCopy[result.destination.droppableId];
      listCopy[result.destination.droppableId] = addToList(destinationList, result.destination.index, removedElement);
      setElements(listCopy);
      console.log('DD', result, sourceList, listCopy);
    },
    [elements, addToList]
  );

  return (
    <div className="p-5">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="list-grid">
          {lists.map(listKey => (
            <Column
              title={listKey}
              elements={elements[listKey]}
              key={listKey}
              prefix={listKey}
              onItemClicked={(item: ItemType) => {
                console.log('Item clicked', item);

                // Update elements - Increment upvotes for this item and mark as userUpvoted
                const found = elements[listKey].find(i => i.id === item.id);
                if (found) {
                  found.totalVotes = (found.totalVotes || 0) + 1;

                  // Start timer for 500ms which reset with every click. Then record user vote count
                  setElements({ ...elements });
                }
              }}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

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
                  className={'!rounded'}
                  variant={'classic'}
                  onClick={() => {
                    onItemClicked(item);
                  }}
                >
                  <ThickArrowUpIcon />
                </IconButton>
                {Boolean(item.totalVotes) ? (
                  <p className={cx('text-[var(--jade-9)]')}>+{item.totalVotes}</p>
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
