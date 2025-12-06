"use client";

import React, { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { useChatStore } from "@/hooks/useChatStore";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ConversationListProps {
    onSelect: (id: number) => void;
    selectedId: number | null;
}

export const ConversationList = ({ onSelect, selectedId }: ConversationListProps) => {
    const { conversations, setConversations, activeConversationId, updateConversationLastMessage, typingUsers } = useChatStore();
    const [loading, setLoading] = React.useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch("/api/conversations");
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [setConversations]);

    // Listen for global new messages to update list order/preview
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: any) => {
            updateConversationLastMessage(message.conversationId, message);
        };

        socket.on("message:new", handleNewMessage);
        return () => {
            socket.off("message:new", handleNewMessage);
        };
    }, [socket, updateConversationLastMessage]);

    if (loading) {
        return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-white border-r">
            <div className="p-4 border-b">
                <h2 className="font-bold text-xl">Mensajes</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No tienes conversaciones aún.</div>
                ) : (
                    conversations.map((conv) => {
                        const isTyping = (typingUsers[conv.id] || []).length > 0;
                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={cn(
                                    "w-full text-left p-4 hover:bg-slate-50 transition-colors border-b last:border-0 flex gap-3",
                                    selectedId === conv.id && "bg-slate-100 ring-2 ring-inset ring-primary/10"
                                )}
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">
                                    {conv.store?.name?.[0] || conv.buyer?.name?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-semibold truncate pr-2">
                                            {conv.store?.name || conv.buyer?.name}
                                        </h4>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ""}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {isTyping ? (
                                            <span className="text-primary italic">Escribiendo...</span>
                                        ) : (
                                            conv.lastMessage?.content || "Empezar conversación"
                                        )}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};
