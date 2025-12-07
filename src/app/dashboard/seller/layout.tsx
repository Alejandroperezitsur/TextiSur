"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingCart, Settings, MessageSquare } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        {
            title: "Resumen",
            href: "/dashboard/seller",
            icon: LayoutDashboard,
        },
        {
            title: "Mis Productos",
            href: "/dashboard/seller/products",
            icon: Package,
        },
        {
            title: "Pedidos",
            href: "/dashboard/seller/orders",
            icon: ShoppingCart,
        },
        {
            title: "Mensajes",
            href: "/messages",
            icon: MessageSquare,
        },
        {
            title: "Configuración",
            href: "/dashboard/seller/settings",
            icon: Settings,
        },
    ];

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="hidden w-64 border-r bg-muted/40 md:block">
                <div className="flex h-full flex-col gap-2 p-4">
                    <div className="mb-4 px-2 py-1">
                        <h2 className="text-lg font-semibold tracking-tight">Panel Vendedor</h2>
                    </div>
                    <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                        {navItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary hover:bg-muted",
                                    pathname === item.href
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
