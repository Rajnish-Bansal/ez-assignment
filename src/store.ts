import { create } from 'zustand';
import type { Id, Card, KanbanState } from './types';

interface KanbanActions {
  addColumn: (title: string) => void;
  deleteColumn: (id: Id) => void;
  updateColumnTitle: (id: Id, title: string) => void;
  addCard: (columnId: Id, content: string, title?: string) => void;
  deleteCard: (id: Id) => void;
  updateCard: (id: Id, updates: Partial<Card>) => void;
  moveCard: (cardId: Id, toColumnId: Id, index: number) => void;
  reorderCards: (columnId: Id, activeId: Id, overId: Id) => void;
  setCards: (cards: Card[]) => void;
}

export const useKanbanStore = create<KanbanState & KanbanActions>((set) => ({
  columns: [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ],
  cards: [
    { id: '1', columnId: 'todo', title: 'Research competitors', content: 'Analyze top 3 competitors features' },
    { id: '2', columnId: 'todo', title: 'Draft technical specs', content: 'Outline API endpoints and DB schema' },
    { id: '3', columnId: 'in-progress', title: 'Setup repo', content: 'Initialize project with CRA and Typescript' },
  ],

  addColumn: (title) => 
    set((state) => ({ 
      columns: [...state.columns, { id: `col-${Date.now()}`, title }] 
    })),

  deleteColumn: (id) =>
    set((state) => ({
      columns: state.columns.filter((col) => col.id !== id),
      cards: state.cards.filter((card) => card.columnId !== id),
    })),

  updateColumnTitle: (id, title) =>
    set((state) => ({
      columns: state.columns.map((col) => (col.id === id ? { ...col, title } : col)),
    })),

  addCard: (columnId, content, title) =>
    set((state) => ({
      cards: [
        ...state.cards,
        {
          id: `card-${Date.now()}`,
          columnId,
          title: title || 'New Task',
          content,
        },
      ],
    })),

  deleteCard: (id) =>
    set((state) => ({
      cards: state.cards.filter((card) => card.id !== id),
    })),

  updateCard: (id, updates) =>
    set((state) => ({
      cards: state.cards.map((card) => (card.id === id ? { ...card, ...updates } : card)),
    })),

  moveCard: (cardId, toColumnId, index) =>
    set((state) => {
      const card = state.cards.find((c) => c.id === cardId);
      if (!card) return state;

      const otherCards = state.cards.filter((c) => c.id !== cardId);
      const columnCards = otherCards.filter((c) => c.columnId === toColumnId);
      const otherColumnCards = otherCards.filter((c) => c.columnId !== toColumnId);

      const newCard = { ...card, columnId: toColumnId };
      columnCards.splice(index, 0, newCard);

      return { cards: [...otherColumnCards, ...columnCards] };
    }),

  reorderCards: (columnId, activeId, overId) =>
    set((state) => {
      const columnCards = state.cards.filter((c) => c.columnId === columnId);
      const otherCards = state.cards.filter((c) => c.columnId !== columnId);

      const oldIndex = columnCards.findIndex((c) => c.id === activeId);
      const newIndex = columnCards.findIndex((c) => c.id === overId);

      if (oldIndex === -1 || newIndex === -1) return state;

      const newColumnCards = [...columnCards];
      const [movedCard] = newColumnCards.splice(oldIndex, 1);
      newColumnCards.splice(newIndex, 0, movedCard);

      return { cards: [...otherCards, ...newColumnCards] };
    }),

  setCards: (cards) => set({ cards }),
}));
