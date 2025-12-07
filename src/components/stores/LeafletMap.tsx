"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: "/images/marker-icon.png", // Ensure these exist or use CDN
    iconRetinaUrl: "/images/marker-icon-2x.png",
    shadowUrl: "/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Component to recenter map
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 13);
    }, [center, map]);
    return null;
}

interface StoreMapProps {
    stores: any[];
    userLocation?: { lat: number; lng: number } | null;
}

export default function StoreMap({ stores, userLocation }: StoreMapProps) {
    const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [19.4326, -99.1332]; // Default to CDMX

    return (
        <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater center={center} />

            {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={icon}>
                    <Popup>Tu ubicación</Popup>
                </Marker>
            )}

            {stores.map(store => (
                <Marker key={store.id} position={[store.latitude, store.longitude]} icon={icon}>
                    <Popup>
                        <b>{store.name}</b><br />
                        {store.address}<br />
                        <a href={`/stores/${store.id}`}>Ver tienda</a>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
