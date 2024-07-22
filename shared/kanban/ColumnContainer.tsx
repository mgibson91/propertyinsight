'use client';

import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { BoardPermissions, Column, Id, Task } from './types';
import { CSS } from '@dnd-kit/utilities';
import React, { useMemo, useState } from 'react';
import TaskCard from './TaskCard';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button, Card, IconButton, TextField } from '@radix-ui/themes';

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;

  createTask: (columnId: Id) => Task;
  updateTask: (id: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  viewItemDetails: (id: Id) => void;
  addVote: (id: Id) => void;
  tasks: Task[];

  editMode?: boolean;
  setEditMode?: (value: boolean) => void;

  permissions: BoardPermissions;
}

export function ColumnContainer({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
  addVote,
  viewItemDetails,
  editMode,
  setEditMode,
  permissions,
}: Props) {
  const [editItemId, setEditItemId] = useState<Id | null>(null);

  const tasksIds = useMemo(() => {
    return tasks.map(task => task.id);
  }, [tasks]);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
    // disabled: editMode,
    disabled: !permissions?.canMoveColumn || editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
      bg-primary-bg-subtle
      opacity-40
      border-2
      border-[var(--crimson-9)]
      w-[350px]
      h-[500px]
      max-h-[500px]
      rounded-md
      flex
      flex-col
      "
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
  bg-primary-bg-subtle
  w-[350px]
  h-[500px]
  max-h-[500px]
  rounded-md
  flex
  flex-col
  "
    >
      {/* Column title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          permissions?.canEditColumn && setEditMode && setEditMode(true);
        }}
        className={`
      bg-accent-bg
      text-md
      h-[60px]
      rounded-md
      rounded-b-none
      p-3
      font-bold
      border-primary-bg-subtle
      border-4
      flex
      items-center
      justify-between
      ${permissions?.canMoveColumn ? 'cursor-grab' : 'cursor-default'}
      `}
      >
        <div className="flex gap-2">
          <div
            className="
        flex
        justify-center
        items-center
        bg-primary-bg-subtle
        px-2
        py-1
        text-sm
        rounded-full
        "
          >
            {tasks.length}
          </div>
          {!editMode && column.title}
          {editMode && (
            <TextField.Root
              value={column.title}
              placeholder={'Enter column name'}
              onChange={e => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => {
                setEditMode && setEditMode(false);
              }}
              onKeyDown={e => {
                if (e.key !== 'Enter') return;
                setEditMode && setEditMode(false);
              }}
            />
          )}
        </div>
        {permissions?.canDeleteColumn && (
          <IconButton
            variant={'soft'}
            onClick={() => {
              deleteColumn(column.id);
            }}
          >
            <TrashIcon />
          </IconButton>
        )}
      </div>

      {/* Column task container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map(task => (
            <TaskCard
              permissions={permissions}
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
              addVote={addVote}
              viewItemDetails={viewItemDetails}
              editMode={editItemId === task.id}
              setEditMode={(edit: boolean) => {
                setEditItemId(edit ? task.id : null);
              }}
            />
          ))}
        </SortableContext>
      </div>
      {/* Column footer */}
      {permissions?.canCreateTask && (
        <Button
          variant={'ghost'}
          className={'!p-3 !m-3'}
          onClick={() => {
            const task = createTask(column.id);
            setEditItemId(task.id);
          }}
        >
          <PlusIcon />
          Add task
        </Button>
      )}
    </div>
  );
}

export default ColumnContainer;
