'use client';

import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { Column, Id, Task } from './types';
import { CSS } from '@dnd-kit/utilities';
import React, { useMemo, useState } from 'react';
import TaskCard from './TaskCard';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button, Card, IconButton, TextFieldInput } from '@radix-ui/themes';

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;

  createTask: (columnId: Id) => void;
  updateTask: (id: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  addVote: (id: Id) => void;
  tasks: Task[];
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
}: Props) {
  const [editMode, setEditMode] = useState(false);

  const tasksIds = useMemo(() => {
    return tasks.map(task => task.id);
  }, [tasks]);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
    disabled: editMode,
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
          setEditMode(true);
        }}
        className="
      bg-accent-bg
      text-md
      h-[60px]
      cursor-grab
      rounded-md
      rounded-b-none
      p-3
      font-bold
      border-primary-bg-subtle
      border-4
      flex
      items-center
      justify-between
      "
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
            <TextFieldInput
              value={column.title}
              onChange={e => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={e => {
                if (e.key !== 'Enter') return;
                setEditMode(false);
              }}
            />
          )}
        </div>
        <IconButton
          variant={'soft'}
          onClick={() => {
            deleteColumn(column.id);
          }}
        >
          <TrashIcon />
        </IconButton>
      </div>

      {/* Column task container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} addVote={addVote} />
          ))}
        </SortableContext>
      </div>
      {/* Column footer */}
      <Button
        variant={'ghost'}
        className={'!p-3 !m-3'}
        onClick={() => {
          createTask(column.id);
        }}
      >
        <PlusIcon />
        Add task
      </Button>
    </div>
  );
}

export default ColumnContainer;
