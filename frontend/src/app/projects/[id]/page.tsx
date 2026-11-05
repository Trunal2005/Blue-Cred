"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Droplets, 
  TreePine, 
  User, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { databases, storage, DATABASE_ID, PROJECTS_COLLECTION_ID, BUCKET_ID } from "@/lib/appwrite";

export default function ProjectDetail() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.id) return;
      try {
        const data = await databases.getDocument(DATABASE_ID, PROJECTS_COLLECTION_ID, params.id as string);
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-forest animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div>
          <TreePine className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2">Project Not Found</h2>
          <Link href="/projects" className="text-forest hover:underline font-bold">Back to Registry</Link>
        </div>
      </div>
    );
  }

  const mainImage = project.imageFileIds?.[0] 
    ? storage.getFilePreview(BUCKET_ID, project.imageFileIds[0]).toString()
    : "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="bg-white min-h-screen pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/projects" className="inline-flex items-center space-x-2 text-gray-500 hover:text-forest font-semibold mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Registry</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="rounded-3xl overflow-hidden mb-8 h-[400px] relative">
              <img src={mainImage} alt={project.projectName} className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 flex space-x-3">
                <span className="px-4 py-2 bg-white/95 rounded-xl text-forest font-bold shadow-lg backdrop-blur-sm flex items-center space-x-2 border border-mint/20">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="capitalize">{project.status}</span>
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-dark mb-4">{project.projectName}</h1>
            <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center text-gray-500">
                <MapPin className="h-5 w-5 mr-2 text-forest" />
                {project.locationName}
              </div>
              <div className="flex items-center text-gray-500">
                <TreePine className="h-5 w-5 mr-2 text-forest" />
                {project.ecosystemType}
              </div>
              <div className="flex items-center text-gray-500 text-sm font-mono">
                <User className="h-5 w-5 mr-2 text-forest" />
                ID: {project.$id.substring(0, 8)}...
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-dark mb-6">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {project.description || "No description provided for this ecosystem restoration project."}
              </p>
            </div>

            {/* Evidence Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-dark mb-6">Environmental Evidence</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {project.imageFileIds?.map((fileId: string) => (
                  <div key={fileId} className="aspect-square rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
                    <img
                      src={storage.getFilePreview(BUCKET_ID, fileId).toString()}
                      alt="Project Evidence"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                    />
                  </div>
                ))}
              </div>
              {project.ipfsHash && (
                <div className="p-6 rounded-2xl bg-mint/30 border border-mint flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-dark mb-1">IPFS Evidence Bundle</h4>
                    <p className="text-sm font-mono text-gray-500 truncate max-w-xs">{project.ipfsHash}</p>
                  </div>
                  <a href={`https://ipfs.io/ipfs/${project.ipfsHash}`} target="_blank" className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg text-forest text-sm font-bold shadow-sm hover:shadow-md transition-all">
                    <span>Explore IPFS</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h2 className="text-2xl font-bold text-dark mb-6">Verification Progress</h2>
              <div className="space-y-6">
                {[
                  { title: "Project Submitted", status: "completed", desc: "Project registration submitted to the BlueCred registry." },
                  { title: "Verification Process", status: project.status !== "pending" && project.status !== "rejected" ? "completed" : "pending", desc: "Satellite data and ground evidence validation in progress." },
                  { title: "Final Approval", status: project.status === "approved" || project.status === "minted" ? "completed" : "pending", desc: "Registry administrator final verification of restoration impact." },
                  { title: "Credit Issuance", status: project.status === "minted" ? "completed" : "pending", desc: "Carbon matching credits issued as digital assets." }
                ].map((item, i) => (
                  <div key={i} className="flex space-x-4 relative">
                    {i !== 3 && <div className="absolute left-3 top-8 bottom-0 w-px bg-gray-100" />}
                    <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      item.status === "completed" ? "bg-forest" : "bg-gray-100"
                    }`}>
                      {item.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-white" /> : <Clock className="h-3 w-3 text-gray-400" />}
                    </div>
                    <div>
                      <h4 className={`font-bold ${item.status === "completed" ? "text-dark" : "text-gray-400"}`}>{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 rounded-[2rem] bg-forest text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Impact Summary</span>
                <div className="mt-6 space-y-6">
                  <div>
                    <span className="text-sm opacity-70 block mb-1">Carbon Credits Issued</span>
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-6 w-6" />
                      <span className="text-3xl font-bold">{(project.creditsIssued || 0).toLocaleString()} <span className="text-lg opacity-50">BCT</span></span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm opacity-70 block mb-1">Total Restoration Area</span>
                    <span className="text-2xl font-bold">{project.areaSize} Hectares</span>
                  </div>
                  <div>
                    <span className="text-sm opacity-70 block mb-1">Estimated Biomass</span>
                    <span className="text-2xl font-bold">{(project.estimatedCO2 || 0).toLocaleString()} <span className="text-lg opacity-50">Tons</span></span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full filter blur-3xl -mr-16 -mt-16" />
            </div>

            <div className="p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm">
              <h3 className="font-bold text-dark mb-4">Coordinates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Latitude</p>
                  <p className="text-sm font-mono text-dark">{project.latitude || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Longitude</p>
                  <p className="text-sm font-mono text-dark">{project.longitude || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
