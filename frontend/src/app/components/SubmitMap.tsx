"use client";

import { useEffect, useState, useRef } from "react";
import { Map as MapIcon } from "lucide-react";

interface SubmitMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function SubmitMap({ latitude, longitude, onLocationSelect }: SubmitMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize the map only on client side
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Dynamically import Leaflet
    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default marker icons
      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Prevent re-initialization
      if (mapRef.current && !mapInstance) {
        const hasLocation = latitude !== 0 || longitude !== 0;
        const center: [number, number] = hasLocation ? [latitude, longitude] : [20.5937, 78.9629];
        const zoom = hasLocation ? 10 : 4;

        const map = L.map(mapRef.current).setView(center, zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Add marker if we have a location
        let marker: any = null;
        if (hasLocation) {
          marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
          setMarkerInstance(marker);
        }

        // Handle map clicks
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          const roundedLat = parseFloat(lat.toFixed(6));
          const roundedLng = parseFloat(lng.toFixed(6));

          if (marker) {
            marker.setLatLng([roundedLat, roundedLng]);
          } else {
            marker = L.marker([roundedLat, roundedLng], { icon: customIcon }).addTo(map);
            setMarkerInstance(marker);
          }

          onLocationSelect(roundedLat, roundedLng);
        });

        setMapInstance(map);
        setIsLoaded(true);
      }
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update marker when lat/lng changes externally (e.g. from input fields)
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;
    if (typeof window === "undefined") return;

    const updateMarker = async () => {
      const L = (await import("leaflet")).default;
      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      if (latitude !== 0 || longitude !== 0) {
        if (markerInstance) {
          markerInstance.setLatLng([latitude, longitude]);
        } else {
          const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(mapInstance);
          setMarkerInstance(marker);
        }
        mapInstance.flyTo([latitude, longitude], 10, { duration: 1.2 });
      }
    };

    updateMarker();
  }, [latitude, longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-mint" style={{ height: "400px" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%", zIndex: 0 }} />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
          <MapIcon className="h-12 w-12 text-forest mb-4 animate-pulse" />
          <p className="font-bold text-dark">Loading Map...</p>
          <p className="text-sm text-gray-500">Click on the map to place your project location</p>
        </div>
      )}
    </div>
  );
}
