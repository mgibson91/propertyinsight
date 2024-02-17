'use client';

import { useMemo, useState } from 'react';
import { Column, Id, Task } from './types';
import { ColumnContainer } from './ColumnContainer';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { PlusIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import { recordBoardItemVote } from '@/repository/roadmap/record-board-item-vote';
import { uuid } from '@supabase/gotrue-js/src/lib/helpers';
import { Board } from '@/repository/roadmap/types';
import { updateBoardItemTitle } from '@/repository/roadmap/update-board-item';
import { updateColumnPosition } from '@/repository/roadmap/update-column-position';
import { updateItemColumnAndPosition } from '@/repository/roadmap/move-item';

const defaultCols: Column[] = [
  {
    id: 'todo',
    title: 'Suggested',
  },
  {
    id: 'doing',
    title: 'Planned',
  },
  {
    id: 'done',
    title: 'Done',
  },
];

const defaultTasks: Task[] = [
  {
    id: uuid(),
    columnId: 'todo',
    content: 'Add new datasets',
  },
  {
    id: uuid(),
    columnId: 'todo',
    content: 'Add live data streams',
  },
  {
    id: uuid(),
    columnId: 'doing',
    content: 'Add ability to save backtests',
  },
];

const voteTimers = new Map();

export function KanbanBoard({ board }: { board: Board }) {
  // const [columns, setColumns] = useState<Column[]>(defaultCols);
  const [columns, setColumns] = useState<Column[]>(board.columns);
  const columnsId = useMemo(() => columns.map(col => col.id), [columns]);

  const defaultTaskList: Task[] = [];
  for (const column of board.columns) {
    for (const item of column.items.sort((a, b) => a.position - b.position)) {
      defaultTaskList.push({
        id: item.id,
        columnId: column.id,
        content: item.title,
        totalVotes: item.totalVotes,
      });
    }
  }

  const [tasks, setTasks] = useState<Task[]>(defaultTaskList);
  const [lastSyncedTasks, setLastSyncedTasks] = useState<Task[]>(defaultTaskList);

  const [userVotes, setUserVotes] = useState<number>(0);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  return (
    <div
      className="
        m-auto
        flex
        min-h-screen
        w-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        px-[40px]
    "
    >
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map(col => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  addVote={addVote}
                  tasks={tasks.filter(task => task.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>
          <Button
            variant={'soft'}
            onClick={() => {
              createNewColumn();
            }}
            className="
      w-[350px]
      !h-[58px]
      min-w-[350px]
      cursor-pointer
      rounded-lg
      bg-mainBackgroundColor
      border-2
      border-columnBackgroundColor
      !py-4

      ring-[var(--crimson-9)]
      hover:ring-2
      flex
      gap-2
      items-center
      "
          >
            <PlusIcon />
            Add Column
          </Button>
        </div>
        {/*{createPortal( - https://github.com/Kliton/react-kanban-board-dnd-kit-tutorial-yt/blob/main/src/components/KanbanBoard.tsx*/}
        <DragOverlay>
          {activeColumn && (
            <ColumnContainer
              column={activeColumn}
              deleteColumn={deleteColumn}
              updateColumn={updateColumn}
              createTask={createTask}
              deleteTask={deleteTask}
              updateTask={updateTask}
              addVote={addVote}
              tasks={tasks.filter(task => task.columnId === activeColumn.id)}
            />
          )}
          {activeTask && (
            <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} addVote={addVote} />
          )}
        </DragOverlay>
        ,
      </DndContext>
    </div>
  );

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: uuid(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  }

  function deleteTask(id: Id) {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
  }

  async function updateTask(id: Id, content: string) {
    const newTasks = tasks.map(task => {
      if (task.id !== id) return task;

      return { ...task, content };
    });

    setTasks(newTasks);

    await updateBoardItemTitle({
      itemId: id,
      title: content,
    });
  }

  function addVote(id: Id) {
    const newTasks = tasks.map(task => {
      if (task.id !== id) return task;

      // Increment the totalVotes or initialize it if it doesn't exist
      task.totalVotes = (task.totalVotes || 0) + 1;

      const newUserVoteCount = userVotes + 1;
      setUserVotes(newUserVoteCount);

      // Check if a timer already exists for this task
      if (voteTimers.has(id)) {
        clearTimeout(voteTimers.get(id)); // Clear the existing timer
      }

      // Set a new timer
      const timer = setTimeout(async () => {
        // Here you would record the vote count, e.g., by sending it to a server
        console.log(`Record vote count for task ${id}: ${newUserVoteCount}`);
        await recordBoardItemVote({
          itemId: id,
          // itemId: 'ebd285da-94d5-40bd-840a-26356d70c0f5',
          count: newUserVoteCount,
        });

        setUserVotes(0);

        voteTimers.delete(id); // Remove the timer from the map once executed
      }, 500); // Set for 500ms

      // Store the timer in the map
      voteTimers.set(id, timer);

      return { ...task };
    });

    setTasks(newTasks);
  }

  // function addVote(id: Id) {
  //   const newTasks = tasks.map(task => {
  //     if (task.id !== id) return task;
  //
  //     task.totalVotes = (task.totalVotes || 0) + 1;
  //
  //     // TODO: Start timer for 500ms which reset with every click. Then record user vote count
  //     return { ...task };
  //   });
  //
  //   setTasks(newTasks);
  // }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: uuid(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  }

  function deleteColumn(id: Id) {
    const filteredColumns = columns.filter(col => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter(t => t.columnId !== id);
    setTasks(newTasks);
  }

  function updateColumn(id: Id, title: string) {
    const newColumns = columns.map(col => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  }

  function onDragStart(event: DragStartEvent) {
    console.log('####### onDragStart', event.active.data.current);
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  async function updateAdjacentItemsAfterItemDrag(input: {
    itemId: string;
    previousColumnId: string;
    newColumnId: string;
  }) {
    const { itemId, previousColumnId, newColumnId } = input;

    // 1. Get previous position for this task
    const previousColumnItems = lastSyncedTasks.filter(i => i.columnId === previousColumnId);
    const previousPosition = previousColumnItems.findIndex(i => i.id === itemId);

    // 2. Get new position for this task
    const newColumnItems = lastSyncedTasks.filter(i => i.columnId === newColumnId);
    const newPosition = newColumnItems.length;

    await updateItemColumnAndPosition({
      itemId,
      previousPosition,
      previousColumnId,
      newColumnId,
      newPosition,
    });
    /**
     * Input
     * - itemId
     * - previousColumn & previousPosition
     * - newColumn & newPosition
     *
     * Decrease position for all tasks in the same column that have a position greater than the previous position
     * Increase position for all tasks in new col that have pos greater or equal to current pos
     */
  }

  async function onDragEnd(event: DragEndEvent) {
    const cachedActiveTask = activeTask;

    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const isActiveAColumn = active.data.current?.type === 'Column';
    const isTask = active.data.current?.type === 'Task';

    if (isTask) {
      if (!cachedActiveTask) {
        console.error('No cached active task');
        return;
      }

      const item: Task = active.data.current?.task;
      console.log(`Active column: `, item);

      await updateAdjacentItemsAfterItemDrag({
        itemId: item.id,
        previousColumnId: cachedActiveTask?.columnId,
        newColumnId: item.columnId,
      });
    }

    console.log('####### onDragEnd', { event, activeId, overId, isActiveAColumn });

    if (activeId === overId) return;

    if (!isActiveAColumn) return;

    const currentPosition = columns.findIndex(col => col.id === activeId);
    const newPosition = columns.findIndex(col => col.id === overId);

    console.log('####### onDragEnd', { currentPosition, newPosition, activeId });
    setColumns(columns => {
      return arrayMove(columns, currentPosition, newPosition);
    });

    await updateColumnPosition({
      boardId: board.id,
      columnId: activeId,
      newPosition,
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);

        if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
          // Fix introduced after video recording
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === 'Column';

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);

        tasks[activeIndex].columnId = overId;
        console.log('DROPPING TASK OVER COLUMN', { activeIndex });
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}
