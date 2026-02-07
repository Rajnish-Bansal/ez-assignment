/* eslint-disable */
import React, { useState } from 'react';
import { TreeNode } from './TreeNode';
import type { TreeNode as TreeNodeType, Id } from '../types';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const INITIAL_DATA: TreeNodeType[] = [
  {
    id: 'root-1',
    label: 'Documents',
    indexString: '1',
    children: [], // will be filled dynamically or empty
    isExpanded: false,
  },
];

export const TreeView: React.FC = () => {
  const [data, setData] = useState<TreeNodeType[]>(INITIAL_DATA);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const findNode = (nodes: TreeNodeType[], id: Id): TreeNodeType | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateNode = (nodes: TreeNodeType[], id: Id, updates: Partial<TreeNodeType>): TreeNodeType[] => {
    return nodes.map((node) => {
      if (node.id === id) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return { ...node, children: updateNode(node.children, id, updates) };
      }
      return node;
    });
  };


  const handleExpand = async (id: Id) => {
    const node = findNode(data, id);
    if (!node || node.children === undefined) return;

    if (node.isExpanded) {
      setData((prev: TreeNodeType[]) => updateNode(prev, id, { isExpanded: false }));
      return;
    }

    if (node.children.length === 0) {
      // For demo purposes, we won't lazy load random files anymore to keep numbering consistent.
      // Just expand.
      setData((prev: TreeNodeType[]) => updateNode(prev, id, { isExpanded: true }));
    } else {
      setData((prev: TreeNodeType[]) => updateNode(prev, id, { isExpanded: true }));
    }
  };

  const handleAdd = (parentId: Id | null) => {
    setData((prev: TreeNodeType[]) => {
      const newNode: TreeNodeType = {
        id: `node-${Date.now()}`,
        label: 'New Item', 
        indexString: '', // Will be overwritten by reindex
        children: [],
        parentId: parentId || undefined,
      };

      let nextState = [...prev];

      if (!parentId) {
        nextState = [...prev, newNode];
      } else {
        const parentNode = findNode(prev, parentId);
        if (parentNode) {
          nextState = updateNode(prev, parentId, {
            children: [...(parentNode.children || []), newNode],
            isExpanded: true
          });
        } else {
             nextState = [...prev, newNode];
        }
      }
      
      return reindexNodes(nextState);
    });
  };

  const reindexNodes = (nodes: TreeNodeType[], prefix: string = ''): TreeNodeType[] => {
    return nodes.map((node, index) => {
      const newIndexString = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
      return {
        ...node,
        indexString: newIndexString,
        children: node.children ? reindexNodes(node.children, newIndexString) : [],
      };
    });
  };

  const deleteNode = (nodes: TreeNodeType[], id: Id): TreeNodeType[] => {
    return nodes
      .filter((node) => node.id !== id)
      .map((node) => ({
        ...node,
        children: node.children ? deleteNode(node.children, id) : undefined,
      }));
  };

  const handleDelete = (id: Id) => {
    setData((prev: TreeNodeType[]) => {
        const newState = deleteNode(prev, id);
        return reindexNodes(newState);
    });
  };

  const handleUpdate = (id: Id, label: string) => {
    setData((prev: TreeNodeType[]) => updateNode(prev, id, { label }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const findParentAndIndices = (nodes: TreeNodeType[], id: Id): { parent: TreeNodeType[] | null, index: number } => {
      const index = nodes.findIndex(n => n.id === id);
      if (index !== -1) return { parent: nodes, index };
      
      for (const node of nodes) {
        if (node.children) {
          const res = findParentAndIndices(node.children, id);
          if (res.parent) return res;
        }
      }
      return { parent: null, index: -1 };
    };

      setData((prev: TreeNodeType[]) => {
        const activeInfo = findParentAndIndices(prev, active.id);
        const overInfo = findParentAndIndices(prev, over.id);

        if (!activeInfo.parent || !overInfo.parent) return prev;

        const activeParent = activeInfo.parent;
        const overParent = overInfo.parent;
        const activeIndex = activeInfo.index;
        const overIndex = overInfo.index;

        // Clone the state to avoid mutation
        let newNodes = [...prev];

        // 1. Remove active item from its original parent
        let movedItem: TreeNodeType | undefined;
        
        const removeFromParent = (nodes: TreeNodeType[]): TreeNodeType[] => {
          return nodes.map(node => {
            if (node.children) {
               // Check if the item is in this node's children
               const updatedChildren = node.children.filter(child => child.id !== active.id);
               if (updatedChildren.length !== node.children.length) {
                 movedItem = node.children.find(child => child.id === active.id);
                 return { ...node, children: updatedChildren };
               }
               return { ...node, children: removeFromParent(node.children) };
            }
            return node;
          });
        };

        // Handle root level removal
        if (activeParent === prev) {
          movedItem = prev[activeIndex];
          newNodes = prev.filter(node => node.id !== active.id);
        } else {
          newNodes = removeFromParent(newNodes);
        }

        if (!movedItem) return prev;

        // 2. Insert item into new parent
        const addToParent = (nodes: TreeNodeType[]): TreeNodeType[] => {
          return nodes.map(node => {
            if (node.children === overParent) {
              const updatedChildren = [...node.children];
              updatedChildren.splice(overIndex, 0, movedItem!);
              return { ...node, children: updatedChildren };
            }
            if (node.children) {
              return { ...node, children: addToParent(node.children) };
            }
            return node;
          });
        };

        // Handle root level insertion
        if (overParent === prev) {
           newNodes.splice(overIndex, 0, movedItem);
        } else {
           newNodes = addToParent(newNodes);
        }

        return reindexNodes(newNodes);
      });
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-indigo-50 to-blue-50 p-2 sm:p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex-1" />
        <h2 className="text-lg sm:text-xl font-bold text-indigo-900">Hierarchical Tree</h2>
        <div className="flex-1 flex justify-end">
          <button 
            onClick={() => handleAdd(null)} 
            className="p-1.5 sm:p-2 hover:bg-white/50 rounded-lg text-indigo-500 hover:text-indigo-900"
            title="Add New File"
          >
            <Plus size={18} className="sm:hidden" />
            <Plus size={20} className="hidden sm:block" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 flex justify-center">
        <div className="w-full max-w-2xl">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={data.map((n) => n.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-1">
                {data.map((node) => (
                  <TreeNode 
                    key={node.id} 
                    node={node} 
                    onExpand={handleExpand}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};
