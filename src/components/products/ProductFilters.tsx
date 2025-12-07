"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
    onFilterChange: (filters: any) => void;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
    const [filters, setFilters] = useState({
        category: "all",
        minPrice: "",
        maxPrice: "",
        sort: "newest"
    });

    const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters); // Debounce could be added here
    };

    return (
        <div className="space-y-6">
            <div>
                <Label>Ordenar por</Label>
                <Select onValueChange={(val) => handleChange("sort", val)} defaultValue="newest">
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar orden" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Más recientes</SelectItem>
                        <SelectItem value="popular">Populares</SelectItem>
                        <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
                        <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Categoría</Label>
                <Select onValueChange={(val) => handleChange("category", val === "all" ? "" : val)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="Telas">Telas</SelectItem>
                        <SelectItem value="Hilos">Hilos</SelectItem>
                        <SelectItem value="Maquinaria">Maquinaria</SelectItem>
                        <SelectItem value="Confección">Confección</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label>Min Precio</Label>
                    <Input
                        type="number"
                        placeholder="0"
                        onChange={(e) => handleChange("minPrice", e.target.value)}
                    />
                </div>
                <div>
                    <Label>Max Precio</Label>
                    <Input
                        type="number"
                        placeholder="MAX"
                        onChange={(e) => handleChange("maxPrice", e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
