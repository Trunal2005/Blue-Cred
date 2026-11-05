import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { GlobalStateProvider } from "@/context/GlobalState";
import Web3Provider from "@/app/components/Web3Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlueCred — Decentralized Blue Carbon Registry",
  description: "Transforming coastal ecosystem data into trusted blockchain-verified carbon credits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <GlobalStateProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </GlobalStateProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
