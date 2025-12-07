"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StoreIcon, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function StoresClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todas");
    const [stores, setStores] = useState<any[]>([]);

    useEffect(() => {
        if (!searchParams) return;
        const initial = searchParams.get("search") || "";
        const initialCategory = searchParams.get("category") || "Todas";
        setQuery(initial);
        setSelectedCategory(initialCategory);
    }, [searchParams]);

    useEffect(() => {
        const loadStores = async () => {
            try {
                const resp = await fetch("/api/stores");
                if (resp.ok) {
                    const data = await resp.json();
                    const list = (data.stores || []).map((s: any) => ({
                        id: String(s.id),
                        name: s.name,
                        description: s.description || "",
                        imageUrl: s.logo || `https://picsum.photos/seed/store-${s.slug}/600/400`,
                        slug: s.slug,
                        dataAiHint: "store",
                        categories: [],
                    }));
                    setStores(list);
                } else {
                    setStores([]);
                }
            } catch {
                setStores([]);
            }
        };
        loadStores();
    }, []);

    const allCategories = useMemo(() => {
        const set = new Set<string>();
        stores.forEach((s: any) => {
            (s.categories || []).forEach((c: string) => set.add(c));
        });
        return ["Todas", ...Array.from(set)];
    }, [stores]);

    const filteredStores = useMemo(() => {
        const q = query.trim().toLowerCase();
        return stores.filter((s: any) => {
            const matchesQuery =
                !q ||
                s.name.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.slug.toLowerCase().includes(q);
            const matchesCategory =
                selectedCategory === "Todas" || (s.categories || []).includes(selectedCategory);
            return matchesQuery && matchesCategory;
        });
    }, [query, selectedCategory, stores]);

    const applySearch = (value: string) => {
        setQuery(value);
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (value.trim()) params.set("search", value.trim());
        else params.delete("search");
        if (selectedCategory && selectedCategory !== "Todas") params.set("category", selectedCategory);
        else params.delete("category");
        router.replace(`/stores?${params.toString()}`);
    };

    const applyCategory = (value: string) => {
        setSelectedCategory(value);
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (query.trim()) params.set("search", query.trim());
        else params.delete("search");
        if (value && value !== "Todas") params.set("category", value);
        else params.delete("category");
        router.replace(`/stores?${params.toString()}`);
    };

    return (
        <div className="w-full py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl flex items-center">
                        <StoreIcon className="mr-3 h-8 w-8 text-primary" /> Todas las Tiendas
                    </h1>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <div className="flex-1 flex items-center gap-2">
                        <Input
                            value={query}
                            onChange={(e) => applySearch(e.target.value)}
                            placeholder="Buscar tiendas por nombre, descripción o slug"
                        />
                        {query && (
                            <Button variant="ghost" onClick={() => applySearch("")} className="text-muted-foreground">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="w-56">
                        <Select value={selectedCategory} onValueChange={applyCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {allCategories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                    {filteredStores.length} tienda{filteredStores.length !== 1 ? "s" : ""} encontrada{filteredStores.length !== 1 ? "s" : ""}.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredStores.map((store: any) => (
                        <Card key={store.id} className="overflow-hidden group border flex flex-col transition-all hover:shadow-lg">
                            <CardHeader className="p-0">
                                <Image
                                    src={store.imageUrl}
                                    alt={`Logo de ${store.name}`}
                                    width={600}
                                    height={400}
                                    className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={store.dataAiHint}
                                />
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <CardTitle className="text-xl font-semibold group-hover:text-primary mb-1">
                                    {store.name}
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                                    {store.description}
                                </CardDescription>
                                {store.categories && store.categories.length > 0 && (
                                    <div className="mt-3 text-xs text-muted-foreground">
                                        Categorías: {store.categories.join(", ")}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <div className="flex w-full gap-2">
                                    <Button asChild className="flex-1">
                                        <Link href={`/stores/${store.slug}`}>Visitar Tienda</Link>
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
