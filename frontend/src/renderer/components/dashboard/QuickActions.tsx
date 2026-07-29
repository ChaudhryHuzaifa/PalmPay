// src/renderer/components/dashboard/QuickActions.tsx
import { motion } from 'framer-motion';
import { Send, ArrowDownToLine, QrCode, Scan, Shield, Zap, Sparkles } from 'lucide-react';
import { useState } from 'react';

const QuickActions = () => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const actions = [
    { id: 'send', icon: Send, label: 'Send', color: 'from-emerald-500 to-cyan-500' },
    { id: 'receive', icon: ArrowDownToLine, label: 'Receive', color: 'from-cyan-500 to-blue-500' },
    { id: 'pay', icon: QrCode, label: 'Pay', color: 'from-blue-500 to-indigo-500' },
    { id: 'scan', icon: Scan, label: 'Scan', color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <div className="glass-card backdrop-blur-xl rounded-3xl p-6 border border-cyan-500/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span className="palm-gradient-text">Quantum Actions</span>
        </h3>
        <div className="flex items-center gap-2 text-xs text-cyan-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedAction(action.id)}
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${action.color} border border-white/10 overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <action.icon className="w-8 h-8" />
              <span className="font-semibold">{action.label}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Security Badge */}
      <div className="mt-6 pt-6 border-t border-cyan-500/20">
        <div className="flex items-center justify-center gap-3">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-gray-400">Biometric Security Active</span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;