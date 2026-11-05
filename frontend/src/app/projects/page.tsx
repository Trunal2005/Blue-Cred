"use client";

import { useEffect, useState } from "react";
import { TreePine, MapPin, Droplets, ChevronRight, Search, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { databases, storage, DATABASE_ID, PROJECTS_COLLECTION_ID, BUCKET_ID } from "@/lib/appwrite";

export default function ProjectRegistry() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          PROJECTS_COLLECTION_ID
        );
        setProjects(response.documents);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-forest animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-dark mb-4">Project Registry</h1>
          <p className="text-gray-500 text-lg">Explore verified and pending blue carbon projects globally.</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project name or location..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
            />
          </div>
          <div className="flex gap-4">
            <button className="flex items-center space-x-2 px-6 py-3 rounded-xl border border-gray-200 hover:bg-mint/30 transition-colors font-semibold text-gray-600">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
            <select className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-mint/30 transition-colors font-semibold text-gray-600 focus:outline-none">
              <option>All Ecosystems</option>
              <option>Mangrove</option>
              <option>Seagrass</option>
              <option>Salt Marsh</option>
            </select>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem]">
              <TreePine className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No projects registered yet.</h3>
            </div>
          ) : (
            projects.map((project, i) => (
              <motion.div
                key={project.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                <div className="relative h-56 overflow-hidden">
                  {project.imageFileIds?.length > 0 ? (
                    <img
                      src={storage.getFilePreview(BUCKET_ID, project.imageFileIds[0]).toString()}
                      alt={project.projectName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={
                        project.ecosystemType === "Seagrass" 
                        ? "https://images.unsplash.com/photo-1621451537084-482c330df70e?auto=format&fit=crop&w=800&q=80" 
                        : "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={project.ecosystemType}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                  )}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${
                      project.status === "verified" || project.status === "Verified" ? "bg-forest" : 
                      project.status === "minted" || project.status === "Minted" ? "bg-blue-600" :
                      "bg-amber-500"
                    }`}>
                      {project.status || "Pending"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/90 text-dark text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      {project.ecosystemType}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-dark mb-2 group-hover:text-forest transition-colors">{project.projectName}</h3>
                  <div className="flex items-center text-gray-400 text-sm mb-6">
                    <MapPin className="h-4 w-4 mr-1 text-forest" />
                    {project.locationName}
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Credits Issued</span>
                      <div className="flex items-center space-x-1 text-forest">
                        <Droplets className="h-4 w-4" />
                        <span className="text-lg font-bold">{(project.creditsIssued || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <Link
                      href={`/projects/${project.$id}`}
                      className="h-10 w-10 bg-mint text-forest rounded-full flex items-center justify-center hover:bg-forest hover:text-white transition-all shadow-sm"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
