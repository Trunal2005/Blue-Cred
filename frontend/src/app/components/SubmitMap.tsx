"use client";
import { useEffect, useState, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { Map as MapIcon } from "lucide-react";
interface Props { latitude: number; longitude: number; onLocationSelect: (lat: number, lng: number) => void; }
export default function SubmitMap({ latitude, longitude, onLocationSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const latest = useRef({ latitude, longitude, onLocationSelect });
  latest.current = { latitude, longitude, onLocationSelect };
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const L = (await import("leaflet")).default;
      if (cancelled || !container.current) return;
      const { latitude: lat, longitude: lng } = latest.current;
      const hasLocation = (lat !== 0 || lng !== 0) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
      const instance = L.map(container.current).setView(hasLocation ? [lat, lng] : [20.5937, 78.9629], hasLocation ? 10 : 4);
      map.current = instance;
      const icon = L.divIcon({ className: "", html: '<div style="width:20px;height:20px;background:#1f7a4d;border:3px solid white;border-radius:50%;box-shadow:0 1px 5px #555"></div>', iconSize: [20, 20], iconAnchor: [10, 10] });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; OpenStreetMap contributors' }).addTo(instance);
      if (hasLocation) marker.current = L.marker([lat, lng], { icon }).addTo(instance);
      instance.on("click", e => {
        const lat = Number(e.latlng.lat.toFixed(6)), lng = Number(e.latlng.lng.toFixed(6));
        if (marker.current) marker.current.setLatLng([lat, lng]);
        else marker.current = L.marker([lat, lng], { icon }).addTo(instance);
        latest.current.onLocationSelect(lat, lng);
      });
      setLoaded(true);
    }
    init().catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; map.current?.remove(); map.current = null; marker.current = null; };
  }, []);
  useEffect(() => {
    if (!loaded || !map.current || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return;
    let cancelled = false;
    import("leaflet").then(({ default: L }) => {
      if (cancelled || !map.current) return;
      if (marker.current) marker.current.setLatLng([latitude, longitude]);
      else if (latitude !== 0 || longitude !== 0) {
        const icon = L.divIcon({ className: "", html: '<div style="width:20px;height:20px;background:#1f7a4d;border:3px solid white;border-radius:50%"></div>', iconSize: [20, 20] });
        marker.current = L.marker([latitude, longitude], { icon }).addTo(map.current);
      }
      if (latitude !== 0 || longitude !== 0) map.current.flyTo([latitude, longitude], 10, { duration: 1.2 });
    });
    return () => { cancelled = true; };
  }, [latitude, longitude, loaded]);
  return <div className="relative w-full rounded-2xl overflow-hidden border-2 border-mint" style={{ height: "400px" }}>
    <div ref={container} style={{ height: "100%", width: "100%", zIndex: 0 }} />
    {!loaded && <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center" role="status">
      <MapIcon className="h-12 w-12 text-forest mb-4" />
      <p className="font-bold text-dark">{failed ? "Map unavailable. Enter coordinates below." : "Loading Map..."}</p>
    </div>}
  </div>;
}
