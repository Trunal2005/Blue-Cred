"use client";

import { useEffect, useState } from "react";
import { 
  Droplets, 
  ChevronRight, 
  ExternalLink,
  Calendar,
  Layers,
  ShieldCheck,
  TrendingUp,
  Download,
  Loader2
} from "lucide-react";
import { useGlobalState } from "@/context/GlobalState";
import Link from "next/link";
import { motion } from "framer-motion";
import { databases, storage, DATABASE_ID, TRANSACTIONS_COLLECTION_ID, PROJECTS_COLLECTION_ID, BUCKET_ID } from "@/lib/appwrite";
import { Query } from "appwrite";

export default function Portfolio() {
  const { user } = useGlobalState();
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPortfolio = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch transactions for the user
      const txResponse = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [Query.equal("buyerUserId", user.id)]
      );

      const transactions = txResponse.documents;
      
      // 2. Fetch project details for these transactions
      const projectIds = Array.from(new Set(transactions.map(tx => tx.projectId)));
      
      let projectsMap: Record<string, any> = {};
      if (projectIds.length > 0) {
          const projResponse = await databases.listDocuments(
            DATABASE_ID,
            PROJECTS_COLLECTION_ID,
            [Query.equal("$id", projectIds)]
          );
          projResponse.documents.forEach(p => {
            projectsMap[p.$id] = p;
          });
      }

      // 3. Join data
      const joinedData = transactions.map(tx => ({
        ...tx,
        project: projectsMap[tx.projectId] || { projectName: "Unknown Project", imageFileIds: [] }
      }));

      setPortfolioItems(joinedData);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [user]);
  
  const totalCredits = portfolioItems.reduce((acc, curr) => acc + (curr.creditAmount || 0), 0);
  const totalOffset = totalCredits * 1.5; // Dummy calculation

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-forest animate-spin" />
      </div>
    );
  }

  if (user?.role !== "Company" && user?.role !== "Admin") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ShieldCheck className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2">Access Restricted</h2>
          <p className="text-gray-500 mb-6">This portfolio is only accessible to verified Company accounts.</p>
          <Link href="/" className="px-8 py-3 bg-forest text-white rounded-full font-bold">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-bold text-dark mb-4">Company Portfolio</h1>
            <p className="text-gray-500 text-lg">Manage and track your company&apos;s blockchain-verified carbon credits.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-6 bg-forest text-white rounded-[2rem] shadow-xl flex items-center space-x-6">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Droplets className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Credits Owned</p>
                <p className="text-2xl font-bold">{totalCredits.toLocaleString()} BCT</p>
              </div>
            </div>
            <div className="p-6 bg-mint border border-mint rounded-[2rem] flex items-center space-x-6 text-forest">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Est. Carbon Offset</p>
                <p className="text-2xl font-bold">{totalOffset.toLocaleString()} Tons</p>
              </div>
            </div>
          </div>
        </div>

        {/* Owned Credits List */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-dark mb-8">Tokenized Assets</h2>
          {portfolioItems.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-[3rem] text-center">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No credits owned yet.</h3>
              <Link href="/marketplace" className="mt-4 inline-block text-forest font-bold hover:underline">Go to Marketplace</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {portfolioItems.map((item, i) => (
                <motion.div
                  key={item.$id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col sm:flex-row gap-8 hover:shadow-xl transition-all group"
                >
                  <div className="h-40 w-full sm:w-40 rounded-[2rem] overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                    {item.project.imageFileIds?.[0] ? (
                        <img 
                            src={storage.getFilePreview(BUCKET_ID, item.project.imageFileIds[0]).toString()} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            alt="" 
                        />
                    ) : (
                        <Droplets className="h-10 w-10 text-gray-200" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                       <ShieldCheck className="h-4 w-4 text-forest" />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Token</span>
                    </div>
                    <h3 className="text-xl font-bold text-dark mb-4 group-hover:text-forest transition-colors">{item.project.projectName}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Quantity</p>
                        <p className="font-bold text-dark">{item.creditAmount.toLocaleString()} Credits</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Token ID</p>
                        <p className="font-mono text-xs font-bold text-forest">{item.tokenId}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Purchased</p>
                        <p className="text-xs text-gray-500 font-bold">{item.transactionDate.split('T')[0]}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <a href="#" className="flex-1 py-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 flex items-center justify-center space-x-2 hover:bg-forest hover:text-white transition-all">
                        <ExternalLink className="h-3 w-3" />
                        <span>View Tx</span>
                      </a>
                      <Link href={`/certificate/${item.$id}`} className="flex-1 py-3 bg-mint rounded-xl text-xs font-bold text-forest flex items-center justify-center space-x-2 hover:shadow-md transition-all">
                        <Download className="h-3 w-3" />
                        <span>Certificate</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Impact Activity */}
        <section className="p-10 rounded-[3rem] bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold text-dark">Recent Activity</h3>
            <button className="text-forest font-bold text-sm flex items-center hover:underline">
              View All History <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {portfolioItems.slice(0, 5).map((item, i) => (
              <div key={item.$id} className="bg-white p-6 rounded-2xl flex items-center justify-between border border-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-mint rounded-xl flex items-center justify-center">
                    <Layers className="h-5 w-5 text-forest" />
                  </div>
                  <div>
                    <p className="font-bold text-dark">Credit Purchase Confirmation</p>
                    <p className="text-xs text-gray-400">Token: {item.tokenId}...verified</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-forest">+{item.creditAmount} BCT</p>
                  <p className="text-xs text-gray-400">{item.transactionDate.split('T')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
