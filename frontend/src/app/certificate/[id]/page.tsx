"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  ShieldCheck,
  FileBadge,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { databases, DATABASE_ID, TRANSACTIONS_COLLECTION_ID, PROJECTS_COLLECTION_ID } from "@/lib/appwrite";

export default function CertificatePage() {
  const { id } = useParams();
  const router = useRouter();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ credit: any; project: any } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Fetch Transaction
        const credit = await databases.getDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          id as string
        );

        // 2. Fetch Project
        const project = await databases.getDocument(
          DATABASE_ID,
          PROJECTS_COLLECTION_ID,
          credit.projectId
        );

        setData({ credit, project });
      } catch (error) {
        console.error("Error fetching certificate data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;
    
    setIsDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"), import("jspdf"),
      ]);
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`BlueCred-Certificate-${data?.credit?.tokenId || 'BCT'}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-forest animate-spin" />
      </div>
    );
  }

  const { credit, project } = data || {};

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-dark font-bold transition-all p-2 rounded-full hover:bg-white border border-transparent hover:border-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
          
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-8 py-4 bg-forest text-white rounded-full font-bold shadow-lg hover:bg-forest/90 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isDownloading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span>{isDownloading ? "Generating PDF..." : "Download Certificate"}</span>
          </button>
        </div>

        {/* Certificate Display Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shadow-2xl rounded-sm overflow-hidden border border-gray-200"
        >
          {/* THE CERTIFICATE (This ref is captured for PDF) */}
          <div 
            ref={certificateRef}
            className="bg-white relative overflow-hidden"
            style={{ width: "100%", padding: "4rem", minHeight: "600px" }}
          >
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-mint rounded-bl-full opacity-30" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-forest rounded-tr-full opacity-5" />
            <div className="absolute inset-0 border-[16px] border-mint/20 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              
              {/* Cert Header */}
              <div className="flex justify-between items-start mb-16">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-10 w-10 bg-forest rounded-lg flex items-center justify-center">
                      <FileBadge className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-dark tracking-tighter">BlueCred</span>
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest border-l-2 border-forest pl-2 ml-1">
                    Verified Carbon Offset
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center space-x-1 px-3 py-1 bg-forest/10 rounded-full text-forest text-[10px] font-bold uppercase tracking-wider mb-2 border border-forest/20">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Blockchain Verified</span>
                  </div>
                  <p className="font-mono text-xs text-gray-400">ID: {credit.tokenId}</p>
                </div>
              </div>

              {/* Cert Body */}
              <div className="text-center max-w-2xl mx-auto mb-16">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">This Certificate confirms that</p>
                  <h2 className="text-4xl font-bold text-dark mb-4 border-b pb-4 border-gray-100 italic">
                    {credit?.buyerUserId || "Verified Company"}
                  </h2>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-8 mt-6">has permanently retired</p>
                  
                  <div className="inline-block px-12 py-6 bg-mint/30 rounded-3xl border border-mint mb-8">
                    <p className="text-6xl font-black text-forest mb-2">{credit?.creditAmount?.toLocaleString()}</p>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tons of CO2e</p>
                  </div>

                  <p className="text-gray-500 leading-relaxed max-w-xl mx-auto">
                    Derived from verifiable ecological restoration activities conducted within the <span className="font-bold text-dark">{project?.projectName}</span> project at <span className="font-bold text-dark">{project?.locationName}</span>.
                  </p>
                </div>

                {/* Cert Footer Details */}
                <div className="grid grid-cols-4 gap-4 pt-8 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ecosystem</p>
                    <p className="font-bold text-dark text-sm">{project?.ecosystemType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Retirement Date</p>
                    <p className="font-bold text-dark text-sm">{credit?.transactionDate?.split('T')[0]}</p>
                  </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Network</p>
                  <p className="font-bold text-dark text-sm">Polygon Mainnet</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 shrink-0">
                    <div className="grid grid-cols-2 gap-1 p-1 h-full w-full opacity-50">
                      <div className="bg-dark rounded-sm" />
                      <div className="bg-dark rounded-sm" />
                      <div className="bg-dark rounded-sm" />
                      <div className="bg-dark rounded-sm" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registry Explorer</p>
                    <p className="text-[10px] font-mono text-dark">0x4a9b...7c2e</p>
                  </div>
                </div>
              </div>

              {/* Watermark/Seal */}
              <div className="absolute bottom-12 right-12 opacity-10 pointer-events-none">
                <CheckCircle2 className="h-48 w-48 text-forest" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
