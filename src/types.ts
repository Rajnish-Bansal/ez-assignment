export type Id = string | number;

// --- Tree View Types ---

export interface TreeNode {
  id: Id;
  label: string;
  children?: TreeNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
  parentId?: Id;
  indexString?: string;
}

// --- Kanban Board Types ---

export interface Card {
  id: Id;
  columnId: Id;
  content: string;
  title: string;
}

export interface Column {
  id: Id;
  title: string;
}

export interface KanbanState {
  columns: Column[];
  cards: Card[];
}
