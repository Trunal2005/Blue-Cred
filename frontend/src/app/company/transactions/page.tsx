"use client";

import { useGlobalState } from "@/context/GlobalState";
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  CheckCircle2, 
  Search, 
  Download,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CompanyTransactions() {
  const { ownedCredits, userRole } = useGlobalState();

  if (userRole !== "Company") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
        <div>
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2">Access Restricted</h2>
          <p className="text-gray-500 mb-6">Only verified Company accounts can access procurement and transaction history.</p>
          <Link href="/login" className="px-6 py-3 bg-forest text-white rounded-full font-bold hover:bg-forest/90 transition-all font-sans">
            Sign In as Company
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Header */}
        <div className="mb-4">
          <Link href="/company/portfolio" className="inline-flex items-center space-x-2 text-gray-500 hover:text-forest font-bold text-sm transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portfolio</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-dark mb-2">Transaction Ledger</h1>
              <p className="text-gray-500">View your comprehensive carbon credit procurement history.</p>
            </div>
            <button className="px-6 py-3 bg-white text-forest border border-gray-200 rounded-xl font-bold hover:bg-mint/30 transition-colors shadow-sm flex items-center justify-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="my-8 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by project name or token ID..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 outline-none text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount (INR)</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ownedCredits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-gray-500">
                    <p className="mb-4">No transactions found.</p>
                    <Link href="/marketplace" className="text-forest font-bold hover:underline">Browse Marketplace</Link>
                  </td>
                </tr>
              ) : (
                ownedCredits.map((tx, i) => (
                  <tr key={tx.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-mint/50 flex items-center justify-center shrink-0">
                          <ArrowRightLeft className="h-4 w-4 text-forest" />
                        </div>
                        <span className="font-mono text-xs text-gray-600 font-bold">{tx.tokenId}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-dark">{tx.projectName}</td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-forest">{tx.credits.toLocaleString()} BCT</span>
                    </td>
                    <td className="px-8 py-6 font-bold text-dark">
                      ₹{tx.pricePaid ? tx.pricePaid.toLocaleString() : "N/A"}
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                      {tx.purchaseDate}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-forest/10 text-forest text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Success</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
