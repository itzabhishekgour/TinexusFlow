import { create } from 'zustand';
import { API_BASE_URL } from '../config';

export const useChatStore = create((set, get) => ({
  conversationId: null,
  conversations: [],
  messages: [], // Message objects: { id, sender, text, timestamp, nodeType }
  isLoading: false,
  isAmbiguous: false,
  ambiguityQuestion: '',
  ambiguityOptions: [],
  selectedModel: localStorage.getItem('selectedModel') || 'gemini-3.1-flash-lite-preview',

  setSelectedModel: (model) => {
    localStorage.setItem('selectedModel', model);
    set({ selectedModel: model });
  },

  setConversationId: (id) => set({ conversationId: id }),

  fetchConversations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`);
      if (response.ok) {
        const data = await response.json();
        set({ conversations: data });
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  },

  sendMessage: async (text, flowStoreActions) => {
    if (!text.trim()) return;

    if (get().isLoading) {
      console.warn('Request blocked: Wait for the current message to finish processing.');
      return;
    }

    set({ isLoading: true });

    // Append the user's message to local chat history for instant UI responsiveness
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString()
    };
    set((state) => ({ messages: [...state.messages, tempUserMsg] }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: get().conversationId,
          message: text,
          model: get().selectedModel
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      // Capture if it's a newly created conversation before updating state
      const isNewConversation = !get().conversationId && data.conversationId;

      // Update conversation ID if it was a new conversation
      if (isNewConversation) {
        set({ conversationId: data.conversationId });
      }

      if (data.ambiguous) {
        // Ambiguity found - ask user for clarification
        set({
          isAmbiguous: true,
          ambiguityQuestion: data.ambiguityQuestion,
          ambiguityOptions: data.ambiguityOptions,
          isLoading: false
        });
      } else {
        // Successful AI message generation
        set({ isAmbiguous: false, ambiguityQuestion: '', ambiguityOptions: [] });

        // Fetch conversations to update the sidebar if it was a new chat
        get().fetchConversations();
        
        // If it was a newly created chat, fetch again after 5 seconds to get the AI-generated title
        if (isNewConversation) {
          setTimeout(() => {
            get().fetchConversations();
          }, 5000);
        }

        // Sync with React Flow graph
        if (flowStoreActions && data.conversationId) {
          await flowStoreActions.fetchTree(data.conversationId);
        }
        
        set({ isLoading: false });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      set({
        messages: [
          ...get().messages,
          {
            id: Date.now() + 1,
            sender: 'system',
            text: 'Connection failed. Please ensure the backend is running and your database is configured.',
            timestamp: new Date().toLocaleTimeString()
          }
        ],
        isLoading: false
      });
    }
  },

  selectAmbiguityOption: async (optionText, optionIndex, flowStoreActions) => {
    set({ isAmbiguous: false, isLoading: true });

    // If the option index is 0, they chose to restore the last branch
    // Else they wanted to create a new branch here.
    // We can send their selection text as a message.
    const userTextChoice = optionIndex === 0 ? "continue" : "create new branch";
    
    // We send this choice to the backend as a chat command
    await get().sendMessage(userTextChoice, flowStoreActions);
  },

  clearChat: () => set({
    conversationId: null,
    messages: [],
    isAmbiguous: false,
    ambiguityQuestion: '',
    ambiguityOptions: [],
    isLoading: false
  }),

  deleteConversation: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete conversation');
      
      // If the currently active conversation was deleted, clear the chat
      if (get().conversationId === id) {
        get().clearChat();
        
        // Also clear the React Flow canvas
        const { useFlowStore } = await import('./flowStore');
        useFlowStore.setState({
          nodes: [],
          edges: [],
          activePathIds: [],
          currentNodeId: null,
          allDbNodes: []
        });
      }
      
      // Refresh sidebar list
      await get().fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  },

  renameConversation: async (id, newTitle) => {
    const originalConversations = get().conversations;
    
    // Optimistic UI update
    set({
      conversations: originalConversations.map(c => 
        c.id === id ? { ...c, title: newTitle } : c
      )
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle })
      });
      
      if (!response.ok) throw new Error('Failed to rename conversation');
      
    } catch (error) {
      console.error('Error renaming conversation:', error);
      // Revert optimistic update on failure
      set({ conversations: originalConversations });
    }
  },

  loadPathIntoMessages: (pathNodes) => {
    // Convert backend Nodes list into a sequential list of Chat Messages
    const chatMessages = [];
    pathNodes.forEach((node) => {
      // User message
      chatMessages.push({
        id: `u-${node.id}`,
        sender: 'user',
        text: node.question,
        timestamp: new Date(node.createdAt).toLocaleTimeString(),
        nodeType: node.nodeType
      });
      // AI response (unless virtual navigation notification)
      if (node.answer) {
        chatMessages.push({
          id: `ai-${node.id}`,
          sender: 'assistant',
          text: node.answer,
          timestamp: new Date(node.createdAt).toLocaleTimeString(),
          nodeType: node.nodeType,
          quickReplies: node.quickReplies
        });
      }
    });
    set({ messages: chatMessages });
  }
}));
