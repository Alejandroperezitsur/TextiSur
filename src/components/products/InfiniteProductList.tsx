"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ProductCard } from "@/components/products/ProductCard"; // Assume this exists
import { Loader2 } from "lucide-react";

// Simplified ProductCard if original is complex to import or modify, 
// ensuring we have something to render.
function ProductCardSimple({ product }: { product: any }) {
    return (
        <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-primary font-semibold">${product.price}</p>
            <p className="text-sm text-muted-foreground">{product.store?.name}</p>
        </div>
    )
}

interface InfiniteProductListProps {
    initialFilters: any;
}

export function InfiniteProductList({ initialFilters }: InfiniteProductListProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastProductRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Reset when filters change
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        // We'll fetch immediately due to page dependency or explicit call
    }, [initialFilters]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const searchParams = new URLSearchParams({
                    page: page.toString(),
                    limit: "12",
                    ...initialFilters
                });

                // Remove empty filters
                for (const [key, value] of Array.from(searchParams.entries())) {
                    if (!value) searchParams.delete(key);
                }

                const res = await fetch(`/api/products?${searchParams.toString()}`);
                const data = await res.json();

                if (data.products.length === 0) {
                    setHasMore(false);
                } else {
                    setProducts(prev => page === 1 ? data.products : [...prev, ...data.products]);
                    if (data.currentPage >= data.totalPages) setHasMore(false);
                }
            } catch (error) {
                console.error("Error loading products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, initialFilters]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => {
                if (products.length === index + 1) {
                    return (
                        <div ref={lastProductRef} key={product.id}>
                            <ProductCardSimple product={product} />
                        </div>
                    );
                } else {
                    return <ProductCardSimple key={product.id} product={product} />; // Use Simple or Real card
                }
            })}
            {loading && <div className="col-span-full flex justify-center py-4"><Loader2 className="animate-spin" /></div>}
            {!hasMore && products.length > 0 && <div className="col-span-full text-center text-muted-foreground py-4">No hay más productos</div>}
            {!hasMore && products.length === 0 && <div className="col-span-full text-center py-12">No se encontraron productos con estos filtros.</div>}
        </div>
    );
}
