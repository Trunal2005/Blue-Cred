"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Upload, 
  Map as MapIcon, 
  Trash2, 
  CheckCircle2, 
  Save, 
  FileText, 
  TreePine, 
  Waves, 
  Mountain,
  ChevronRight,
  X,
  Wallet,
  LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useGlobalState } from "@/context/GlobalState";
import { useRouter } from "next/navigation";
import { 
  databases, 
  storage, 
  DATABASE_ID, 
  PROJECTS_COLLECTION_ID, 
  BUCKET_ID 
} from "@/lib/appwrite";
import { ID } from "appwrite";
import { useBlueCredContract } from "@/lib/useBlueCredContract";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const VegetationAnalysis = dynamic(() => import("@/app/components/VegetationAnalysis"));

// Dynamically import the map (Leaflet can't run on server)
const SubmitMap = dynamic(
  () => import("@/app/components/SubmitMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center" style={{ height: "400px" }}>
        <div className="flex flex-col items-center">
          <MapIcon className="h-12 w-12 text-forest mb-4 animate-pulse" />
          <p className="font-bold text-dark">Loading Map...</p>
        </div>
      </div>
    )
  }
);

export default function SubmitProject() {
  const { addProject, user } = useGlobalState();
  const blockchainWritesEnabled = process.env.NEXT_PUBLIC_ENABLE_TESTNET_WRITES === "true";
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { submitProjectOnChain, isConnected, isWritePending, lastTxHash } = useBlueCredContract();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const previewUrls = useRef(new Set<string>());
  useEffect(() => () => { previewUrls.current.forEach(url => URL.revokeObjectURL(url)); }, []);
  const [onChainTxHash, setOnChainTxHash] = useState<string>("");

  // Form State
  const [formData, setFormData] = useState({
    organizationName: "EcoRestor India",
    organizationType: "NGO",
    contactEmail: "",
    website: "",
    projectName: "",
    ecosystemType: "Mangrove",
    locationName: "",
    areaSize: 200,
    estimatedCO2: 8000,
    latitude: 0,
    longitude: 0,
    description: "Proposed restoration project in the coastal delta region."
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      newPreviews.forEach(url => previewUrls.current.add(url));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    previewUrls.current.delete(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit a project.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Upload Images to Appwrite Storage
      const fileIds: string[] = [];
      for (const file of files) {
        const uploadedFile = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          file
        );
        fileIds.push(uploadedFile.$id);
      }

      // 2. Create Project Document in Appwrite Database
      const projectDoc = {
        projectName: formData.projectName,
        locationName: formData.locationName,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        ecosystemType: formData.ecosystemType,
        areaSize: Number(formData.areaSize),
        estimatedCO2: Number(formData.estimatedCO2),
        description: formData.description,
        imageFileIds: fileIds,
        submittedByUserId: user.id,
        status: "pending",
        creditsIssued: 0,
        createdAt: new Date().toISOString()
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        ID.unique(),
        projectDoc
      );

      // 3. Submit on-chain if wallet is connected
      let txHash = "";
      if (isConnected && blockchainWritesEnabled) {
        try {
          txHash = await submitProjectOnChain(
            formData.projectName,
            formData.locationName
          );
          setOnChainTxHash(txHash);
        } catch (contractError: any) {
          console.warn("On-chain submission failed (project saved to database):", contractError);
          // Don't block the submission if on-chain fails
          txHash = "off-chain-only";
        }
      }

      // 4. Update local state
      addProject({
        id: result.$id,
        name: projectDoc.projectName,
        location: projectDoc.locationName,
        type: projectDoc.ecosystemType as any,
        creditsIssued: 0,
        availableCredits: 0,
        pricePerCredit: 25,
        status: "Pending",
        area: `${projectDoc.areaSize} Hectares`,
        biomass: `${projectDoc.estimatedCO2} Tons`,
        submittedBy: user.name,
        organizationName: formData.organizationName,
        organizationType: formData.organizationType as any,
        date: projectDoc.createdAt.split('T')[0],
        image: fileIds.length > 0 ? storage.getFilePreview(BUCKET_ID, fileIds[0]).toString() : "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&h=250",
        ipfsHash: "", // No IPFS upload has occurred.
        latitude: projectDoc.latitude,
        longitude: projectDoc.longitude
      });

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Submission failed accurately:", error);
      
      let errorMsg = "Failed to submit project. Please check if your Appwrite database and storage are correctly configured.";
      
      if (error && typeof error === 'object') {
        if (error.code === 401) {
          errorMsg = "Authentication error: You might not have permission to write to this collection. Check Appwrite Console permissions.";
        } else if (error.code === 404) {
          errorMsg = `Not Found: Check if Collection ID "${PROJECTS_COLLECTION_ID}" or Database ID "${DATABASE_ID}" matches your Appwrite Console.`;
        } else if (error.message) {
          errorMsg = `Submission error: ${error.message}`;
        }
      }
      
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-dark mb-4">Become a Carbon Credit Supplier</h1>
          <p className="text-gray-500 text-lg">Register your ecosystem restoration project and start generating verified carbon credits.</p>
        </div>

        {/* Wallet Connection Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-mint/50 to-mint/20 border border-mint flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-forest rounded-xl flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-dark text-sm">Blockchain Connection</p>
              <p className="text-xs text-gray-500">
                {!blockchainWritesEnabled ? "Blockchain writes are disabled in zero-cost local mode." : isConnected ? "Wallet connected. Test-network submission requires confirmation." : "Connect a test-network wallet for optional blockchain registration."}
              </p>
            </div>
          </div>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>

        {/* Form */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 py-4 text-center text-sm font-bold border-b-2 transition-colors ${
                  step === s ? "border-forest text-forest" : "border-transparent text-gray-400"
                }`}
              >
                Step {s}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-bold text-dark mb-6">Organization & General Info</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Organization Name</label>
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                        placeholder="e.g. EcoRestor India"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Organization Type</label>
                      <select 
                        value={formData.organizationType}
                        onChange={(e) => setFormData({...formData, organizationType: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all bg-white"
                      >
                        <option>NGO</option>
                        <option>Community Project</option>
                        <option>Private Project</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                        placeholder="admin@org.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="https://eco-restor.org"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Project Name</label>
                      <input
                        type="text"
                        required
                        value={formData.projectName}
                        onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                        placeholder="e.g. Mangrove Delta Restoration"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Ecosystem Type</label>
                      <select 
                        value={formData.ecosystemType}
                        onChange={(e) => setFormData({...formData, ecosystemType: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all"
                      >
                        <option>Mangrove</option>
                        <option>Seagrass</option>
                        <option>Salt Marsh</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Project Location</label>
                      <input
                        type="text"
                        required
                        value={formData.locationName}
                        onChange={(e) => setFormData({...formData, locationName: e.target.value})}
                        placeholder="Country, Region"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-8 py-3 bg-forest text-white rounded-full font-bold hover:bg-forest/90 transition-all flex items-center space-x-2"
                    >
                      <span>Continue</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-bold text-dark mb-2">MRV Data & Project Location</h2>
                  <p className="text-gray-500 text-sm mb-6">Click on the map to pin your project location. The coordinates will auto-fill below.</p>
                  
                  {/* Interactive Map */}
                  <SubmitMap
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationSelect={handleLocationSelect}
                  />

                  {/* Coordinate Display */}
                  {(formData.latitude !== 0 || formData.longitude !== 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 p-4 bg-mint/30 rounded-xl border border-mint"
                    >
                      <MapIcon className="h-5 w-5 text-forest" />
                      <span className="text-sm font-bold text-dark">
                        Selected Location: {formData.latitude.toFixed(6)}°N, {formData.longitude.toFixed(6)}°E
                      </span>
                    </motion.div>
                  )}

                  {/* Lat/Lng inputs (auto-filled but editable) */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formData.latitude}
                        onChange={(e) => setFormData({...formData, latitude: Number(e.target.value)})}
                        placeholder="0.0000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formData.longitude}
                        onChange={(e) => setFormData({...formData, longitude: Number(e.target.value)})}
                        placeholder="0.0000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Area Size (Hectares)</label>
                      <input 
                        type="number" 
                        value={formData.areaSize}
                        onChange={(e) => setFormData({...formData, areaSize: Number(e.target.value)})}
                        placeholder="0" 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Biomass (Tons CO₂e)</label>
                      <input 
                        type="number" 
                        value={formData.estimatedCO2}
                        onChange={(e) => setFormData({...formData, estimatedCO2: Number(e.target.value)})}
                        placeholder="0" 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-8 py-3 text-gray-400 font-bold hover:text-dark transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-8 py-3 bg-forest text-white rounded-full font-bold hover:bg-forest/90 transition-all flex items-center space-x-2"
                    >
                      <span>Continue</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-bold text-dark mb-6">Evidence Upload</h2>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-mint rounded-3xl p-12 text-center bg-mint/10 cursor-pointer hover:bg-mint/20 transition-all"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      accept="image/*"
                      className="hidden" 
                    />
                    <div className="h-20 w-20 bg-mint rounded-full flex items-center justify-center mx-auto mb-6">
                      <Upload className="h-10 w-10 text-forest" />
                    </div>
                    <h3 className="text-xl font-bold text-dark mb-2">Upload MRV Photos & Satellite Data</h3>
                    <p className="text-gray-500 mb-8">Click to select files from your drone or field device.</p>
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group">
                          <img src={preview} alt="preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {user && <VegetationAnalysis />}

                  {/* On-chain status indicator */}
                  {isConnected && blockchainWritesEnabled && (
                    <div className="p-4 bg-mint/20 rounded-2xl border border-mint flex items-center space-x-3">
                      <LinkIcon className="h-5 w-5 text-forest" />
                      <span className="text-sm text-dark font-semibold">
                        ✓ Wallet connected — project will also be registered on-chain (Sepolia)
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-8 py-3 text-gray-400 font-bold hover:text-dark transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || files.length === 0}
                      className="px-12 py-4 bg-forest text-white rounded-full font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{isWritePending ? "Confirming on-chain..." : "Submitting..."}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Submit Project</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {isSubmitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubmitted(false)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center relative z-10 shadow-2xl"
            >
              <div className="h-24 w-24 bg-mint rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="h-12 w-12 text-forest" />
              </div>
              <h2 className="text-3xl font-bold text-dark mb-4">Submitted and waiting for approval</h2>
              
              {onChainTxHash && onChainTxHash !== "off-chain-only" && (
                <div className="mb-8 p-4 bg-mint/20 rounded-2xl border border-mint">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Blockchain TX Hash</p>
                  <p className="text-xs font-mono text-forest break-all">{onChainTxHash}</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${onChainTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-forest hover:underline mt-2 inline-block font-bold"
                  >
                    View on Etherscan →
                  </a>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/my-projects')}
                  className="w-full py-4 bg-forest text-white rounded-full font-bold hover:bg-forest/90 transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
