"use client";

import React, { useState } from "react";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { UserProductPanel } from "@/components/messages/UserProductPanel";
import { SocketProvider } from "@/context/SocketContext";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function MessagesPage() {
    const searchParams = useSearchParams();
    // Allow linking to a specific conversation via ?id=...
    const [selectedId, setSelectedId] = useState<number | null>(
        searchParams?.get("conversationId") ? parseInt(searchParams.get("conversationId")!) : null
    );
    const [showDetails, setShowDetails] = useState(false);

    const handleBack = () => {
        setSelectedId(null);
        setShowDetails(false);
    };

    return (
        <SocketProvider>
            {/* Height: 100dvh - Header(64) - MobileNav(64) = 128px on mobile. 
                Desktop: 100vh - Header(64). MobileNav hidden.
            */}
            <div className="flex h-[calc(100dvh-128px)] md:h-[calc(100vh-64px)] w-full bg-white overflow-hidden">
                {/* Conversations Sidebar 
                    Mobile: Hidden if conversation selected
                    Desktop: Always visible (w-80)
                */}
                <div className={`flex-shrink-0 h-full border-r ${selectedId ? "hidden md:block w-full md:w-80 lg:w-96" : "w-full md:w-80 lg:w-96"}`}>
                    <ConversationList
                        selectedId={selectedId}
                        onSelect={(id) => { setSelectedId(id); setShowDetails(false); }}
                    />
                </div>

                {/* Main Chat Area 
                    Mobile: Hidden if NO conversation selected
                    Desktop: Always visible (flex-1)
                    Also hidden if showDetails is true on mobile (and taking full screen), although typical chat apps overlay details. 
                    Let's allow chat to be hidden if details is full screen.
                */}
                <div className={`flex-1 h-full min-w-0 flex flex-col relative z-0 ${!selectedId ? "hidden md:flex" : "flex"} ${showDetails ? "hidden xl:flex" : "flex"}`}>
                    {selectedId ? (
                        <ChatWindow
                            conversationId={selectedId}
                            onBack={handleBack}
                            onToggleDetails={() => setShowDetails(!showDetails)}
                        />
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

                {/* Details Panel (Right Sidebar) 
                    Desktop: Visible on XL
                    Mobile: Overlay/Full screen if showDetails
                */}
                {selectedId && (
                    <div className={`${showDetails ? "flex absolute inset-0 z-30 bg-white md:bg-transparent md:static md:z-auto" : "hidden"} xl:flex xl:static xl:w-80 border-l`}>
                        <div className="w-full h-full flex flex-col">
                            {/* Mobile Back Button for Details */}
                            <div className="xl:hidden p-4 border-b flex items-center gap-2 bg-white">
                                <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <span className="font-semibold">Detalles del Producto</span>
                            </div>
                            <UserProductPanel conversationId={selectedId} className="flex-1 w-full border-0" />
                        </div>
                    </div>
                )}
            </div>
        </SocketProvider>
    );
}
