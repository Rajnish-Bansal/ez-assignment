/* eslint-disable */
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import type { Column, Card, Id } from '../types';
import { KanbanCard } from './KanbanCard';
import { useKanbanStore } from '../store';

interface Props {
  column: Column;
  cards: Card[];
}



export const KanbanColumn: React.FC<Props> = ({ column, cards }) => {
  const addCard = useKanbanStore((state) => state.addCard);
  
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'Column', column },
  });

  const getColor = (id: Id) => {
    if (id === 'todo') return 'bg-blue-500';
    if (id === 'in-progress') return 'bg-orange-500';
    if (id === 'done') return 'bg-emerald-500';
    return 'bg-gray-500';
  };

  return (
    <div ref={setNodeRef} className="flex flex-col w-full sm:w-80 sm:h-full bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
      <div className={`flex justify-between items-center p-2 sm:p-3 rounded-t-lg ${getColor(column.id)} text-white flex-shrink-0`}>
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-xs sm:text-sm">{column.title}</h2>
          <span className="bg-white/20 text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded">
            {cards.length}
          </span>
        </div>
        <button 
          onClick={() => addCard(column.id, 'New task description', 'New Task')}
          className="p-1 hover:bg-white/20 rounded"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 flex-1 sm:overflow-y-auto sm:min-h-0">
        <button
          onClick={() => addCard(column.id, '', 'New Card')}
          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white rounded shadow-sm border border-gray-200 text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
        >
          <Plus size={14} />
          Add Card
        </button>

        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
