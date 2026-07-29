import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

export const BalanceCard = () => {
  const user = useAuthStore(state => state.user);
  const [balanceVisible, setBalanceVisible] = useState(false);

  return (
    <div className="glass-card backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-blue-500/5" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Quantum Balance</h3>
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl font-bold palm-gradient-text"
              >
                {balanceVisible ? `$${user?.balance?.toLocaleString() || '5,247.89'}` : '●●●●●●●'}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-3 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-cyan-500/30 hover:border-cyan-500/50 transition-all"
              >
                {balanceVisible ? (
                  <EyeOff className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Eye className="w-5 h-5 text-cyan-400" />
                )}
              </motion.button>
            </div>
          </div>
          
          {/* Balance Trend */}
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Today's Trend</div>
            <div className="flex items-center gap-2 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-2xl font-bold">+12.5%</span>
            </div>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Daily Income', value: '$1,245', change: '+12.5%', color: 'text-emerald-400' },
            { label: 'Weekly Spend', value: '$847', change: '-3.2%', color: 'text-cyan-400' },
            { label: 'Savings Goal', value: '85%', change: '+5.8%', color: 'text-blue-400' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 border border-cyan-500/10"
            >
              <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-emerald-400 mt-1">{stat.change}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};