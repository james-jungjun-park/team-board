import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { cn, Column, Task } from '../types';
import { SortableTaskCard } from './SortableTaskCard';

interface SortableColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: () => void;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  onTaskClick: (task: Task) => void;
}

export function SortableColumn({
  column,
  tasks,
  onAddTask,
  onUpdateTitle,
  onDelete,
  onTaskClick,
}: SortableColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(column.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleTitleSubmit = () => {
    onUpdateTitle(editValue);
    setIsEditing(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex-shrink-0 w-72 h-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-72 flex flex-col h-full"
    >
      {/* Column Header */}
      <div 
        {...attributes} 
        {...listeners}
        className="group flex items-center justify-between p-2 mb-2 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditing ? (
            <input
              autoFocus
              className="bg-white dark:bg-slate-800 border border-blue-500 rounded px-2 py-0.5 text-sm font-bold w-full outline-none"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            />
          ) : (
            <h3 
              className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate px-2 py-0.5"
              onDoubleClick={() => setIsEditing(true)}
            >
              {column.title}
            </h3>
          )}
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onAddTask}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onDelete}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[100px]">
            {tasks.map((task) => (
              <SortableTaskCard 
                key={task.id} 
                task={task} 
                onClick={onTaskClick}
              />
            ))}
            
            {tasks.length === 0 && (
              <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2 p-4 text-center">
                <p className="text-[10px] font-medium leading-tight">업무가 없습니다.<br/>새로운 업무를 추가해보세요.</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
