/* eslint-disable */
import React, { useState } from 'react';
import { 
  ChevronRight, 
  Plus, 
  Trash2, 
  Loader2,
  Check,
  X
} from 'lucide-react';
import type { TreeNode as TreeNodeType, Id } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  node: TreeNodeType;
  depth?: number;
  onExpand: (id: Id) => void;
  onAdd: (parentId: Id) => void;
  onDelete: (id: Id) => void;
  onUpdate: (id: Id, label: string) => void;
  isLastBase?: boolean;
}

export const TreeNode: React.FC<Props> = ({ node, depth = 0, onExpand, onAdd, onDelete, onUpdate, isLastBase = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    marginLeft: depth > 0 ? '24px' : '0px', 
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(node.label);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExpand(node.id);
  };

  const handleSave = () => {
    onUpdate(node.id, editLabel);
    setIsEditing(false);
  };

  const hasChildren = node.children !== undefined;

  return (
    <div ref={setNodeRef} style={style} className={cn("relative select-none", isDragging && "opacity-50")}>
      {depth > 0 && (
        <>
          <div className="absolute -left-[18px] -top-3 bottom-1/2 w-px bg-indigo-200" />
          <div className="absolute -left-[18px] top-1/2 w-[18px] h-px bg-indigo-200" />
        </>
      )}

      <div 
        {...attributes}
        {...listeners}
        className={cn(
          "group relative flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 px-2 sm:px-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer z-10",
          node.isExpanded && "border-indigo-300"
        )}
        onDoubleClick={() => setIsEditing(true)}
      >
        <div onClick={handleToggle} className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 hover:bg-indigo-100" onPointerDown={e => e.stopPropagation()}>
          {node.isLoading ? (
            <Loader2 size={12} className="animate-spin sm:w-[14px] sm:h-[14px]" />
          ) : hasChildren ? (
            <span className={`transition-transform duration-200 ${node.isExpanded ? 'rotate-90' : ''}`}>
              <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px]" />
            </span>
          ) : (
             <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-300" />
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-1 flex-1 min-w-0" onPointerDown={e => e.stopPropagation()}>
            <span className="text-sm font-bold text-indigo-600 mr-2">{node.indexString}</span>
            <input
              autoFocus
              className="border border-indigo-300 rounded px-2 py-0.5 text-sm outline-none w-full text-indigo-900 focus:ring-2 focus:ring-indigo-100"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              onClick={e => e.stopPropagation()}
            />
            <button onClick={handleSave} className="text-green-600 p-1 hover:bg-green-50 rounded"><Check size={14}/></button>
            <button onClick={() => setIsEditing(false)} className="text-red-500 p-1 hover:bg-red-50 rounded"><X size={14}/></button>
          </div>
        ) : (
          <div className="flex items-center flex-1 min-w-0">
             <span className="text-sm font-bold text-indigo-600 mr-2">{node.indexString}</span>
             <span className="text-sm font-semibold text-slate-700 truncate">{node.label}</span>
          </div>
        )}

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1" onPointerDown={e => e.stopPropagation()}>
          <button 
            onClick={(e) => { e.stopPropagation(); onAdd(node.id); }}
            className="p-1 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded"
          >
            <Plus size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {node.isExpanded && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="absolute left-[20px] top-0 bottom-0 w-px bg-indigo-200 -z-10" />

            <div className="flex flex-col gap-2 pt-2">
              {node.children.map((child, index) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  onExpand={onExpand}
                  onAdd={onAdd}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  isLastBase={index === (node.children?.length || 0) - 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

