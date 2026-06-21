import { create } from 'zustand';
import { API_BASE_URL } from '../config';
import { layoutTree } from '../utils/treeHelpers';
import { useChatStore } from './chatStore';

export const useFlowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  activePathIds: [],
  currentNodeId: null,
  allDbNodes: [],

  fetchTree: async (conversationId) => {
    if (!conversationId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/flow/tree/${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch conversation tree');

      const data = await response.json();
      const dbNodes = data.nodes || [];
      const flowState = data.flowState || {};

      // Parse active path IDs: e.g. "1,2,5" -> [1, 2, 5]
      const activePathIds = flowState.currentPath 
        ? flowState.currentPath.split(',').map(id => Number(id)) 
        : [];

      // Sort and calculate active path Nodes in chronological order (by depth)
      const activePathNodes = dbNodes
        .filter(node => activePathIds.includes(node.id))
        .sort((a, b) => a.depth - b.depth);

      // Perform tree layout calculations
      const { flowNodes, flowEdges } = layoutTree(dbNodes, activePathIds);

      set({
        nodes: flowNodes,
        edges: flowEdges,
        activePathIds,
        currentNodeId: flowState.currentNodeId,
        allDbNodes: dbNodes
      });

      // Synchronize with Chat message window history
      useChatStore.getState().loadPathIntoMessages(activePathNodes);

    } catch (error) {
      console.error("Error loading conversation tree:", error);
    }
  },

  navigateToNode: async (conversationId, targetNodeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flow/navigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, targetNodeId })
      });

      if (response.ok) {
        await get().fetchTree(conversationId);
      }
    } catch (error) {
      console.error("Error navigating to node:", error);
    }
  },

  returnToParent: async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flow/return-parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      });

      if (response.ok) {
        await get().fetchTree(conversationId);
      }
    } catch (error) {
      console.error("Error navigating to parent:", error);
    }
  },

  returnToRoot: async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flow/return-root`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      });

      if (response.ok) {
        await get().fetchTree(conversationId);
      }
    } catch (error) {
      console.error("Error navigating to root:", error);
    }
  }
}));
