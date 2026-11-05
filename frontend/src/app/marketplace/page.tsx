"use client";

import { useEffect, useState } from "react";
import { 
  Droplets, 
  MapPin, 
  ChevronRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  X, 
  ShoppingCart,
  ShieldCheck,
  TreePine,
  Waves,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useGlobalState } from "@/context/GlobalState";
import { 
  databases, 
  storage, 
  DATABASE_ID, 
  PROJECTS_COLLECTION_ID, 
  TRANSACTIONS_COLLECTION_ID,
  BUCKET_ID 
} from "@/lib/appwrite";
import { Query, ID } from "appwrite";

export default function Marketplace() {
  const { user, addOwnedCredits } = useGlobalState();
  const [marketProjects, setMarketProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    const sampleProjects = [
      {
        $id: "demo-mangrove-1",
        projectName: "Sundarbans Delta Restoration",
        locationName: "West Bengal, India",
        ecosystemType: "Mangrove",
        areaSize: 450,
        estimatedCO2: 12000,
        creditsIssued: 8500,
        status: "minted",
        pricePerCredit: 28,
        demoImage: "/ecosystems/mangrove.png",
        description: "Large-scale mangrove restoration across the Sundarbans delta."
      },
      {
        $id: "demo-seagrass-1",
        projectName: "Gulf of Kutch Seagrass Meadow",
        locationName: "Gujarat, India",
        ecosystemType: "Seagrass",
        areaSize: 320,
        estimatedCO2: 9500,
        creditsIssued: 6200,
        status: "approved",
        pricePerCredit: 35,
        demoImage: "/ecosystems/seagrass.png",
        description: "Restoration of seagrass meadows in the Gulf of Kutch marine sanctuary."
      },
      {
        $id: "demo-saltmarsh-1",
        projectName: "Chilika Lake Salt Marsh",
        locationName: "Odisha, India",
        ecosystemType: "Salt Marsh",
        areaSize: 180,
        estimatedCO2: 5200,
        creditsIssued: 3800,
        status: "minted",
        pricePerCredit: 22,
        demoImage: "/ecosystems/saltmarsh.png",
        description: "Coastal salt marsh conservation along Chilika Lake."
      }
    ];
    setMarketProjects(sampleProjects);
    setLoading(false);
  }, []);

  // Ecosystem-specific fallback images (using picsum.photos for reliable CORS support)
  const getEcosystemImage = (ecosystemType: string, index: number) => {
    // Using specific picsum photo IDs that show nature/landscape imagery
    const mangroveImages = [
      "https://picsum.photos/id/15/800/400",   // river/forest
      "https://picsum.photos/id/28/800/400",   // lake/trees
      "https://picsum.photos/id/167/800/400",  // coastline
    ];
    const seagrassImages = [
      "https://picsum.photos/id/37/800/400",   // ocean
      "https://picsum.photos/id/141/800/400",  // ocean waves
      "https://picsum.photos/id/173/800/400",  // nature lake
    ];
    const saltMarshImages = [
      "https://picsum.photos/id/10/800/400",   // forest landscape
      "https://picsum.photos/id/29/800/400",   // green field
      "https://picsum.photos/id/42/800/400",   // nature
    ];
    
    const type = ecosystemType?.toLowerCase() || "";
    if (type.includes("seagrass")) return seagrassImages[index % seagrassImages.length];
    if (type.includes("salt")) return saltMarshImages[index % saltMarshImages.length];
    return mangroveImages[index % mangroveImages.length];
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !user) {
        alert("Please login to purchase credits.");
        return;
    }

    setIsPurchasing(true);
    try {
      const pricePerCredit = 25; // Default price if not in schema
      const totalCost = purchaseAmount * pricePerCredit;
      const tokenId = "BCT-" + selectedProject.ecosystemType.toUpperCase().slice(0, 4) + "-" + Math.floor(Math.random() * 900 + 100);

      // 1. Create Transaction record in Appwrite
      const txData = {
        buyerUserId: user.id,
        projectId: selectedProject.$id,
        creditAmount: Number(purchaseAmount),
        pricePaid: totalCost,
        transactionDate: new Date().toISOString(),
        tokenId: tokenId
      };

      await databases.createDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        txData
      );

      // 2. Simulating blockchain hash
      setTxHash("0x" + Math.random().toString(36).substr(2, 15));

      // 3. Update local state
      addOwnedCredits({
        id: ID.unique(),
        projectName: selectedProject.projectName,
        credits: purchaseAmount,
        tokenId: tokenId,
        purchaseDate: txData.transactionDate.split('T')[0],
        pricePaid: totalCost,
        image: selectedProject.imageFileIds?.[0] ? storage.getFilePreview(BUCKET_ID, selectedProject.imageFileIds[0]).toString() : ""
      });

      setIsSuccess(true);
    } catch (error: any) {
      console.error("Purchase failed with detail:", error);
      
      let errorMsg = "Failed to complete purchase. Please check your connection.";
      if (error?.message) {
        errorMsg = `Purchase Error: ${error.message}`;
      } else if (error?.code === 401) {
        errorMsg = "Unauthorized: You do not have permission to create transaction records.";
      }
      
      alert(errorMsg);
    } finally {
      setIsPurchasing(false);
    }
  };

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
          <h1 className="text-4xl font-bold text-dark mb-4">Carbon Credit Marketplace</h1>
          <p className="text-gray-500 text-lg">Purchase verified blue carbon credits directly from coastal restoration projects.</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by name, location, or ecosystem..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
            />
          </div>
          <div className="flex gap-4">
            <button className="flex items-center space-x-2 px-6 py-3 rounded-xl border border-gray-200 hover:bg-mint/30 transition-colors font-semibold text-gray-600">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
            <select className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-mint/30 transition-colors font-semibold text-gray-600 focus:outline-none">
              <option>Lowest Price</option>
              <option>Highest Available</option>
              <option>Newest Projects</option>
            </select>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {marketProjects.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem]">
               <TreePine className="h-16 w-16 text-gray-200 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-gray-400">No projects available in the marketplace yet.</h3>
            </div>
          ) : (
            marketProjects.map((project, i) => (
                <motion.div
                key={project.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                <div className="relative h-56 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={
                        project.demoImage
                          ? project.demoImage
                          : project.imageFileIds && project.imageFileIds.length > 0
                            ? storage.getFilePreview(BUCKET_ID, project.imageFileIds[0]).toString()
                            : getEcosystemImage(project.ecosystemType, i)
                      }
                      alt={project.projectName}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = getEcosystemImage(project.ecosystemType, i);
                      }}
                    />
                    <div className="absolute top-4 left-4 flex space-x-2">
                    <span className="px-4 py-2 bg-white/95 rounded-xl text-forest text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm flex items-center space-x-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified</span>
                    </span>
                    <span className="px-4 py-2 bg-forest/90 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                        {project.ecosystemType}
                    </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white/95 px-4 py-2 rounded-xl backdrop-blur-sm shadow-md">
                    <span className="text-forest font-bold text-lg">₹{project.pricePerCredit || 25}</span>
                    <span className="text-gray-400 text-xs ml-1">/ credit</span>
                    </div>
                </div>
                
                <div className="p-8">
                    <h3 className="text-2xl font-bold text-dark mb-2 group-hover:text-forest transition-colors">{project.projectName}</h3>
                    <div className="flex items-center text-gray-400 text-sm mb-6">
                    <MapPin className="h-4 w-4 mr-1 text-forest" />
                    {project.locationName}
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Available Supply</span>
                        <div className="flex items-center space-x-1 text-dark">
                        <Droplets className="h-4 w-4 text-forest" />
                        <span className="text-lg font-bold">{(project.creditsIssued || 0).toLocaleString()} BCT</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedProject(project);
                            setPurchaseAmount(0);
                        }}
                        className="px-6 py-3 bg-mint text-forest rounded-full font-bold hover:bg-forest hover:text-white transition-all shadow-sm flex items-center space-x-2"
                    >
                        <span>Buy Credits</span>
                    </button>
                    </div>
                </div>
                </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Buy Credits Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-10 max-w-xl w-full relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-8 right-8 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-dark transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="flex items-center space-x-4 mb-8">
                <div className="h-16 w-16 bg-mint rounded-2xl flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-forest" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-dark">Confirm Purchase</h2>
                  <p className="text-gray-500">{selectedProject.projectName}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8 mb-8">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Price Per Credit</p>
                    <p className="text-2xl font-bold text-dark">₹{(selectedProject.pricePerCredit || 25).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Available Supply</p>
                    <p className="text-2xl font-bold text-forest">{(selectedProject.creditsIssued || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Quantity of Credits</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProject.creditsIssued || 1000}
                    value={purchaseAmount || ""}
                    onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 0)}
                    placeholder="Enter amount to buy..."
                    className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-forest/20 outline-none text-xl font-bold"
                  />
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <span className="text-lg font-bold text-dark">Total Cost</span>
                    <span className="text-3xl font-bold text-forest">₹{(purchaseAmount * (selectedProject.pricePerCredit || 25)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="flex-1 py-5 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={purchaseAmount <= 0 || purchaseAmount > (selectedProject.creditsIssued || 1000) || isPurchasing}
                  className="flex-[2] py-5 bg-forest text-white rounded-full font-bold text-lg hover:bg-forest/90 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isPurchasing ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Confirm Purchase</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success / Certificate Modal */}
      <AnimatePresence>
        {isSuccess && selectedProject && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
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
              className="bg-white rounded-[2rem] max-w-4xl w-full relative z-10 shadow-2xl overflow-hidden flex flex-col md:flex-row"
              id="certificate-download"
            >
              {/* Left Side: Visual */}
              <div className="md:w-1/3 bg-forest p-12 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <Droplets className="h-12 w-12 text-mint mb-6" />
                  <h2 className="text-3xl font-bold leading-tight">Certificate of Sequestration</h2>
                </div>
                <div className="relative z-10 mt-20">
                  <p className="text-forest-light text-sm font-bold uppercase tracking-widest mb-2">Issued By</p>
                  <p className="text-xl font-bold">BlueCred Registry</p>
                  <p className="text-xs text-mint/60">Decentralized Blue Carbon Ledger</p>
                </div>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-mint/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl" />
              </div>

              {/* Right Side: Content */}
              <div className="flex-1 p-12 bg-white relative">
                <div className="flex justify-between items-start mb-12">
                   <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Transaction ID</p>
                      <p className="text-xs font-mono text-forest">{txHash}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Date</p>
                      <p className="text-sm font-bold text-dark">{new Date().toLocaleDateString()}</p>
                   </div>
                </div>

                <div className="space-y-8 mb-12">
                   <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Beneficiary</h4>
                      <p className="text-2xl font-bold text-dark">{user?.name}</p>
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Project Details</h4>
                      <p className="text-xl font-bold text-forest">{selectedProject.projectName}</p>
                      <div className="flex items-center text-gray-400 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{selectedProject.locationName}</span>
                      </div>
                   </div>
                   <div className="pt-8 border-t border-gray-100 flex items-end justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Quantity Retained</h4>
                        <div className="flex items-baseline space-x-2">
                           <span className="text-5xl font-black text-dark">{purchaseAmount}</span>
                           <span className="text-xl font-bold text-forest">BCT</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Verified Tonnes of Blue Carbon Sequestration</p>
                      </div>
                      <div className="hidden md:block">
                        <ShieldCheck className="h-16 w-16 text-mint opacity-20" />
                      </div>
                   </div>
                </div>

                <div className="flex space-x-4 print:hidden">
                  <button
                    onClick={() => {
                        window.print();
                    }}
                    className="flex-1 py-4 bg-mint text-forest rounded-xl font-bold hover:bg-forest hover:text-white transition-all flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setSelectedProject(null);
                      setPurchaseAmount(0);
                    }}
                    className="px-8 py-4 bg-gray-50 text-gray-500 rounded-xl font-bold hover:bg-gray-100 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
