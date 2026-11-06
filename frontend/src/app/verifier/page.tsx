"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Droplets, 
  ExternalLink,
  ShieldCheck,
  Eye,
  Search,
  Check,
  X,
  Plus,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBlueCredContract } from "@/lib/useBlueCredContract";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  databases, 
  DATABASE_ID, 
  PROJECTS_COLLECTION_ID 
} from "@/lib/appwrite";
import { Query } from "appwrite";
import { useGlobalState } from "@/context/GlobalState";

interface ProjectDoc {
  $id: string;
  projectName: string;
  locationName: string;
  ecosystemType: string;
  areaSize: number;
  estimatedCO2: number;
  creditsIssued: number;
  status: string;
  submittedByUserId: string;
  imageFileIds?: string[];
  createdAt: string;
  description?: string;
  onChainProjectId?: number;
}

export default function VerifierDashboard() {
  const { user } = useGlobalState();
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectDoc | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintTxHash, setMintTxHash] = useState("");
  const [mintAmount, setMintAmount] = useState(100);

  const { mintCreditsOnChain, isConnected, isWritePending, address } = useBlueCredContract();

  // Fetch projects from Appwrite
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.isAdmin) { setLoading(false); return; }
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          PROJECTS_COLLECTION_ID
        );
        setProjects(response.documents as unknown as ProjectDoc[]);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user?.isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    if (!user?.isAdmin) return;
    try {
      await databases.updateDocument(DATABASE_ID, PROJECTS_COLLECTION_ID, id, { status });
      setProjects(projects.map(p => p.$id === id ? { ...p, status } : p));
    } catch (error) {
      console.error("Update status failed:", error);
      alert("Project update failed. No verification change was saved.");
    }
    setSelectedProject(null);
  };

  const handleMintCredits = async (project: ProjectDoc) => {
    if (!user?.isAdmin) return;
    setIsMinting(true);
    setMintTxHash("");

    try {
      if (!isConnected || !address) throw new Error("Connect a wallet on an explicitly enabled test network. Simulated minting is unavailable.");
      if (!Number.isSafeInteger(project.onChainProjectId) || project.onChainProjectId! <= 0) throw new Error("This record has no verified on-chain project ID. Database IDs cannot be converted to contract IDs.");
      if (!Number.isSafeInteger(mintAmount) || mintAmount <= 0) throw new Error("Enter a positive whole credit amount.");
      const txHash = await mintCreditsOnChain(project.onChainProjectId!, address, mintAmount);
      setMintTxHash(txHash);
      // Hook resolves only after a successful receipt. Do not fabricate database success.
      await databases.updateDocument(DATABASE_ID, PROJECTS_COLLECTION_ID, project.$id, {
        status: "minted", creditsIssued: project.creditsIssued + mintAmount
      });
      setProjects(projects.map(p => p.$id === project.$id ? { ...p, status: "minted", creditsIssued: p.creditsIssued + mintAmount } : p));
      setMintSuccess(true);

    } catch (error: any) {
      console.error("Minting failed:", error);
      alert(`Minting failed: ${error.message || "Unknown error"}. Make sure you have the VERIFIER_ROLE.`);
    } finally {
      setIsMinting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "approved": case "Verified": return "bg-forest/10 text-forest";
      case "minted": case "Minted": return "bg-blue-100 text-blue-600";
      case "pending": case "Pending": return "bg-amber-100 text-amber-600";
      case "rejected": case "Rejected": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (!user?.isAdmin) return <div className="p-12 text-center">Sign in with a registry administrator account to verify projects.</div>;

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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-dark mb-2">Verifier Dashboard</h1>
            <p className="text-gray-500">Manage pending project registrations and mint carbon credits on-chain.</p>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" label="Connect Wallet" />
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="h-10 w-10 bg-mint rounded-xl flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-forest" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Verifier Status</p>
                <p className="text-sm font-bold text-dark">Authorized Auditor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest/20 outline-none bg-white"
            />
          </div>
          <select className="px-4 py-3 rounded-xl border border-gray-200 bg-white font-semibold text-gray-600 outline-none">
            <option>All Status</option>
            <option>Pending</option>
            <option>Verified</option>
          </select>
          <button className="flex items-center justify-center space-x-2 bg-dark text-white rounded-xl font-bold hover:bg-dark/90 transition-all">
            <Plus className="h-5 w-5" />
            <span>Bulk Actions</span>
          </button>
        </div>

        {/* Project List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {projects.length === 0 ? (
            <div className="py-20 text-center">
              <ShieldCheck className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No projects submitted yet.</h3>
              <p className="text-gray-400 text-sm">Projects submitted by suppliers will appear here for verification.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Project</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Area</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((project) => (
                  <tr key={project.$id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-6">
                      <div>
                        <p className="font-bold text-dark">{project.projectName}</p>
                        <p className="text-xs text-gray-400">{project.locationName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm text-gray-600 font-medium">{project.ecosystemType}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm text-gray-600 font-medium">{project.areaSize} Ha</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => setSelectedProject(project)}
                          className="p-2 text-gray-400 hover:text-forest transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {(project.status === "pending" || project.status === "Pending") && (
                          <>
                            <button 
                              onClick={() => updateStatus(project.$id, "approved")}
                              className="p-2 text-forest hover:bg-forest/10 rounded-lg transition-colors"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => updateStatus(project.$id, "rejected")}
                              className="p-2 text-red-500 hover:bg-red-50/50 rounded-lg transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {(project.status === "approved" || project.status === "Verified") && (
                          <button 
                            onClick={() => {
                              setSelectedProject(project);
                              setMintAmount(project.estimatedCO2 || 100);
                            }}
                            className="px-4 py-2 bg-forest text-white text-xs font-bold rounded-full hover:bg-forest/90 transition-all"
                          >
                            Mint Credits
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Project Detail Drawer */}
      <AnimatePresence>
        {selectedProject && !isMinting && !mintSuccess && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-dark/20 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto p-12"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-12 left-12 p-3 bg-gray-50 rounded-full text-gray-400 hover:text-dark transition-all"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="mt-12">
                <span className="text-xs font-bold text-forest uppercase tracking-widest mb-2 block">Project Verification Review</span>
                <h2 className="text-3xl font-bold text-dark mb-8">{selectedProject.projectName}</h2>
                
                <div className="space-y-12">
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Project Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 mb-1">Location</p>
                        <p className="font-bold text-dark">{selectedProject.locationName}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 mb-1">Ecosystem</p>
                        <p className="font-bold text-dark">{selectedProject.ecosystemType}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 mb-1">Area Size</p>
                        <p className="font-bold text-dark">{selectedProject.areaSize} Hectares</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 mb-1">Estimated CO₂</p>
                        <p className="font-bold text-dark">{selectedProject.estimatedCO2} Tons</p>
                      </div>
                    </div>
                  </section>

                  {/* Mint Credits Section */}
                  {(selectedProject.status === "approved" || selectedProject.status === "Verified") && (
                    <section>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Mint Carbon Credits</h3>
                      <div className="p-6 bg-mint/20 rounded-2xl border border-mint space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Credits to Mint</label>
                          <input
                            type="number"
                            value={mintAmount}
                            onChange={(e) => setMintAmount(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                          />
                        </div>
                        <button
                          onClick={() => handleMintCredits(selectedProject)}
                          disabled={isMinting || mintAmount <= 0}
                          className="w-full py-4 bg-forest text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-forest/90 disabled:opacity-50 transition-all"
                        >
                          <Droplets className="h-5 w-5" />
                          <span>{isConnected ? "Mint On-Chain" : "Simulate Minting"}</span>
                        </button>
                        {!isConnected && (
                          <p className="text-xs text-gray-400 text-center">Connect wallet for real on-chain minting</p>
                        )}
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Verification Actions</h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => updateStatus(selectedProject.$id, "approved")}
                        className="flex-1 py-4 bg-forest text-white rounded-2xl font-bold flex items-center justify-center space-x-2"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Approve Project</span>
                      </button>
                      <button 
                        onClick={() => updateStatus(selectedProject.$id, "rejected")}
                        className="flex-1 py-4 bg-white border border-red-200 text-red-500 rounded-2xl font-bold flex items-center justify-center space-x-2"
                      >
                        <XCircle className="h-5 w-5" />
                        <span>Reject Project</span>
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minting Modal */}
      <AnimatePresence>
        {(isMinting || mintSuccess) && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center relative z-10 shadow-2xl"
            >
              {isMinting ? (
                <>
                  <div className="relative h-24 w-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-mint rounded-full" />
                    <div className="absolute inset-0 border-4 border-forest border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Droplets className="h-8 w-8 text-forest" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-dark mb-2">
                    {isWritePending ? "Confirm in Wallet..." : "Minting Credits"}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {isConnected ? "Transacting on Sepolia..." : "Simulating blockchain transaction..."}
                  </p>
                </>
              ) : (
                <>
                  <div className="h-24 w-24 bg-mint rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="h-12 w-12 text-forest" />
                  </div>
                  <h2 className="text-2xl font-bold text-dark mb-2">Transaction Success</h2>
                  <p className="text-gray-500 text-sm mb-8">Carbon credits minted and assigned to project registry.</p>
                  <div className="bg-mint/30 p-4 rounded-xl mb-4 flex flex-col items-center space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">TX Hash</span>
                    <span className="text-xs font-mono text-forest break-all">{mintTxHash}</span>
                  </div>
                  {isConnected && mintTxHash && !mintTxHash.startsWith("0x0") && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${mintTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-forest font-bold hover:underline mb-8 inline-flex items-center space-x-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View on Etherscan</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setMintSuccess(false);
                      setSelectedProject(null);
                    }}
                    className="w-full py-4 bg-forest text-white rounded-full font-bold shadow-lg mt-4"
                  >
                    Done
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
