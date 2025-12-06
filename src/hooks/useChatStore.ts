import { create } from "zustand";
import { Message, Conversation, User } from "@/models"; // Using types from models (simplified)

interface ChatState {
    conversations: any[];
    activeConversationId: number | null;
    messages: any[];
    isLoadingMessages: boolean;
    typingUsers: Record<number, number[]>; // conversationId -> userIds

    // Actions
    setConversations: (conversations: any[]) => void;
    setActiveConversation: (id: number | null) => void;
    setMessages: (messages: any[]) => void;
    addMessage: (message: any) => void;
    setLoadingMessages: (loading: boolean) => void;
    setTyping: (conversationId: number, userId: number, isTyping: boolean) => void;
    updateConversationLastMessage: (conversationId: number, message: any) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    conversations: [],
    activeConversationId: null,
    messages: [],
    isLoadingMessages: false,
    typingUsers: {},

    setConversations: (conversations) => set({ conversations }),
    setActiveConversation: (id) => set({ activeConversationId: id }),
    setMessages: (messages) => set({ messages }),

    addMessage: (message) => set((state) => {
        // Only add if belongs to active conversation
        if (state.activeConversationId === message.conversationId) {
            // Prevent duplicates
            if (state.messages.some(m => m.id === message.id)) return state;
            return { messages: [message, ...state.messages] };
        }
        return state;
    }),

    setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),

    setTyping: (conversationId, userId, isTyping) => set((state) => {
        const currentTyping = state.typingUsers[conversationId] || [];
        let newTyping;
        if (isTyping) {
            if (!currentTyping.includes(userId)) newTyping = [...currentTyping, userId];
            else newTyping = currentTyping;
        } else {
            newTyping = currentTyping.filter(id => id !== userId);
        }
        return { typingUsers: { ...state.typingUsers, [conversationId]: newTyping } };
    }),

    updateConversationLastMessage: (conversationId, message) => set((state) => {
        const convos = state.conversations.map(c => {
            if (c.id === conversationId) {
                return { ...c, lastMessage: message, lastMessageAt: message.createdAt };
            }
            return c;
        });
        // Re-sort
        convos.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        return { conversations: convos };
    }),
}));
