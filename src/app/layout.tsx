// src/app/layout.tsx
"use client"; // Make layout client component to manage state

import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as Geist is not standard
import "./globals.css";
import Link from "next/link";
import { ShoppingCart, PackagePlus, Search, Loader2, Clock } from "lucide-react"; // Added Loader2 and Clock
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { UserNav } from "@/components/layout/user-nav";
import { MobileNav } from "@/components/layout/MobileNav";
import { Input } from "@/components/ui/input";
import { CartProvider, useCart } from "@/context/CartContext"; // Import CartProvider and useCart
import { AuthProvider, useAuth } from "@/context/AuthContext"; // Import AuthProvider and useAuth
import { useState, type FormEvent } from "react"; // Import useState and FormEvent
import { useRouter } from "next/navigation"; // Import useRouter
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { FavoritesProvider } from "@/context/FavoritesContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { RatingsProvider } from "@/context/RatingsContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { UpdateNotification } from "@/components/pwa/UpdateNotification";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// CartDisplay component to access cart context
function CartDisplay() {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <Link href="/cart" aria-label="Carrito de Compras">
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
          >
            {itemCount > 9 ? "9+" : itemCount}
          </Badge>
        )}
        <span className="sr-only">
          Carrito de Compras ({itemCount} artículos)
        </span>
      </Button>
    </Link>
  );
}

// Main layout content component
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth(); // Use auth context
  const [headerSearchTerm, setHeaderSearchTerm] = useState(""); // State for header search input
  const router = useRouter();

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (headerSearchTerm.trim()) {
      router.push(
        `/products?search=${encodeURIComponent(headerSearchTerm.trim())}`,
      );
      // setHeaderSearchTerm(''); // Optional: clear input after search
    } else {
      router.push("/products"); // Go to products page if search is empty
    }
  };

  return (
    <>
      {/* Header mejorado */}
      <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
        <div className="container mx-auto flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TextiSur</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/products"
                className="transition-colors hover:text-primary text-foreground/80 px-3 py-2 rounded-md hover:bg-primary/5"
              >
                Productos
              </Link>
              <Link
                href="/#tiendas"
                className="transition-colors hover:text-primary text-foreground/80 px-3 py-2 rounded-md hover:bg-primary/5"
              >
                Tiendas
              </Link>
              {/* Mostrar Mis Pedidos solo si el usuario es comprador */}
              {user?.role === "comprador" && (
                <Link
                  href="/orders/history"
                  className="transition-colors hover:text-primary text-foreground/80 px-3 py-2 rounded-md hover:bg-primary/5 flex items-center"
                >
                  <Clock className="mr-1 h-4 w-4" /> Mis pedidos
                </Link>
              )}
              {/* Show Vender link only if user is logged in and is a seller */}
              {user?.role === "vendedor" && (
                <Link
                  href="/dashboard/vendedor"
                  className="transition-colors hover:text-primary text-foreground/80 px-3 py-2 rounded-md hover:bg-primary/5 flex items-center"
                >
                  <PackagePlus className="mr-1 h-4 w-4" /> Vender
                </Link>
              )}
              <Link
                href="/about"
                className="transition-colors hover:text-primary text-foreground/80 px-3 py-2 rounded-md hover:bg-primary/5"
              >
                Nosotros
              </Link>
            </nav>
          </div>

          <div className="hidden sm:flex flex-1 items-center justify-center px-8">
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full max-w-sm"
            >
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-10 pr-4" // Added pr-4 for spacing
                value={headerSearchTerm}
                onChange={(e) => setHeaderSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {/* Hidden submit button to allow Enter key submission */}
              <button type="submit" className="hidden" aria-hidden="true">
                Buscar
              </button>
            </form>
          </div>

          <div className="flex items-center justify-end space-x-2 ml-auto">
            {" "}
            {/* Reduced space */}
            <ModeToggle />
            <CartDisplay /> {/* Use the CartDisplay component */}
            {loading ? (
              // Skeleton/Loader while checking auth status
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-[80px]" />
              </div>
            ) : user ? (
              <UserNav user={user} onLogout={logout} />
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hover:text-primary hover:bg-primary/5">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 w-full flex flex-col pb-16 md:pb-0">
        {children}
      </main>
      <Toaster />
      <InstallPrompt />
      <UpdateNotification />
      <MobileNav />
      {/* Simplified Footer */}
      <footer className="w-full py-6 md:py-8 border-t bg-background hidden md:block">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-xs text-muted-foreground md:text-left">
            © {new Date().getFullYear()} TextiSur. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Privacidad
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Términos
            </Link>
            <Link
              href="/about"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Nosotros
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

// Renamed to MainLayout for clarity
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>TextiSur - Tu Mercado Textil Local</title>
        <meta
          name="description"
          content="Descubre, compra y vende prendas únicas de vendedores locales en TextiSur, el corazón de la industria textil."
        />
        <meta name="application-name" content="TextiSur" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TextiSur" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#6366f1" />

        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-72x72.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen w-full`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <NotificationsProvider>
                <RatingsProvider>
                  <FavoritesProvider>
                    <LayoutContent>{children}</LayoutContent>
                  </FavoritesProvider>
                </RatingsProvider>
              </NotificationsProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
