/* eslint-disable */
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Edit2 } from 'lucide-react';
import type { Card } from '../types';
import { useKanbanStore } from '../store';

interface Props {
  card: Card;
}

export const KanbanCard: React.FC<Props> = ({ card }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const deleteCard = useKanbanStore((state) => state.deleteCard);
  const updateCard = useKanbanStore((state) => state.updateCard);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'Card', card },
    disabled: isEditing,
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const handleSave = () => {
    updateCard(card.id, { title: editTitle });
    setIsEditing(false);
  };

  const getBorderColor = (columnId: string) => {
    if (columnId === 'todo') return 'border-l-blue-500';
    if (columnId === 'in-progress') return 'border-l-orange-500';
    if (columnId === 'done') return 'border-l-emerald-500';
    return 'border-l-gray-300';
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 p-4 min-h-[100px] rounded-lg border-2 border-indigo-400 bg-indigo-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white border-l-4 ${getBorderColor(card.columnId as string)} p-3 sm:p-4 rounded-r-lg shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing border border-gray-100`}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start gap-2 sm:gap-3">
        {isEditing ? (
          <div className="flex-1 flex flex-col gap-2" onPointerDown={e => e.stopPropagation()}>
            <textarea
              autoFocus
              className="w-full border border-indigo-200 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
              rows={3}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <div className="flex gap-2 justify-end">
               <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Save</button>
               <button onClick={() => setIsEditing(false)} className="text-gray-500 px-3 py-1 rounded text-xs hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0" onDoubleClick={() => setIsEditing(true)}>
            <h3 className="text-sm font-medium text-gray-800">
              {card.title}
            </h3>
          </div>
        )}
        
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100" onPointerDown={e => e.stopPropagation()}>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-indigo-600 p-1 hover:bg-indigo-50 rounded"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => deleteCard(card.id)}
            className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
