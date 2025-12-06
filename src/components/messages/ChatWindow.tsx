"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useChatStore } from "@/hooks/useChatStore";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatWindowProps {
    conversationId: number;
}

export const ChatWindow = ({ conversationId }: ChatWindowProps) => {
    const { socket, isConnected } = useSocket();
    const {
        messages,
        setMessages,
        addMessage,
        isLoadingMessages,
        setLoadingMessages,
        activeConversationId,
        setActiveConversation,
        setTyping,
        typingUsers
    } = useChatStore();

    const scrollRef = useRef<HTMLDivElement>(null);

    // Set active conversation on mount
    useEffect(() => {
        setActiveConversation(conversationId);
        return () => setActiveConversation(null);
    }, [conversationId, setActiveConversation]);

    // Join room
    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.emit("join_conversation", conversationId);

        // Listeners
        socket.on("message:new", (message: any) => {
            console.log("New message received:", message);
            if (message.conversationId === conversationId) {
                addMessage(message);
            }
        });

        socket.on("typing_start", (data: any) => {
            if (data.conversationId === conversationId) {
                setTyping(conversationId, data.userId, true);
            }
        });

        socket.on("typing_stop", (data: any) => {
            if (data.conversationId === conversationId) {
                setTyping(conversationId, data.userId, false);
            }
        });

        return () => {
            socket.emit("leave_conversation", conversationId);
            socket.off("message:new");
            socket.off("typing_start");
            socket.off("typing_stop");
        };
    }, [socket, isConnected, conversationId, addMessage, setTyping]);

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            setLoadingMessages(true);
            try {
                const res = await fetch(`/api/conversations/${conversationId}/messages?limit=50`);
                if (!res.ok) throw new Error("Failed to fetch messages");
                const data = await res.json();
                // Reverse for chat display if API returns newest first
                setMessages(data.reverse());
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [conversationId, setMessages, setLoadingMessages]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, typingUsers]);

    const handleSendMessage = async (content: string, type: "text" | "image", file?: File) => {
        try {
            let attachmentUrl = undefined;

            if (type === "image" && file) {
                const formData = new FormData();
                formData.append("file", file);

                // Note: Auth token should be retrieved more robustly in production
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : "";

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });

                if (!uploadRes.ok) throw new Error("Upload failed");
                const uploadData = await uploadRes.json();
                attachmentUrl = uploadData.url;
            }

            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : "";
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ conversationId, content, type, attachmentUrl })
            });

            if (!res.ok) throw new Error("Failed to send");

            const message = await res.json();
            addMessage(message);
        } catch (error) {
            console.error("Send failed", error);
            // Show toast error
        }
    };

    const handleTypingStart = () => {
        socket?.emit("typing_start", { conversationId });
    };

    const handleTypingStop = () => {
        socket?.emit("typing_stop", { conversationId });
    };

    const isTyping = (typingUsers[conversationId] || []).length > 0;

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        // Simple assumption: if message senderId corresponds to *current user*, it sends isMe
                        // We need current user ID stored somewhere. For now, we will inspect the token on client or fetch user info.
                        // TODO: Integrate proper user context/hook
                        const isMe = false; // REPLACE THIS WITH REAL CHECK
                        return <MessageBubble key={msg.id} message={msg} isMe={isMe} />;
                    })
                )}

                {/* Scroll Anchor */}
                <div ref={scrollRef} />
            </div>

            {/* Typing Indicator */}
            {isTyping && (
                <div className="absolute bottom-[80px] left-4 text-xs text-muted-foreground animate-pulse">
                    Alguien está escribiendo...
                </div>
            )}

            {/* Input Area */}
            <ChatInput
                onSendMessage={handleSendMessage}
                onTypingStart={handleTypingStart}
                onTypingStop={handleTypingStop}
            />

            {!isConnected && (
                <Alert variant="destructive" className="absolute top-2 left-2 right-2 w-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Desconectado del servidor de chat. Reconectando...
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};
