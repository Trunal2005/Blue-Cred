"use client";

import { useEffect, useState } from "react";
import { useGlobalState } from "@/context/GlobalState";
import { 
  Plus, 
  MapPin, 
  Droplets, 
  TreePine, 
  Settings, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { databases, storage, DATABASE_ID, PROJECTS_COLLECTION_ID, BUCKET_ID } from "@/lib/appwrite";
import { Query } from "appwrite";

export default function MyProjects() {
  const { user, userRole } = useGlobalState();
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!user) return;
      
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          PROJECTS_COLLECTION_ID,
          [Query.equal("submittedByUserId", user.id)]
        );
        setMyProjects(response.documents);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, [user]);

  if (userRole !== "NGO") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2">Access Denied</h2>
          <p className="text-gray-500">Only registered NGOs and Project Developers can view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-forest animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-dark mb-4">My Projects</h1>
            <p className="text-gray-500 text-lg">Track the verification and minting status of your submitted projects.</p>
          </div>
          <Link 
            href="/submit"
            className="px-6 py-3 bg-forest text-white rounded-xl font-bold hover:bg-forest/90 transition-all shadow-md flex items-center space-x-2 shrink-0"
          >
            <Plus className="h-5 w-5" />
            <span>Submit New Project</span>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 bg-mint rounded-2xl flex items-center justify-center">
              <TreePine className="h-6 w-6 text-forest" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Projects</p>
              <p className="text-2xl font-bold text-dark">{myProjects.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Awaiting Approval</p>
              <p className="text-2xl font-bold text-dark">
                {myProjects.filter(p => p.status === "pending").length}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 bg-forest/10 rounded-2xl flex items-center justify-center">
              <Droplets className="h-6 w-6 text-forest" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Credits Minted</p>
              <p className="text-2xl font-bold text-dark">
                {myProjects.reduce((acc, curr) => acc + (curr.creditsIssued || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Project List */}
        <div className="space-y-6">
          {myProjects.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 text-center">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <TreePine className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">No Projects Found</h3>
              <p className="text-gray-500 mb-6">You haven't submitted any ecosystem restoration projects yet.</p>
              <Link href="/submit" className="inline-flex px-6 py-3 bg-mint text-forest font-bold rounded-xl hover:bg-forest hover:text-white transition-colors">
                Start a Proposal
              </Link>
            </div>
          ) : (
            myProjects.map((project, i) => (
              <motion.div
                key={project.$id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-shadow"
              >
                <div className="h-32 w-full md:w-48 rounded-2xl overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                  {project.imageFileIds && project.imageFileIds.length > 0 ? (
                    <img 
                      src={storage.getFilePreview(BUCKET_ID, project.imageFileIds[0]).toString()} 
                      alt={project.projectName} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <TreePine className="h-10 w-10 text-gray-200" />
                  )}
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-dark">{project.projectName}</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      project.status === "approved" ? "bg-forest/10 text-forest" : 
                      project.status === "minted" ? "bg-blue-50 text-blue-600" :
                      project.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {project.locationName}
                    </div>
                    <div className="flex items-center">
                      <TreePine className="h-4 w-4 mr-1 text-gray-400" />
                      {project.ecosystemType}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-gray-50 flex items-center justify-center rounded-lg">
                        <Droplets className="h-4 w-4 text-forest" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Carbon Credits</p>
                        <p className="text-sm font-bold text-dark">{(project.creditsIssued || 0).toLocaleString()} BCT</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-gray-50 flex items-center justify-center rounded-lg">
                        <Loader2 className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Estimated Biomass</p>
                        <p className="text-sm font-bold text-dark">{(project.estimatedCO2 || 0).toLocaleString()} Tons</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col w-full md:w-auto gap-3 shrink-0 self-stretch justify-center border-t md:border-t-0 md:border-l border-gray-50 pt-4 md:pt-0 md:pl-6">
                  <Link 
                    href={`/projects/${project.$id}`}
                    className="flex-1 flex items-center justify-center py-3 px-6 bg-gray-50 text-sm font-bold text-gray-600 rounded-xl hover:bg-forest hover:text-white transition-colors"
                  >
                    View details
                  </Link>
                  <button className="flex-1 flex items-center justify-center py-3 px-6 bg-mint text-sm font-bold text-forest rounded-xl hover:shadow-md transition-shadow">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
