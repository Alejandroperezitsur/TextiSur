"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

export function UpdateNotification() {
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
    const [showReload, setShowReload] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        const onControllerChange = () => {
            window.location.reload();
        };

        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

        navigator.serviceWorker.ready.then((registration) => {
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;

                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            setWaitingWorker(newWorker);
                            setShowReload(true);

                            toast({
                                title: "Nueva versión disponible",
                                description: "Hay una actualización lista para instalar.",
                                action: (
                                    <Button
                                        size="sm"
                                        onClick={handleUpdate}
                                        className="gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Actualizar
                                    </Button>
                                ),
                                duration: Infinity,
                            });
                        }
                    });
                }
            });
        });

        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        };
    }, []);

    const handleUpdate = () => {
        if (waitingWorker) {
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
            setShowReload(false);
        }
    };

    return null; // Toast handles the UI
}
