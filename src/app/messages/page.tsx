"use client";

import React, { useState } from "react";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { UserProductPanel } from "@/components/messages/UserProductPanel";
import { SocketProvider } from "@/context/SocketContext";
import { useSearchParams } from "next/navigation";

export default function MessagesPage() {
    const searchParams = useSearchParams();
    // Allow linking to a specific conversation via ?id=...
    const [selectedId, setSelectedId] = useState<number | null>(
        searchParams?.get("conversationId") ? parseInt(searchParams.get("conversationId")!) : null
    );

    return (
        <SocketProvider>
            <div className="flex h-[calc(100vh-64px)] w-full bg-white overflow-hidden">
                {/* Conversations Sidebar */}
                <div className="w-full md:w-80 lg:w-96 flex-shrink-0 h-full border-r">
                    <ConversationList
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 h-full min-w-0 flex flex-col relative z-0">
                    {selectedId ? (
                        <ChatWindow conversationId={selectedId} />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 space-y-4">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                                <span className="text-4xl">💬</span>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-600">Mensajes de TextiSur</h3>
                            <p className="max-w-sm text-center">Selecciona una conversación para ver los mensajes, fotos y detalles del producto.</p>
                        </div>
                    )}
                </div>

                {/* Details Panel (Right Sidebar) */}
                {selectedId && (
                    <UserProductPanel conversationId={selectedId} className="hidden xl:flex" />
                )}
            </div>
        </SocketProvider>
    );
}
