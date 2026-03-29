import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Trash2, Calendar, Tag, AlignLeft, Type } from 'lucide-react';
import { cn, Task, Priority } from '../types';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: () => void;
}

export function TaskModal({ task, onClose, onUpdate, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || '');

  const handleSave = () => {
    onUpdate({
      ...task,
      title,
      description,
      priority,
      dueDate: dueDate || undefined,
    });
    onClose();
  };

  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
  const priorityLabels = {
    low: '낮음',
    medium: '보통',
    high: '높음',
    urgent: '긴급',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white dark:bg-[#161B22] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Type className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">업무 상세</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Title */}
          <div className="space-y-2">
            <input
              type="text"
              className="w-full bg-transparent text-2xl font-bold text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-300"
              placeholder="업무 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Tag className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">우선순위</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {priorities.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-semibold transition-all border",
                      priority === p
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    {priorityLabels[p]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">마감 기한</span>
              </div>
              <input
                type="date"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={dueDate ? dueDate.split('T')[0] : ''}
                onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <AlignLeft className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">상세 설명</span>
            </div>
            <textarea
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[150px] resize-none"
              placeholder="업무에 대한 상세 내용을 입력하세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            저장하기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
