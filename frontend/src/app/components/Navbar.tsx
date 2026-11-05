"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet, Menu, X, Droplets } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useGlobalState } from "@/context/GlobalState";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userRole, logout } = useGlobalState();

  const allLinks = [
    { name: "Home", href: "/", roles: ["NGO", "Company", "Admin", null] },
    { name: "Marketplace", href: "/marketplace", roles: ["Company", "Admin"] },
    { name: "Projects", href: "/projects", roles: ["NGO", "Company", "Admin", null] },
    { name: "Portfolio", href: "/company/portfolio", roles: ["Company"] },
    { name: "My Projects", href: "/my-projects", roles: ["NGO"] },
    { name: "Submit Project", href: "/submit", roles: ["NGO"] },
    { name: "Verifier", href: "/verifier", roles: ["Admin"] },
    { name: "Admin", href: "/admin", roles: ["Admin"] },
    { name: "Impact", href: "/impact", roles: ["NGO", "Company", "Admin", null] },
  ];

  const navLinks = allLinks.filter(link =>
    !link.roles || link.roles.includes(userRole as any)
  );

  return (
    <nav className="sticky top-0 z-50 glass-morphism border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-forest" />
              <span className="text-xl font-bold text-dark tracking-tight">BlueCred</span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-gray-500 hover:text-forest transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Wallet Connect Button */}
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" label="Connect Wallet" />

            {userRole ? (
              <div className="flex items-center space-x-3">
                <div className="px-4 py-1.5 bg-mint rounded-full text-[10px] font-bold text-forest uppercase tracking-widest border border-forest/10">
                  {userRole}
                </div>
                <button
                  onClick={logout}
                  className="text-sm font-bold text-red-400 hover:text-red-500 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-forest text-white text-sm font-bold hover:bg-forest/90 transition-all shadow-md"
              >
                <Wallet className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-forest focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden shadow-2xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-base font-bold text-gray-500 hover:text-forest hover:bg-mint rounded-2xl transition-all"
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Wallet Connect */}
              <div className="px-3 py-3">
                <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" label="Connect Wallet" />
              </div>

              <div className="pt-4 border-t border-gray-50 mt-4">
                {userRole ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full py-4 text-center font-bold text-red-500"
                  >
                    Sign Out ({userRole})
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-4 rounded-2xl bg-forest text-white font-bold shadow-lg"
                  >
                    <Wallet className="h-5 w-5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
