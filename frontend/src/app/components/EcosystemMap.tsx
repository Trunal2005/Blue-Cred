// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useGlobalState } from "@/context/GlobalState";
import Link from "next/link";
import { MapPin, Droplets, ShieldCheck, TreePine, Loader2 } from "lucide-react";
import { databases, storage, DATABASE_ID, PROJECTS_COLLECTION_ID, BUCKET_ID } from "@/lib/appwrite";

// Fix for default marker icons in Leaflet with Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Reuse the parent dashboard snapshot; avoid a second Appwrite request.
export default function EcosystemMap({ projects = [] }: { projects?: any[] }) {
  const allProjects = projects;
  const loading = false;

  if (loading) {
    return (
      <div className="h-[600px] w-full bg-gray-50 flex items-center justify-center rounded-[2.5rem]">
        <Loader2 className="h-10 w-10 text-forest animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={3} 
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {allProjects.map((project) => {
          const lat = project.latitude, lng = project.longitude;
          if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
          const position: [number, number] = [lat, lng];

          return (
            <Marker 
              key={project.$id} 
              position={position as [number, number]}
              icon={customIcon}
            >
            <Popup className="custom-popup">
              <div className="w-64 -m-1">
                <div className="h-32 w-full overflow-hidden rounded-t-xl bg-gray-100 relative items-center justify-center flex">
                  {project.imageFileIds?.[0] ? (
                    <img 
                      src={storage.getFilePreview(BUCKET_ID, project.imageFileIds[0]).toString()}
                      alt={project.projectName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <TreePine className="h-10 w-10 text-gray-200" />
                  )}
                  <div className="absolute top-2 left-2 flex space-x-1">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-white ${
                      project.status === "approved" || project.status === "minted" ? "bg-forest" : 
                      project.status === "pending" ? "bg-amber-500" : "bg-red-500"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-dark text-sm leading-tight mb-2">{project.projectName}</h4>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1 text-forest" />
                      <span className="truncate">{project.locationName}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <TreePine className="h-3 w-3 mr-1 text-forest" />
                      {project.ecosystemType}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Droplets className="h-3 w-3 mr-1 text-forest" />
                      {(project.creditsIssued || 0).toLocaleString()} Credits Issued
                    </div>
                  </div>

                  <Link 
                    href={`/projects/${project.$id}`}
                    className="block w-full text-center py-2 bg-mint text-forest font-bold text-xs rounded-lg hover:bg-forest hover:text-white transition-colors"
                  >
                    View Project Details
                  </Link>
                </div>
              </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
