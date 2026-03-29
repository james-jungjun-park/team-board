import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn, Task, Priority } from '../types';

interface SortableTaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    medium: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  const priorityLabels = {
    low: '낮음',
    medium: '보통',
    high: '높음',
    urgent: '긴급',
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 mb-3"
      />
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      layoutId={task.id}
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      className={cn(
        "group bg-white dark:bg-[#161B22] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer mb-3 transition-colors hover:border-blue-200 dark:hover:border-blue-900/50",
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", priorityColors[task.priority])}>
          {priorityLabels[task.priority]}
        </span>
      </div>
      
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 leading-snug">
        {task.title}
      </h4>
      
      <div className="flex items-center gap-3 mt-4">
        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{format(task.createdAt, 'MMM d')}</span>
        </div>
        
        {task.dueDate && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-medium",
            isOverdue ? "text-red-500" : "text-slate-400 dark:text-slate-500"
          )}>
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
