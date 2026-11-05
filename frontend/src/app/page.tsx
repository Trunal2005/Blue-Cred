"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Database, 
  Cpu, 
  ChevronRight, 
  AlertTriangle, 
  Lock, 
  Zap,
  Globe,
  Waves,
  TreePine,
  ArrowRight,
  Droplets
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-mint to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              {...fadeInUp}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-sm font-semibold mb-6"
            >
              <Zap className="h-4 w-4" />
              <span>Next-Generation Carbon Registry</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-dark tracking-tight mb-8"
            >
              BlueCred — <span className="gradient-text">Decentralized</span> <br />
              Blue Carbon Registry
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Transforming coastal ecosystem data into trusted blockchain-verified carbon credits. 
              Accelerating blue carbon markets with transparency and scale.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link
                href="/projects"
                className="w-full sm:w-auto px-8 py-4 bg-forest text-white rounded-full font-bold text-lg hover:bg-forest/90 transition-all flex items-center justify-center space-x-2"
              >
                <span>Explore Projects</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                href="/submit"
                className="w-full sm:w-auto px-8 py-4 bg-white text-forest border-2 border-forest rounded-full font-bold text-lg hover:bg-mint transition-all flex items-center justify-center"
              >
                Submit Carbon Project
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-forest rounded-full filter blur-[120px]" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-mint rounded-full filter blur-[120px]" />
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-forest uppercase tracking-widest mb-4 font-sans">Get Started</h2>
            <h3 className="text-4xl font-bold text-dark">Choose Your Role</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1 - Buyer */}
            <motion.div
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] bg-mint/30 border border-mint flex flex-col items-center text-center group transition-all hover:shadow-2xl hover:bg-white"
            >
              <div className="h-20 w-20 bg-forest rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-dark mb-4">Buy Carbon Credits</h4>
              <p className="text-gray-500 mb-10 leading-relaxed">
                Browse verified blue carbon projects and purchase blockchain-verified carbon credits to offset your footprint.
              </p>
              <Link
                href="/login"
                className="w-full py-4 bg-forest text-white rounded-full font-bold text-lg hover:bg-forest/90 transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <span>Enter Marketplace</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>

            {/* Card 2 - Supplier */}
            <motion.div
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] bg-white border border-gray-100 flex flex-col items-center text-center group transition-all hover:shadow-2xl hover:border-mint"
            >
              <div className="h-20 w-20 bg-mint rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <TreePine className="h-10 w-10 text-forest" />
              </div>
              <h4 className="text-2xl font-bold text-dark mb-4">Become a Supplier</h4>
              <p className="text-gray-500 mb-10 leading-relaxed">
                Register ecosystem restoration projects such as mangrove or seagrass conservation and generate verified credits.
              </p>
              <Link
                href="/login"
                className="w-full py-4 bg-white text-forest border-2 border-forest rounded-full font-bold text-lg hover:bg-mint transition-all flex items-center justify-center space-x-2"
              >
                <span>Register Project</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: ShieldCheck,
                title: "Transparent Verification",
                desc: "MRV data is anchored on-chain for immutable verification."
              },
              {
                icon: Lock,
                title: "Tamper-proof Evidence",
                desc: "All environmental evidence stored securely on IPFS."
              },
              {
                icon: Cpu,
                title: "Tokenized Credits",
                desc: "ERC-1155 tokens ensuring provenance and liquidity."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="p-8 rounded-2xl bg-mint/30 border border-mint hover:border-forest/30 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <item.icon className="h-6 w-6 text-forest" />
                </div>
                <h3 className="text-xl font-bold text-dark mb-4">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-dark text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-forest uppercase tracking-widest mb-4">The Challenge</h2>
            <h3 className="text-4xl md:text-5xl font-bold">The Problem with Carbon Credit Verification</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Fragmented Data",
                desc: "Carbon project data is scattered across NGOs, government departments, and reports.",
                icon: Database
              },
              {
                title: "Carbon Credit Fraud",
                desc: "Duplicate registrations and weak verification reduce trust in carbon markets.",
                icon: AlertTriangle
              },
              {
                title: "High Verification Cost",
                desc: "Manual auditing makes small community projects financially unviable.",
                icon: Zap
              }
            ].map((problem, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-forest rounded-lg flex items-center justify-center mb-6">
                  <problem.icon className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-4">{problem.title}</h4>
                <p className="text-gray-400 leading-relaxed">{problem.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Subtle grid pattern for dark section */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-forest uppercase tracking-widest mb-4">Our Solution</h2>
              <h3 className="text-4xl font-bold text-dark mb-8 leading-tight">
                BlueCred: A Decentralized Infrastructure for Blue Carbon
              </h3>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                BlueCred creates a decentralized registry where restoration projects can securely submit 
                environmental data and receive verifiable carbon credits issued on blockchain.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Field Data Capture", icon: Globe },
                  { title: "IPFS Evidence Storage", icon: Database },
                  { title: "Blockchain Verification", icon: ShieldCheck },
                  { title: "Carbon Credit Tokenization", icon: Zap }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-mint flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-4 w-4 text-forest" />
                    </div>
                    <span className="font-semibold text-dark">{feature.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="relative p-8 rounded-3xl bg-mint/50 border border-mint overflow-hidden">
                <div className="relative z-10 flex flex-col space-y-4">
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">PROJECT DATA</span>
                    <span className="text-xs text-forest font-semibold">VERIFIED</span>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">IPFS HASH</span>
                    <span className="text-xs font-mono text-gray-600">QmXoyp...3n8</span>
                  </div>
                  <div className="flex justify-center py-4">
                    <div className="h-12 w-px bg-forest/20 animate-pulse" />
                  </div>
                  <div className="p-6 bg-forest rounded-xl shadow-lg text-white flex flex-col items-center">
                    <Droplets className="h-8 w-8 mb-2" />
                    <span className="text-sm font-bold uppercase tracking-widest">Blue Carbon Token</span>
                    <span className="text-xs opacity-70">ERC-1155 • Polygon</span>
                  </div>
                </div>
                {/* Visual flair */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-forest/10 rounded-full filter blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-mint/20 border-t border-b border-mint/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-forest uppercase tracking-widest mb-4">The Workflow</h2>
            <h3 className="text-4xl font-bold text-dark">How It Works</h3>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-forest/10 via-forest to-forest/10" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {[
                { step: "Step 1", title: "Field Input", desc: "Field worker submits GPS polygon and photos.", icon: Waves },
                { step: "Step 2", title: "IPFS Storage", desc: "Evidence stored on IPFS for transparency.", icon: Database },
                { step: "Step 3", title: "Verification", desc: "AI + verifier validation of MRV data.", icon: ShieldCheck },
                { step: "Step 4", title: "Anchoring", desc: "Blockchain record anchored on Polygon.", icon: Lock },
                { step: "Step 5", title: "Token Minting", desc: "Carbon credit token minted as ERC-1155.", icon: Droplets }
              ].map((item, i) => (
                <div key={i} className="relative text-center group">
                  <div className="relative z-10 w-20 h-20 bg-white border-4 border-mint rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <item.icon className="h-8 w-8 text-forest" />
                    <div className="absolute -top-2 -right-2 bg-forest text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      {item.step}
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-dark mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed px-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-12 md:p-16 rounded-[3rem] bg-forest text-white relative overflow-hidden text-center">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Restore the Oceans?</h2>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                Join the decentralized blue carbon ecosystem and start earning credits for ecosystem restoration.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/submit"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-forest rounded-full font-bold text-lg hover:bg-mint transition-all flex items-center justify-center"
                >
                  Start Submission
                </Link>
                <Link
                  href="/projects"
                  className="w-full sm:w-auto px-8 py-4 bg-forest-dark text-white border-2 border-white/20 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  View Ecosystem
                </Link>
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl -ml-32 -mb-32" />
          </div>
        </div>
      </section>
    </div>
  );
}
