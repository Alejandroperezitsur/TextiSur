import React, { useEffect, useState } from "react";
import { Link } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface UserProductPanelProps {
    conversationId: number;
    className?: string;
}

export const UserProductPanel = ({ conversationId, className }: UserProductPanelProps) => {
    const [details, setDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                // We reuse the existing endpoint structure or assumption
                // NOTE: We might need a dedicated endpoint for conversation details if not already covered
                // The ChatService has getConversationDetails, let's assume we can fetch it via API
                // Currently we don't have a direct "GET /api/conversations/:id" that returns just details without messages? 
                // Wait, `GET /api/conversations/[id]/messages` returns messages.
                // We need `GET /api/conversations` (list) or a specific one.
                // Let's assume we pass the conversation object from the parent or fetch it.
                // For now, I'll fetch from a new endpoint or helper.

                // Let's use logic from getConversations: id, product, store, buyer.
                // I will add a route for this momentarily or usage existing list.
                // For now let's mock/placeholder or fetch from the list via store if available.

                // Better: fetch from `/api/conversations?id=${conversationId}` if we implemented filter, 
                // OR implement `GET /api/conversations/[id]`

                const res = await fetch(`/api/conversations/${conversationId}`); // We need to create this route!
                if (res.ok) {
                    setDetails(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (conversationId) fetchDetails();
    }, [conversationId]);

    if (!details) return null;

    return (
        <div className={cn("bg-background border-l w-80 p-4 hidden md:flex flex-col h-full", className)}>
            <div className="text-center pb-6 border-b">
                <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-3 overflow-hidden">
                    {/* Placeholder Avatar */}
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                        {details.buyer?.name?.[0] || "?"}
                    </div>
                </div>
                <h3 className="font-semibold text-lg">{details.buyer?.name || "Usuario"}</h3>
                <p className="text-sm text-muted-foreground">Comprador</p>
            </div>

            {details.product && (
                <div className="py-6 space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Producto de interés</h4>
                    <div className="bg-slate-50 rounded-xl p-3 border">
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-white">
                            {/* Product Image */}
                            {details.product.images?.[0] ? (
                                <Image
                                    src={details.product.images[0]}
                                    alt={details.product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 300px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">No IMG</div>
                            )}
                        </div>
                        <h5 className="font-semibold leading-tight mb-1">{details.product.name}</h5>
                        <p className="text-primary font-bold text-lg">${details.product.price}</p>

                        <Button className="w-full mt-3" size="sm" variant="outline">
                            Ver Publicación
                        </Button>
                    </div>
                </div>
            )}

            <div className="mt-auto">
                <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                    Bloquear Usuario
                </Button>
            </div>
        </div>
    );
};
