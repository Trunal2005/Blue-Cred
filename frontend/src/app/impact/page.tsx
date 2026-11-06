"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Droplets, 
  TreePine, 
  Globe, 
  Waves,
  Calendar,
  Layers,
  Zap,
  ExternalLink,
  CheckCircle2,
  MapPin,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import dynamic from 'next/dynamic';
import { databases, DATABASE_ID, PROJECTS_COLLECTION_ID } from "@/lib/appwrite";

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const EcosystemMap = dynamic(() => import('@/app/components/EcosystemMap'), { ssr: false });

export default function ImpactDashboard() {
  const [mapProjects, setMapProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCredits: 0,
    verifiedProjects: 0,
    totalArea: 0,
    totalCO2: 0,
  });
  const [ecosystemData, setEcosystemData] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, PROJECTS_COLLECTION_ID);
      const docs = response.documents;
      setMapProjects(docs);
      
      const approvedDocs = docs.filter(d => d.status === "approved" || d.status === "minted");
      
      const totalCredits = approvedDocs.reduce((acc, curr) => acc + (curr.creditsIssued || 0), 0);
      const verifiedProjects = approvedDocs.length;
      const totalArea = approvedDocs.reduce((acc, curr) => acc + (curr.areaSize || 0), 0);
      const totalCO2 = approvedDocs.reduce((acc, curr) => acc + (curr.estimatedCO2 || 0), 0);

      setStats({
        totalCredits,
        verifiedProjects,
        totalArea,
        totalCO2
      });

      // Ecosystem breakdown
      const ecosMap: Record<string, number> = {};
      approvedDocs.forEach(d => {
        const type = d.ecosystemType || "Other";
        ecosMap[type] = (ecosMap[type] || 0) + (d.creditsIssued || 0);
      });

      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
      const ecosArray = Object.entries(ecosMap).map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length]
      }));

      setEcosystemData(ecosArray);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metrics = [
    { label: "Total Carbon Credits Issued", value: stats.totalCredits.toLocaleString(), icon: Droplets, color: "text-forest", bg: "bg-mint" },
    { label: "Verified Projects", value: stats.verifiedProjects.toString(), icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Coastal Area Restored", value: stats.totalArea.toLocaleString() + " Ha", icon: TreePine, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total CO₂ Sequestered", value: (stats.totalCO2 / 1000).toFixed(1) + "k Tons", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" }
  ];

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Credits Issued',
        data: [40000, 60000, 45000, 80000, 55000, 90000, stats.totalCredits / 4, stats.totalCredits / 3],
        backgroundColor: '#1f7a4d',
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1a1a1a',
        bodyColor: '#1a1a1a',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10 },
          callback: (value: any) => `${value / 1000}k`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10, weight: 'bold' as const },
        },
      },
    },
  };

  const pieChartData = {
    labels: ecosystemData.map(d => d.name),
    datasets: [
      {
        data: ecosystemData.map(d => d.value),
        backgroundColor: ecosystemData.map(d => d.color),
        borderWidth: 0,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${(value / 1000).toFixed(0)}k Credits Issued`;
          },
        },
      },
    },
    cutout: '70%',
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
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-dark mb-4">Impact Dashboard</h1>
          <p className="text-gray-500 text-lg">Real-time visualization of global blue carbon restoration impact.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className={`h-12 w-12 ${metric.bg} ${metric.color} rounded-2xl flex items-center justify-center mb-6`}>
                <metric.icon className="h-6 w-6" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{metric.label}</p>
              <h3 className="text-3xl font-bold text-dark">{metric.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Charts & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-bold text-dark">Credits Issued Over Time</h3>
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-gray-400">YTD 2024</span>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="h-64 w-full">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-forest text-white shadow-xl relative overflow-hidden">
            <h3 className="text-xl font-bold mb-8 relative z-10">Impact by Ecosystem</h3>
            
            <div className="h-40 w-full relative z-10 mb-8">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>

            <div className="space-y-6 relative z-10">
              {ecosystemData.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <TreePine className="h-4 w-4 opacity-70" />
                      <span className="text-sm font-bold">{item.name}</span>
                    </div>
                    <span className="text-sm font-mono opacity-70">{(item.value / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.value / stats.totalCredits) * 100}%` }}
                      viewport={{ once: true }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Visual flair */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full filter blur-3xl -mr-32 -mb-32" />
          </div>
        </div>

        {/* Blockchain Demo Section */}
        <section className="py-12 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-12 p-10 rounded-[3rem] bg-mint/20 border border-mint">
            <div className="flex-1">
              <span className="text-xs font-bold text-forest uppercase tracking-widest mb-2 block">Blockchain Infrastructure</span>
              <h2 className="text-3xl font-bold text-dark mb-6">Transparency & Trust</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Every carbon credit issued through BlueCred is anchored on the Polygon blockchain as an ERC-1155 token. 
                This ensures immutable provenance and full transparency for buyers and restorers alike.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-forest rounded-lg flex items-center justify-center">
                      <Layers className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Token Standard</p>
                      <p className="text-sm font-bold text-dark">ERC-1155 (Multi-token)</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-forest" />
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Network</p>
                      <p className="text-sm font-bold text-dark">Polygon Mainnet</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-forest" />
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="p-10 rounded-[2rem] bg-white border border-gray-100 shadow-xl overflow-hidden relative">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-50">
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-6 w-6 text-forest" />
                      <span className="text-xl font-bold">Token Registry</span>
                    </div>
                    <span className="px-3 py-1 bg-mint text-forest text-[10px] font-bold rounded-full uppercase">LIVE TX</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Token ID</span>
                      <span className="font-mono text-sm font-bold">#001-MANG-024</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Project</span>
                      <span className="text-sm font-bold text-dark">Sundarbans Restoration</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Credits Minted</span>
                      <span className="text-sm font-bold text-forest">{(stats.totalCredits / 10).toFixed(0)} BCT</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Status</span>
                      <span className="text-sm font-bold text-green-600">Verified</span>
                    </div>
                  </div>

                  <a 
                    href="#" 
                    className="w-full mt-10 py-4 border-2 border-forest text-forest rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-mint transition-all"
                  >
                    <span>View Explorer</span>
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-mint rounded-full filter blur-3xl -mr-16 -mt-16 opacity-30" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
