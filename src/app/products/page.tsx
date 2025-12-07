"use client";

import { useState } from "react";
import { InfiniteProductList } from "@/components/products/InfiniteProductList";
import { ProductFilters } from "@/components/products/ProductFilters";
import { MobileNav } from "@/components/layout/MobileNav";

export default function ProductsPage() {
  const [filters, setFilters] = useState({});

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Catálogo de Productos</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-20 bg-background border p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-4">Filtros</h2>
            <ProductFilters onFilterChange={setFilters} />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1">
          <InfiniteProductList initialFilters={filters} />
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
