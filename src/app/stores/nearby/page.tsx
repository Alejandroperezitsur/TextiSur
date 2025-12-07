"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";

// Dynamic import for Leaflet (SSR issue)
const StoreMap = dynamic(() => import("@/components/stores/LeafletMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-muted">Cargando mapa...</div>
});

export default function NearbyStoresPage() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [manualCity, setManualCity] = useState("");

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocalización no soportada por tu navegador");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                fetchNearbyStores(latitude, longitude);
            },
            (err) => {
                setError("No pudimos obtener tu ubicación automáticamente.");
                setLoading(false);
            }
        );
    };

    const fetchNearbyStores = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`/api/stores/nearby?lat=${lat}&lng=${lng}`);
            if (res.ok) {
                const data = await res.json();
                setStores(data);
            }
        } catch (error) {
            console.error("Error fetching nearby stores", error);
        } finally {
            setLoading(false);
        }
    };

    // Fallback for manual search (mock implementation as API needs city filter or geocoding)
    const handleManualSearch = async () => {
        setLoading(true);
        // Ideally call geocoding API to get lat/lng from city name
        // For now just mockup a move to CDMX
        if (manualCity.toLowerCase().includes("mexico") || manualCity.toLowerCase().includes("cdmx")) {
            const cdmx = { lat: 19.4326, lng: -99.1332 };
            setLocation(cdmx);
            fetchNearbyStores(cdmx.lat, cdmx.lng);
        } else {
            // Just fetch generic stores without location sort
            try {
                // Fallback to basic list?
                setError("Búsqueda por ciudad aún no implementada (Geocoding API required). Intenta 'CDMX'.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container mx-auto p-6 flex flex-col h-[calc(100vh-100px)]">
            <h1 className="text-3xl font-bold mb-4 flex-shrink-0">Tiendas Cercanas</h1>

            {!location ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="p-6 bg-muted rounded-full">
                        <MapPin className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Encuentra proveedores cerca de ti</h2>
                    <p className="max-w-md text-muted-foreground">Permite el acceso a tu ubicación para ver tiendas y productos disponibles en tu zona.</p>

                    <Button onClick={handleGetLocation} disabled={loading} size="lg">
                        {loading ? "Localizando..." : "Usar mi ubicación actual"}
                    </Button>

                    <div className="flex items-center gap-2 w-full max-w-xs">
                        <div className="h-px bg-border flex-1"></div>
                        <span className="text-xs text-muted-foreground">O BUSCA MANUALMENTE</span>
                        <div className="h-px bg-border flex-1"></div>
                    </div>

                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Ciudad o Código Postal"
                            value={manualCity}
                            onChange={(e) => setManualCity(e.target.value)}
                        />
                        <Button type="button" variant="secondary" onClick={handleManualSearch}>
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>

                    {error && <p className="text-destructive font-medium">{error}</p>}
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                    {/* Map Section */}
                    <div className="lg:col-span-2 rounded-xl overflow-hidden border shadow-sm h-96 lg:h-full relative z-0">
                        <StoreMap stores={stores} userLocation={location} />
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4 h-full">
                        <h3 className="font-semibold sticky top-0 bg-background py-2 z-10">
                            {stores.length} tiendas encontradas
                        </h3>
                        {stores.length === 0 ? (
                            <p className="text-muted-foreground">No encontramos tiendas en este radio.</p>
                        ) : (
                            stores.map((store) => (
                                <Card key={store.id} className="cursor-pointer hover:border-primary transition-colors">
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg">{store.name}</h3>
                                                <p className="text-sm text-muted-foreground">{store.city}</p>
                                                <p className="text-xs mt-1 text-primary font-medium">{store.distance?.toFixed(1)} km</p>
                                            </div>
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={`/stores/${store.slug}`}>Ver</a>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                        <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setLocation(null)}>
                            Cambiar ubicación capture
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
