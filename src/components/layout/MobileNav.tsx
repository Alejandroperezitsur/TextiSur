"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Store, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
    const pathname = usePathname() || "";

    // Hide on auth pages or if desired (e.g., specific standalone flows)
    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
        return null;
    }

    const navItems = [
        { href: "/", label: "Inicio", icon: Home },
        { href: "/products", label: "Productos", icon: ShoppingBag },
        { href: "/#tiendas", label: "Tiendas", icon: Store }, // Using anchor for now as per layout
        { href: "/messages", label: "Mensajes", icon: MessageCircle },
        // Use /profile or /dashboard based on role? Or generic profile check? 
        // Layout uses UserNav, let's point to /profile or /login if not auth? 
        // User requested "Mi Perfil". Let's assume /dashboard/comprador or /profile
        // For now, let's check auth status or link to a profile route that redirects.
        // Let's use /dashboard/comprador as default for now or logic to determine.
        // Actually, let's stick to /profile if it exists, otherwise /login.
        // Wait, layout has "UserNav". Let's use /profile and handle redirect there if needed.
        { href: "/profile", label: "Mi Perfil", icon: User },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t h-16 flex items-center justify-around px-2 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] safe-area-pb">
            {navItems.map((item) => {
                const Icon = item.icon;
                // Simple active check: exact match or starts with for sub-routes (except root)
                const isActive = item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className={cn("h-5 w-5 transition-all", isActive && "scale-110")} />
                        <span className="text-[10px] font-medium leading-none">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
