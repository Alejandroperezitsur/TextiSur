"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Eye, ShoppingBag, Star, Truck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@/types/cart";
import { Badge } from "@/components/ui/badge";

interface ProductQuickViewProps {
    product: {
        id: number;
        name: string;
        price: number;
        imageUrl?: string;
        category?: string;
        sizes: string[];
        hint?: string;
        rating?: number;
        hasDelivery?: boolean;
        description?: string;
        storeId?: number | string;
    };
}

export function ProductQuickView({ product }: ProductQuickViewProps) {
    const { addToCart } = useCart();
    const { toast } = useToast();
    const [selectedSize, setSelectedSize] = useState<string>(
        product.sizes[0] || "N/A"
    );
    const [isOpen, setIsOpen] = useState(false);

    const handleAddToCart = () => {
        const itemToAdd: CartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl:
                product.imageUrl ||
                `https://picsum.photos/seed/product-${product.id}/600/600`,
            quantity: 1,
            size: selectedSize,
            storeId: product.storeId ? Number(product.storeId) : undefined,
        };
        addToCart(itemToAdd);
        toast({
            title: "Añadido al Carrito",
            description: `${product.name} (Talla: ${selectedSize}) ha sido añadido a tu carrito.`,
        });
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Vista Rápida</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] overflow-hidden p-0 gap-0">
                <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-[300px] md:h-[500px] w-full bg-muted">
                        <Image
                            src={
                                product.imageUrl ||
                                `https://picsum.photos/seed/product-${product.id}/600/600`
                            }
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                        />
                    </div>
                    <div className="p-6 flex flex-col h-full">
                        <DialogHeader className="mb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="outline" className="mb-2">
                                        {product.category || "General"}
                                    </Badge>
                                    <DialogTitle className="text-2xl font-bold">
                                        {product.name}
                                    </DialogTitle>
                                </div>
                                <div className="text-xl font-bold text-primary">
                                    ${product.price.toFixed(2)}
                                </div>
                            </div>
                            <DialogDescription className="text-base mt-2">
                                {product.description ||
                                    "Descubre la calidad y el estilo de este increíble producto. Perfecto para cualquier ocasión."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-grow space-y-6">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center text-yellow-500">
                                    <Star className="h-4 w-4 mr-1 fill-current" />
                                    <span className="font-medium">
                                        {(product.rating ?? 4.5).toFixed(1)}
                                    </span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                    <Truck className="h-4 w-4 mr-1" />
                                    <span>
                                        {product.hasDelivery ? "Envío disponible" : "Recogida en tienda"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Seleccionar Talla</label>
                                <Select value={selectedSize} onValueChange={setSelectedSize}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona una talla" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {product.sizes.length > 0 ? (
                                            product.sizes.map((size) => (
                                                <SelectItem key={size} value={size}>
                                                    {size}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="N/A">Única</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                            <Button
                                className="w-full btn-accent text-lg h-12"
                                onClick={handleAddToCart}
                            >
                                <ShoppingBag className="mr-2 h-5 w-5" /> Añadir al Carrito
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
