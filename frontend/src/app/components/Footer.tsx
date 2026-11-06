import Link from "next/link";
import { Droplets, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <Droplets className="h-8 w-8 text-forest" />
              <span className="text-xl font-bold text-dark tracking-tight">BlueCred</span>
            </Link>
            <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
              Transparent infrastructure for the blue carbon economy. Decenteralizing MRV for coastal ecosystem restoration.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-forest transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-dark uppercase tracking-wider mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><Link href="/projects" className="text-gray-500 hover:text-forest text-sm">Registry</Link></li>
              <li><Link href="/submit" className="text-gray-500 hover:text-forest text-sm">Submit Project</Link></li>
              <li><Link href="/verifier" className="text-gray-500 hover:text-forest text-sm">Verifier Control</Link></li>
              <li><Link href="/impact" className="text-gray-500 hover:text-forest text-sm">Impact Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-dark uppercase tracking-wider mb-6">Technology</h3>
            <ul className="space-y-4">
              <li><span className="text-gray-500 text-sm">Next.js + React</span></li>
              <li><span className="text-gray-500 text-sm">Tailwind CSS</span></li>
              <li><span className="text-gray-500 text-sm">Polygon Blockchain</span></li>
              <li><span className="text-gray-500 text-sm">IPFS Storage</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} BlueCred — Hackathon Project. All rights reserved.
          </p>
          <p className="text-gray-400 text-xs italic">
            &quot;Building transparent infrastructure for the blue carbon economy.&quot;
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
