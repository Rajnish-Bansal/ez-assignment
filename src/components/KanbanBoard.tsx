import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useKanbanStore } from '../store';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { Card } from '../types';

export const KanbanBoard: React.FC = () => {
  const { columns, cards, moveCard, reorderCards } = useKanbanStore();
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Card') {
      setActiveCard(event.active.data.current.card);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === 'Card';
    const isOverACard = over.data.current?.type === 'Card';

    if (!isActiveACard) return;

    // Dropping a Card over another Card
    if (isActiveACard && isOverACard) {
      const activeCard = cards.find((c) => c.id === activeId);
      const overCard = cards.find((c) => c.id === overId);

      if (activeCard && overCard && activeCard.columnId !== overCard.columnId) {
        moveCard(activeId, overCard.columnId, cards.indexOf(overCard));
      }
    }

    // Dropping a Card over a Column
    const isOverAColumn = over.data.current?.type === 'Column';
    if (isActiveACard && isOverAColumn) {
      const activeCard = cards.find((c) => c.id === activeId);
      if (activeCard && activeCard.columnId !== overId) {
        moveCard(activeId, overId, cards.length);
      }
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeCard = cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    const overCard = cards.find((c) => c.id === overId);
    
    if (activeCard && overCard && activeCard.columnId === overCard.columnId) {
      reorderCards(activeCard.columnId, activeId, overId);
    }
  }

  return (
    <div className="flex flex-col h-full w-full p-2 sm:p-6 bg-gray-50/50">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1 min-h-0 overflow-y-auto sm:overflow-y-hidden sm:overflow-x-auto sm:justify-center">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:min-w-max">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={cards.filter((card) => card.columnId === column.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? <KanbanCard card={activeCard} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
