/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Settings2, 
  Moon, 
  Sun, 
  Search, 
  Filter,
  MoreHorizontal,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  X
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';

import { cn, Task, Column, Priority } from './types';
import { SortableTaskCard } from './components/SortableTaskCard';
import { SortableColumn } from './components/SortableColumn';
import { TaskModal } from './components/TaskModal';

const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: '할 일', order: 0 },
  { id: 'inprogress', title: '진행 중', order: 1 },
  { id: 'done', title: '완료', order: 2 },
];

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    columnId: 'todo',
    title: '디자인 시스템 가이드라인 작성',
    description: '브랜드 아이덴티티를 반영한 새로운 디자인 시스템의 핵심 원칙을 문서화합니다.',
    priority: 'high',
    dueDate: new Date().toISOString(),
    createdAt: Date.now(),
  },
  {
    id: '2',
    columnId: 'inprogress',
    title: 'API 엔드포인트 보안 강화',
    description: 'OAuth2 및 JWT 기반의 인증 로직을 최신 보안 표준에 맞춰 업데이트합니다.',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: Date.now(),
  },
  {
    id: '3',
    columnId: 'done',
    title: '랜딩 페이지 성능 최적화',
    description: '이미지 지연 로딩 및 코드 스플리팅을 적용하여 LCP 점수를 개선했습니다.',
    priority: 'medium',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: Date.now(),
  },
];

export default function App() {
  // State
  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem('pro-kanban-columns');
    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('pro-kanban-tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('pro-kanban-dark');
    return saved === 'true';
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'task' | 'column' | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistence
  useEffect(() => {
    localStorage.setItem('pro-kanban-columns', JSON.stringify(columns));
    localStorage.setItem('pro-kanban-tasks', JSON.stringify(tasks));
    localStorage.setItem('pro-kanban-dark', String(isDarkMode));
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [columns, tasks, isDarkMode]);

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveType(active.data.current?.type);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'task';
    const isOverATask = over.data.current?.type === 'task';

    if (!isActiveATask) return;

    // Dropping a task over another task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Dropping a task over a column
    const isOverAColumn = over.data.current?.type === 'column';
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        tasks[activeIndex].columnId = overId;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === 'column';
    if (!isActiveAColumn) return;

    setColumns((columns) => {
      const activeIndex = columns.findIndex((c) => c.id === activeId);
      const overIndex = columns.findIndex((c) => c.id === overId);
      return arrayMove(columns, activeIndex, overIndex);
    });
  };

  const createColumn = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setColumns([...columns, { id, title: `새 컬럼`, order: columns.length }]);
  };

  const updateColumnTitle = (id: string, title: string) => {
    setColumns(columns.map(c => c.id === id ? { ...c, title } : c));
  };

  const deleteColumn = (id: string) => {
    setColumns(columns.filter(c => c.id !== id));
    setTasks(tasks.filter(t => t.columnId !== id));
  };

  const createTask = (columnId: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      columnId,
      title: '새 업무',
      description: '',
      priority: 'medium',
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setSelectedTask(newTask);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    setSelectedTask(null);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D1117] transition-colors duration-300 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Header */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-white rounded-sm" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">Pro Kanban</span>
          </div>
          
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-md px-3 py-1.5 w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="업무 검색..." 
              className="bg-transparent border-none outline-none text-xs w-full text-slate-600 dark:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white dark:border-slate-800 shadow-sm" />
        </div>
      </header>

      {/* Board Area */}
      <main className="p-6 h-[calc(100vh-3.5rem)] overflow-x-auto overflow-y-hidden custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full items-start">
            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {columns.map((column) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  tasks={filteredTasks.filter(t => t.columnId === column.id)}
                  onAddTask={() => createTask(column.id)}
                  onUpdateTitle={(title) => updateColumnTitle(column.id, title)}
                  onDelete={() => deleteColumn(column.id)}
                  onTaskClick={setSelectedTask}
                />
              ))}
            </SortableContext>

            {/* Add Column Button */}
            <button
              onClick={createColumn}
              className="flex-shrink-0 w-72 h-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-500 transition-all group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">컬럼 추가</span>
            </button>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId && activeType === 'task' && (
              <div className="w-72 bg-white dark:bg-[#161B22] p-4 rounded-xl border border-blue-500 shadow-2xl rotate-3 opacity-90 cursor-grabbing">
                {(() => {
                  const task = tasks.find(t => t.id === activeId);
                  if (!task) return null;
                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">{task.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(task.createdAt, 'MMM d')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            {activeId && activeType === 'column' && (
              <div className="w-72 bg-white dark:bg-[#161B22] rounded-xl border border-blue-500 shadow-2xl opacity-90 h-[500px]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">
                    {columns.find(c => c.id === activeId)?.title}
                  </h3>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={updateTask}
            onDelete={() => deleteTask(selectedTask.id)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #30363d;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const config = {
    low: { bg: 'bg-slate-100 text-slate-600', label: '낮음' },
    medium: { bg: 'bg-blue-50 text-blue-600', label: '보통' },
    high: { bg: 'bg-orange-50 text-orange-600', label: '높음' },
    urgent: { bg: 'bg-red-50 text-red-600', label: '긴급' },
  };

  return (
    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", config[priority].bg)}>
      {config[priority].label}
    </span>
  );
}
