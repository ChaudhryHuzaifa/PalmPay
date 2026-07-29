// src/renderer/layouts/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
      {/* Minimal sidebar - just to confirm layout is working */}
      <motion.div 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="w-20 glass-card border-r border-gray-800 flex flex-col items-center py-6"
      >
        <div className="mb-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </motion.div>

      {/* MAIN CONTENT AREA - THIS IS CRITICAL */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet /> {/* THIS MUST BE PRESENT */}
      </div>
    </div>
  );
}