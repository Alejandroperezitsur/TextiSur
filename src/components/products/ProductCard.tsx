import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
    product: {
        id: number | string;
        name: string;
        price: number;
        imageUrl?: string;
        category?: string;
        store?: {
            name: string;
            slug: string;
        };
    };
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
                <Image
                    src={product.imageUrl || "/placeholder-product.png"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg line-clamp-2 mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                {product.store && (
                    <p className="text-sm text-muted-foreground mt-1">{product.store.name}</p>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                    <Link href={`/products/${product.id}`}>Ver Detalles</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
