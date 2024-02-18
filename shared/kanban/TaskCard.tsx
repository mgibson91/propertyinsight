'use client';

import React, { useState } from 'react';
import { BoardPermissions, Id, Task } from './types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListBulletIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { Card, IconButton } from '@radix-ui/themes';
import cx from 'classnames';

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  addVote: (id: Id) => void;
  viewItemDetails?: (id: Id) => void;

  editMode?: boolean;
  setEditMode?: (value: boolean) => void;

  permissions: BoardPermissions;
}

function TaskCard({
  task,
  deleteTask,
  updateTask,
  addVote,
  editMode,
  setEditMode,
  viewItemDetails,
  permissions,
}: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  // const [editMode, setEditMode] = useState(false);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
    disabled: !permissions?.canMoveTask || editMode,
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
        className={`
        opacity-30
      p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 !border-[var(--crimson-9)] relative cursor-grab
      `}
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
        className="p-2.5 h-[100px] min-h-[100px] items-center flex hover:ring-2 hover:ring-inset hover:ring-accent-border border border-accent-border !rounded-xl cursor-grab relative"
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
      className={`!bg-accent-bg p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-accent-border border !border-accent-border relative task
      ${permissions?.canMoveTask ? 'cursor-grab' : 'cursor-default'}
      ${permissions?.canEditTask || permissions?.canDeleteTask || permissions?.canViewVoteSummary ? 'hover:ring-2 hover:ring-inset' : ''}
      `}
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
            className={'!rounded-full active:scale-[1.15] duration-75 transition-all hover:scale-105'}
            onClick={() => {
              addVote(task.id);
            }}
          >
            <img src={'/clap.svg'} className={'h-5 w-5'} />
            {/*<ThickArrowUpIcon />*/}
          </IconButton>
          {Boolean(task.totalVotes) ? (
            <p className={cx('text-[var(--jade-9)]')}>+{task.totalVotes}</p>
          ) : (
            <p className={'invisible'}>1</p>
          )}

          {/*<IconButton variant={'ghost'} className={''}>*/}
          {/*  <DotsHorizontalIcon />*/}
          {/*</IconButton>*/}
        </div>
      </div>

      {mouseIsOver && (
        <>
          <div className={'absolute left-2 bottom-2 flex flex-row gap-2 items-center'}>
            {permissions?.canEditTask && (
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
            )}

            {permissions?.canDeleteTask && (
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
            )}

            {permissions?.canViewVoteSummary && (
              <IconButton
                variant={'solid'}
                size={'1'}
                className={'!rounded-full'}
                onClick={() => {
                  viewItemDetails && viewItemDetails(task.id);
                }}
              >
                <ListBulletIcon />
              </IconButton>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default TaskCard;
