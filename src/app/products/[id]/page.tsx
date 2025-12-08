// src/app/products/[id]/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Removed unused imports
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag,
  Star,
  CheckCircle,
  Truck,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react"; // Added ArrowLeft
import Image from "next/image";

import { notFound, useRouter } from "next/navigation"; // Added useRouter
import { useState, useEffect } from "react"; // Added useEffect
import { use } from "react"; // Added for params unwrapping
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/context/CartContext"; // Import useCart
import { useAuth } from "@/context/AuthContext";
import type { CartItem } from "@/types/cart"; // Import CartItem type
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useRatings } from "@/context/RatingsContext";
import type { FavoriteItem } from "@/context/FavoritesContext";

import { Textarea } from "@/components/ui/textarea";

type UiProduct = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  category?: string;
  sizes: string[];
  stock?: number;
  material?: string;
  care?: string;
  hint?: string;
  storeId?: string;
  rating?: number;
  reviews?: number;
  hasDelivery?: boolean;
};
// removed local mock products

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { toast } = useToast();
  const { addToCart } = useCart(); // Get addToCart from context
  const router = useRouter(); // Use router for back navigation
  const { user } = useAuth(); // Move useAuth to top of component
  const resolvedParams = use(params);
  const pid = Number(resolvedParams.id);
  const [product, setProduct] = useState<UiProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined,
  );
  const [quantity, setQuantity] = useState(1);
  const { addOrUpdateRating, getRatings, getAverage, canCurrentUserRate } = useRatings();
  const [ratingsTick, setRatingsTick] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>("");

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    let canceled = false;
    const toUiProduct = (p: Record<string, unknown>): UiProduct => ({
      id: Number(p.id as number | string),
      name: String(p.name ?? "Producto"),
      price: Number(p.price as number | string),
      imageUrl: (p.imageUrl as string) || undefined,
      description: (p.description as string) || undefined,
      category: (p.category as string) || undefined,
      sizes:
        typeof p.sizes === "string"
          ? (JSON.parse(p.sizes as string) as string[])
          : Array.isArray(p.sizes)
            ? (p.sizes as string[])
            : [],
      stock: typeof p.stock === "number" ? (p.stock as number) : undefined,
      material: (p.material as string) || undefined,
      care: (p.care as string) || undefined,
      hint: (p.hint as string) || undefined,
      storeId: typeof p.storeId === "number" || typeof p.storeId === "string" ? String(p.storeId) : undefined,
      rating: typeof p.rating === "number" ? (p.rating as number) : 4.5,
      reviews: typeof p.reviews === "number" ? (p.reviews as number) : undefined,
      hasDelivery: typeof p.hasDelivery === "boolean" ? (p.hasDelivery as boolean) : true,
    });

    const fetchProduct = async () => {
      try {
        const resp = await fetch(`/api/products/${pid}`);
        if (resp.ok) {
          const data = await resp.json();
          const ui = toUiProduct(data.product as Record<string, unknown>);
          if (!canceled) {
            setProduct(ui);
            setLoading(false);
          }
        } else if (resp.status === 404) {
          if (!canceled) {
            setProduct(null);
            setLoading(false);
          }
        } else {
          if (!canceled) {
            setProduct(null);
            setLoading(false);
          }
        }
      } catch {
        if (!canceled) {
          setProduct(null);
          setLoading(false);
        }
      }
    };

    fetchProduct();

    const es = new EventSource(`/api/products/stream`);
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data) as { type?: string; product?: Record<string, unknown>; id?: number };
        if (payload?.type === "update" && payload.product && Number(payload.product.id as number | string) === pid) {
          const ui = toUiProduct(payload.product);
          setProduct(ui);
        } else if (payload?.type === "delete" && Number(payload.id) === pid) {
          toast({ title: "Producto eliminado", description: "Este producto fue eliminado." });
          router.replace(`/products`);
        }
      } catch { }
    };

    return () => {
      canceled = true;
      es.close();
    };
  }, [pid]);

  if (!loading && !product) {
    notFound();
  }

  if (!product) {
    return (
      <div className="container mx-auto flex-1 py-12 px-4 md:px-6">
        <div className="h-96 rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product && product.sizes.length > 0 && !selectedSize) {
      toast({
        variant: "destructive",
        title: "Seleccionar Talla",
        description:
          "Por favor, selecciona una talla antes de añadir al carrito.",
      });
      return;
    }

    if (!product) return;
    const itemToAdd: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || `https://picsum.photos/seed/product-${pid}/600/600`,
      quantity: quantity,
      size: selectedSize || "N/A",
      storeId: product.storeId !== undefined ? String(product.storeId) : undefined,
    };

    addToCart(itemToAdd); // Add to global cart state

    toast({
      title: "Añadido al Carrito",
      description: `${quantity} x ${product.name} ${selectedSize ? `(Talla: ${selectedSize})` : ""} añadido exitosamente.`,
      action: <CheckCircle className="text-green-500 h-5 w-5" />,
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleGoBack = () => {
    router.back(); // Navigate to the previous page
  };

  const stock = product.stock ?? 0;

  const handleContactSeller = async () => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para contactar al vendedor." });
      router.push("/auth/login");
      return;
    }

    // Optimistic redirect or API call
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          storeId: product.storeId,
          productId: product.id,
          initialMessage: `Hola, estoy interesado en el producto "${product.name}".`,
        }),
      });

      if (res.ok) {
        router.push("/messages");
        toast({ title: "Conversación iniciada", description: "Redirigiendo a tus mensajes..." });
      } else {
        router.push("/messages"); // Maybe it already exists
      }
    } catch (e) {
      console.error(e);
      router.push("/messages");
    }
  };

  return (
    <div className="container mx-auto flex-1 py-12 px-4 md:px-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={handleGoBack}
        className="mb-6 group text-muted-foreground hover:text-foreground pl-0"
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
        Volver
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div>
          <Card className="overflow-hidden border sticky top-20 relative">
            {/* Favorites overlay near image */}
            <div className="absolute top-2 left-2 z-10">
              <FavoriteButton
                item={{
                  id: String(product.id),
                  name: product.name,
                  imageUrl: product.imageUrl || `https://picsum.photos/seed/product-${product.id}/600/600`,
                  price: product.price,
                  category: product.category,
                } as FavoriteItem}
              />
            </div>
            <Image
              src={product.imageUrl || `https://picsum.photos/seed/product-${product.id}/600/600`}
              alt={`Imagen de ${product.name}`}
              width={600}
              height={800}
              className="object-cover w-full aspect-[3/4]"
              priority // Prioritize loading the main product image
              data-ai-hint={product.hint}
            />
          </Card>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              {product.name}
            </h1>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor((getAverage(String(product.id)) ?? product.rating ?? 0)) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({getRatings(String(product.id)).length || (product.reviews ?? 0)} reseñas)
                </span>
              </div>
              <p className="text-3xl font-semibold text-primary">
                ${product.price.toFixed(2)} MXN
              </p>
            </div>
            <div className="flex items-center mb-4 space-x-2">
              <span className="text-sm font-medium text-muted-foreground">
                Stock disponible:
              </span>
              <span className={`text-sm font-semibold ${stock > 10 ? 'text-green-600' : stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {stock > 0 ? `${stock} unidades` : 'Agotado'}
              </span>
            </div>
            <Card className="bg-secondary/50 border-none shadow-none">
              <CardContent className="p-4 text-foreground/80">
                <p>{product.description}</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <Label className="text-base font-medium mb-3 block">
                Seleccionar Talla:
              </Label>
              <RadioGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                className="flex flex-wrap gap-3"
              >
                {product.sizes.map((size) => (
                  <Label
                    key={size}
                    htmlFor={`size-${size}`}
                    className={`border rounded-md px-4 py-2 cursor-pointer transition-colors text-sm ${selectedSize === size ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent/50 hover:border-foreground/30"}`}
                  >
                    <RadioGroupItem
                      value={size}
                      id={`size-${size}`}
                      className="sr-only"
                    />
                    {size}
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="flex items-center space-x-4 mb-6">
            <Label className="text-base font-medium">Cantidad:</Label>
            <div className="flex items-center space-x-2 border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-r-none"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                aria-label="Disminuir cantidad"
              >
                -
              </Button>
              <span className="w-10 text-center font-medium text-lg">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-l-none"
                onClick={() => handleQuantityChange(1)}
                aria-label="Aumentar cantidad"
              >
                +
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full btn-accent text-lg py-6"
            onClick={handleAddToCart}
            disabled={product.sizes.length > 0 && !selectedSize}
          >
            <ShoppingBag className="mr-2 h-5 w-5" /> Añadir al Carrito
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full mt-3"
            onClick={handleContactSeller}
          >
            Contactar al Vendedor
          </Button>

          <div className="space-y-3 text-sm text-muted-foreground border-t pt-6 mt-6">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <span>
                Envío estándar gratuito en pedidos superiores a $50 MXN.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Compra segura garantizada. Devoluciones fáciles.</span>
            </div>
          </div>

          {/* Accordion for More Details */}
          <Accordion type="single" collapsible className="w-full border-t pt-2">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base">
                Detalles del Producto
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>Material:</strong> {product.material || "N/A"}
                </p>
                <p>
                  <strong>Categoría:</strong> {product.category}
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-base">Cuidado</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {product.care || "Consultar etiqueta."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div >
      </div >

      {/* Reviews Section Placeholder */}
      < div className="mt-16 lg:mt-20" >
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">
          Reseñas de Clientes
        </h2>
        <Card className="border shadow-none">
          <CardContent className="p-6">
            {canCurrentUserRate(String(product.id)) ? (
              <div className="space-y-4">
                <p className="font-medium">Tu calificación</p>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRatingsTick(i + 1)}
                      aria-label={`Calificar ${i + 1} estrellas`}
                    >
                      <Star className={`h-6 w-6 ${ratingsTick > i ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Escribe un comentario (opcional)"
                  className="mt-2"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                />
                <Button
                  onClick={() => {
                    const stars = Math.max(1, Math.min(5, ratingsTick));
                    const comment = ratingComment.trim() ? ratingComment.trim() : undefined;
                    const res = addOrUpdateRating(String(product.id), stars, comment, {
                      storeId: (product as { storeId?: string }).storeId,
                      productName: product.name,
                      productLink: `/products/${product.id}`,
                    });
                    if (res.success) {
                      setRatingsTick((t) => t + 0); // trigger rerender
                      toast({ title: "Gracias por tu calificación", description: `Registrada con ${stars} estrellas.` });
                    } else if (res.reason === "not-eligible") {
                      toast({ variant: "destructive", title: "No elegible", description: "Debes haber comprado este producto para calificar." });
                    } else if (res.reason === "no-auth") {
                      toast({ variant: "destructive", title: "Inicia sesión", description: "Necesitas iniciar sesión para calificar." });
                    } else {
                      toast({ variant: "destructive", title: "Error", description: "No se pudo registrar tu calificación." });
                    }
                  }}
                >
                  Enviar calificación
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Debes haber comprado este producto para poder calificarlo.</p>
            )}

            <Separator />

            {getRatings(String(product.id)).length > 0 ? (
              <div className="space-y-4">
                {getRatings(String(product.id)).slice(0, 5).map((r, idx) => (
                  <div key={idx} className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.stars ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                        ))}
                        <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground">{r.userEmail}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Todavía no hay reseñas para este producto. ¡Sé el primero!</p>
            )}
          </CardContent>
        </Card>
      </div >
    </div >
  );
}
