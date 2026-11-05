"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Droplets, 
  ShieldCheck,
  Eye,
  Search,
  Check,
  X,
  AlertCircle,
  Loader2,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useGlobalState } from "@/context/GlobalState";
import { databases, storage, DATABASE_ID, PROJECTS_COLLECTION_ID, BUCKET_ID } from "@/lib/appwrite";

export default function AdminPanel() {
  const { user } = useGlobalState();
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAdminAuthenticated(true);
    } else {
      alert("Invalid Admin Password");
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await databases.listDocuments(DATABASE_ID, PROJECTS_COLLECTION_ID);
      setAllProjects(response.documents);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAction = async (id: string, status: string, msg: string) => {
    setIsProcessing(true);
    try {
      const updateData: any = { status };
      if (status === "approved") {
        // Find the project to get estimatedCO2
        const proj = allProjects.find(p => p.$id === id);
        updateData.creditsIssued = proj?.estimatedCO2 || 1000;
      }

      await databases.updateDocument(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        id,
        updateData
      );

      setSuccessMsg(msg);
      setSelectedProject(null);
      await fetchProjects(); // Refresh list
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error: any) {
      console.error("Action failed:", error);
      console.dir(error);
      alert(`Failed to update project status: ${error.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-forest animate-spin" />
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100"
        >
          <div className="h-20 w-20 bg-dark rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-dark/20 text-white">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-bold text-dark mb-2">Admin Access</h1>
          <p className="text-gray-500 mb-8">Enter registry access key to continue.</p>
          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Access Key"
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-forest/20 outline-none font-bold"
              />
            </div>
            <button type="submit" className="w-full py-4 bg-forest text-white rounded-full font-bold hover:shadow-lg transition-all">
              Verify Access Key
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-dark mb-2">Admin Panel</h1>
            <p className="text-gray-500">Global registry administration and project verification control.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="h-10 w-10 bg-dark rounded-xl flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Admin Profile</p>
                <p className="text-sm font-bold text-dark">{user?.name || "Registry Super-Admin"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Notification */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-forest text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project List */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Project Name</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Ecosystem</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allProjects.map((project) => (
                <tr key={project.$id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                        {project.imageFileIds?.[0] ? (
                            <img 
                                src={storage.getFilePreview(BUCKET_ID, project.imageFileIds[0]).toString()} 
                                alt="" 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <ShieldCheck className="h-6 w-6 text-gray-200" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-dark">{project.projectName}</p>
                        <p className="text-xs text-gray-400 font-medium">{project.locationName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm text-gray-600 font-semibold bg-gray-100 px-3 py-1 rounded-lg">{project.ecosystemType}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      project.status === "approved" || project.status === "minted" ? "bg-forest/10 text-forest" : 
                      project.status === "pending" ? "bg-amber-100 text-amber-600" : 
                      project.status === "rejected" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => setSelectedProject(project)}
                        className="p-3 bg-gray-50 text-gray-400 hover:text-dark rounded-xl transition-all"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {project.status === "pending" && (
                        <>
                          <button 
                            onClick={() => handleAction(project.$id, "approved", "Project Approved for Marketplace")}
                            className="px-5 py-2.5 bg-forest text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(project.$id, "rejected", "Project Rejected")}
                            className="px-5 py-2.5 bg-white border border-red-200 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(project.status === "approved" || project.status === "minted") && (
                        <button 
                          className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl opacity-50 cursor-not-allowed"
                          disabled
                        >
                          Active
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Detail Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[3rem] p-12 max-w-2xl w-full relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="mb-10 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-dark mb-2">Project Review</h2>
                  <p className="text-gray-500">Status: <span className="font-bold text-amber-600 capitalize">{selectedProject.status}</span></p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-dark">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Location & Coordinates</p>
                  <p className="font-bold text-dark">{selectedProject.locationName}</p>
                  <div className="flex space-x-4 mt-2">
                    <p className="text-xs text-forest font-mono">Lat: {selectedProject.latitude || 0}</p>
                    <p className="text-xs text-forest font-mono">Long: {selectedProject.longitude || 0}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{selectedProject.ecosystemType}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Biomass Estimate</p>
                  <p className="font-bold text-dark">{selectedProject.estimatedCO2?.toLocaleString()} Tons</p>
                  <p className="text-xs text-gray-500">Area: {selectedProject.areaSize} Hectares</p>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <h3 className="font-bold text-dark">Administrative Actions</h3>
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <div className="flex items-center space-x-3 mb-4 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-bold">Verification Checklist</p>
                  </div>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded border border-forest bg-forest/20 flex items-center justify-center text-forest text-[10px]">✓</div>
                      <span>Appwrite Evidence Handlers Validated</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded border border-gray-300" />
                      <span>Satellite Image Analysis ({selectedProject.imageFileIds?.length || 0} files)</span>
                    </li>
                  </ul>
                </div>
              </div>

              {selectedProject.status === "pending" && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleAction(selectedProject.$id, "approved", "Project Approved")}
                    className="flex-1 py-4 bg-forest text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Finalize Approval</span>
                  </button>
                  <button 
                    onClick={() => handleAction(selectedProject.$id, "rejected", "Project Rejected")}
                    className="flex-1 py-4 bg-red-50 text-red-500 border border-red-100 rounded-2xl font-bold hover:bg-red-100 transition-all"
                  >
                    Reject Project
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <div className="fixed inset-0 z-[100] bg-dark/20 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-forest animate-spin mb-4" />
              <p className="font-bold text-dark">Updating Registry...</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
