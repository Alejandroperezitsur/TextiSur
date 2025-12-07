"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
    const { cartItems, total, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Mock form state
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        zip: "",
        card: "4242424242424242",
        expiry: "12/26",
        cvc: "123"
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        productId: item.id,
                        quantity: item.quantity
                    }))
                })
            });

            if (!res.ok) throw new Error("Failed to create checkout session");

            const data = await res.json();

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL returned");
            }

        } catch (error) {
            console.error("Checkout error:", error);
            toast({
                title: "Error al iniciar pago",
                description: "Inténtalo de nuevo más tarde.",
                variant: "destructive"
            });
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto p-12 text-center">
                <p>Debes iniciar sesión para finalizar la compra.</p>
                <Button onClick={() => router.push("/login?redirect=/checkout")} className="mt-4">Iniciar Sesión</Button>
            </div>
        )
    }

    if (cartItems.length === 0) {
        router.push("/cart");
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Resumen de Compra</h1>
            <div className="grid gap-8 lg:grid-cols-2">

                <div className="space-y-6">
                    <div className="rounded-lg border bg-muted/50 p-6">
                        <h2 className="text-xl font-semibold mb-4">Items</h2>
                        <ul className="space-y-4">
                            {cartItems.map(item => (
                                <li key={item.cartItemId} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.name} ({item.size})</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button onClick={handleCheckout} className="w-full" size="lg" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Pagar con Stripe
                    </Button>
                </div>

                <div className="text-sm text-muted-foreground p-4">
                    <p>Al hacer clic en "Pagar con Stripe", serás redirigido a una pasarela segura para completar tu transacción.</p>
                    <p className="mt-2">Aceptamos tarjetas de crédito, débito y Google/Apple Pay.</p>
                </div>

            </div>
        </div>
    );
}
