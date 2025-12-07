"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PUBLIC_VAPID_KEY = "BJwF5w70sF8K5A6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z"; // Placeholder, TODO: Generate real key

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushManager() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((sub) => {
                    if (sub) {
                        setIsSubscribed(true);
                        setSubscription(sub);
                    }
                });
            });
        }
    }, []);

    const subscribeUser = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
            });

            setSubscription(sub);
            setIsSubscribed(true);

            // Send subscription to backend
            await fetch("/api/notifications/subscribe", {
                method: "POST",
                body: JSON.stringify(sub),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            toast({
                title: "Notificaciones activadas",
                description: "Recibirás notificaciones de nuevos mensajes.",
            });
        } catch (error) {
            console.error("Failed to subscribe the user: ", error);
            toast({
                title: "Error",
                description: "No se pudo activar las notificaciones.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const unsubscribeUser = async () => {
        setLoading(true);
        try {
            if (subscription) {
                await subscription.unsubscribe();
                setIsSubscribed(false);
                setSubscription(null);
                // Optionally notify backend to delete subscription
                toast({
                    title: "Notificaciones desactivadas",
                    description: "Ya no recibirás notificaciones.",
                });
            }
        } catch (error) {
            console.error("Error unsubscribing", error);
        } finally {
            setLoading(false);
        }
    };

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return null;
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={isSubscribed ? unsubscribeUser : subscribeUser}
            disabled={loading}
            title={isSubscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
        >
            {isSubscribed ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4" />}
        </Button>
    );
}
