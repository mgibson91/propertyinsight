'use client';

import React, { useState } from 'react';
import { Id, Task } from './types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil1Icon, ThickArrowUpIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button, Card, IconButton } from '@radix-ui/themes';
import cx from 'classnames';
import Image from 'next/image';

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  addVote: (id: Id) => void;

  editMode?: boolean;
  setEditMode?: (value: boolean) => void;
}

function TaskCard({ task, deleteTask, updateTask, addVote, editMode, setEditMode }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  // const [editMode, setEditMode] = useState(false);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const disableEditMode = () => {
    setEditMode && setEditMode(false);
    setMouseIsOver(false);
  };

  if (isDragging) {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        className="
        opacity-30
      p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 !border-[var(--crimson-9)] cursor-grab relative
      "
      ></Card>
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="p-2.5 h-[100px] min-h-[100px] items-center flex hover:ring-2 hover:ring-inset hover:ring-[var(--amber-9)] !border-none !rounded-xl cursor-grab relative"
      >
        <textarea
          className="
          h-[90%]
          w-full resize-none border-none rounded bg-transparent text-white focus:outline-none
          "
          value={task.content}
          autoFocus
          placeholder="Task content here"
          onBlur={disableEditMode}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              disableEditMode();
            }
          }}
          onChange={e => updateTask(task.id, e.target.value)}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // onClick={disableEditMode}
      className="!bg-accent-bg p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-accent-border cursor-grab border !border-accent-border relative task"
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap mr-[40px]">
        {task.content}
      </p>

      <div className={'absolute right-2 top-2 flex flex-row gap-2 items-center'}>
        <div className={'flex flex-col items-center'}>
          <IconButton
            variant={'surface'}
            className={'!rounded-full'}
            onClick={() => {
              addVote(task.id);
            }}
          >
            <img src={'/clap.svg'} className={'h-5 w-5 fill-white active:scale-110 duration-75 transition-all'} />
            {/*<ThickArrowUpIcon />*/}
          </IconButton>
          {Boolean(task.totalVotes) ? (
            <p className={cx('text-[var(--jade-9)]')}>+{task.totalVotes}</p>
          ) : (
            <p className={'invisible'}>1</p>
          )}
        </div>
      </div>

      {mouseIsOver && (
        <>
          <div className={'absolute left-2 bottom-2 flex flex-row gap-2 items-center'}>
            <IconButton
              variant={'solid'}
              size={'1'}
              className={'!rounded-full'}
              onClick={() => {
                // deleteTask(task.id);
                // disableEditMode();
                setEditMode && setEditMode(true);
              }}
            >
              <Pencil1Icon />
            </IconButton>

            <IconButton
              variant={'solid'}
              size={'1'}
              className={'!rounded-full'}
              onClick={() => {
                deleteTask(task.id);
              }}
            >
              <TrashIcon />
            </IconButton>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskCard;
