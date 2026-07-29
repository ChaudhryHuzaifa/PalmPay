// File: frontend/src/renderer/pages/Dashboard.tsx
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Shield, 
  CreditCard, 
  BarChart3, 
  Activity,
  Zap,
  Globe,
  Clock,
  Sparkles,
  Fingerprint,
  Lock,
  Cpu,
  Satellite,
  Network,
  DollarSign,
  Smartphone,
  Send,
  Download,
  Hand,
  Wifi,
  ChevronRight,
  Target,
  Layers,
  ShieldCheck,
  BatteryCharging,
  Radio,
  Cloud,
  LogOut 
} from "lucide-react";
import QuickActions from "../components/dashboard/QuickActions";
import { apiService } from "../utils/apiService";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [time, setTime] = useState("");
  const [networkStrength, setNetworkStrength] = useState(95);
  const [isLoading, setIsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const { user, fetchProfile, logout } = useAuthStore();
  
  // Real data states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    today: 500,
    weekly: 2840,
    monthly: 8150,
    totalTransactions: 128,
    biometricEnrolled: false,
    growth: {
      daily: 4.1,
      weekly: 12.8,
      monthly: 22.5,
      overall: 18.2
    }
  });

  // UPDATED: Set palmEnrolled to true and confidence to 100
  const [biometricData, setBiometricData] = useState({
    palmEnrolled: true,
    confidence: 100,
    lastUsed: new Date().toISOString(),
  });

  // Animate balance counter
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = balance / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= balance) {
        setAnimatedBalance(balance);
        clearInterval(timer);
      } else {
        setAnimatedBalance(parseFloat(current.toFixed(2)));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [balance]);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Simulate network changes
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStrength(prev => Math.min(100, Math.max(85, prev + (Math.random() * 4 - 2))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // SIMPLIFIED DATA FETCHING - FOR PRESENTATION
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const healthResponse = await apiService.checkBackendHealth();
        setBackendConnected(healthResponse.success);
        
        if (healthResponse.success) {
          await fetchProfile();
          const balanceResponse = await apiService.getBalance();
          if (balanceResponse.success && balanceResponse.data) {
            setBalance(balanceResponse.data.balance || 12450);
          }
          
          const txResponse = await apiService.getTransactions(5);
          if (txResponse.success && txResponse.data?.transactions) {
            const formattedTxs = txResponse.data.transactions.slice(0, 5).map((tx: any, index: number) => ({
              id: tx.id || `tx-${index}`,
              name: tx.description || 'Transaction',
              amount: tx.type === 'credit' ? `+AED ${tx.amount}` : `-AED ${tx.amount}`,
              time: 'Just now',
              type: tx.type === 'credit' ? 'income' : 'transfer',
              icon: tx.type === 'credit' ? Download : Send,
              status: 'completed'
            }));
            setTransactions(formattedTxs);
          }
        } else {
          setBalance(12450);
          setTransactions([
            { id: 1, name: "Payment Received", amount: "+AED 500", time: "10:30 AM", type: "income", icon: Download, status: "completed" },
            { id: 2, name: "Transfer Sent", amount: "-AED 120", time: "Yesterday", type: "transfer", icon: Send, status: "completed" },
            { id: 3, name: "Salary Deposit", amount: "+AED 4,500", time: "3 days ago", type: "income", icon: DollarSign, status: "completed" },
          ]);
        }
      } catch (error) {
        console.error('Data fetch error:', error);
        setBalance(12450);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const stats = [
    { 
      label: "Today", 
      value: `+AED ${userStats.today.toLocaleString()}`, 
      change: `+${userStats.growth.daily}%`, 
      icon: TrendingUp, 
      color: "from-emerald-500 to-cyan-500", 
      bg: "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20" 
    },
    { 
      label: "Weekly", 
      value: `+AED ${userStats.weekly.toLocaleString()}`, 
      change: `+${userStats.growth.weekly}%`, 
      icon: BarChart3, 
      color: "from-blue-500 to-purple-500", 
      bg: "bg-gradient-to-br from-blue-500/20 to-purple-500/20" 
    },
    { 
      label: "Monthly", 
      value: `+AED ${userStats.monthly.toLocaleString()}`, 
      change: `+${userStats.growth.monthly}%`, 
      icon: Activity, 
      color: "from-purple-500 to-pink-500", 
      bg: "bg-gradient-to-br from-purple-500/20 to-pink-500/20" 
    },
    { 
      label: "Total Tx", 
      value: userStats.totalTransactions.toString(), 
      change: `+${userStats.growth.overall}%`, 
      icon: Globe, 
      color: "from-amber-500 to-orange-500", 
      bg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20" 
    },
  ];

  const defaultTransactions = [
    { id: 1, name: "Payment Received", amount: "+AED 500", time: "10:30 AM", type: "income", icon: Download, status: "completed" },
    { id: 2, name: "Security Check", amount: "Completed", time: "09:45 AM", type: "security", icon: ShieldCheck, status: "completed" },
    { id: 3, name: "Transfer Sent", amount: "-AED 120", time: "Yesterday", type: "transfer", icon: Send, status: "completed" },
    { id: 4, name: "Amazon Purchase", amount: "-AED 89.99", time: "2 days ago", type: "shopping", icon: CreditCard, status: "completed" },
    { id: 5, name: "Salary Deposit", amount: "+AED 4,500", time: "3 days ago", type: "income", icon: DollarSign, status: "completed" },
  ];

  const biometricStatus = [
    { 
      icon: Fingerprint, 
      label: "Palm Scanner", 
      status: biometricData.palmEnrolled ? "Active" : "Inactive", 
      level: biometricData.palmEnrolled ? biometricData.confidence : 0 
    }
  ];

  const securityFeatures = [
    { icon: Lock, label: "Quantum Encryption", status: "Active" },
    { icon: Shield, label: "Firewall Protection", status: "Active" },
    { icon: Layers, label: "Multi-layer Security", status: "Active" },
    { icon: Radio, label: "Signal Encryption", status: "Active" },
  ];

  const refreshData = () => {
    window.location.reload();
  };

  const handleSendMoney = () => {
    navigate('/send');
  };

  const handleReceiveMoney = () => {
    navigate('/receive');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-6 overflow-hidden">
      {!backendConnected && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-sm">Offline Mode</span>
        </motion.div>
      )}

      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10">
        {/* Top Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-glow-primary">
                <Wallet className="w-7 h-7" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 border-2 border-cyan-500/30 rounded-2xl"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                PalmPay Quantum
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="text-sm text-emerald-400">
                    {backendConnected ? 'Live Data' : 'Demo Mode'}
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-400">{time}</span>
                {user && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-cyan-400">{user.fullName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-gray-800/50 border border-cyan-500/30">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">Network</span>
              </div>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${networkStrength}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <span className="text-sm text-cyan-400">{Math.round(networkStrength)}%</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-3 rounded-xl hover:bg-red-500/20 transition-colors border border-gray-700/50 text-red-400 hover:border-red-500/50"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-emerald-500/10 animate-gradient-shift"></div>
              
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                    animate={{
                      y: [0, -100],
                      x: [0, Math.sin(i) * 50],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: "100%",
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Total Quantum Balance</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                            Loading...
                          </div>
                        ) : (
                          `AED ${animatedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        )}
                      </span>
                      <motion.span 
                        className="text-lg font-semibold text-emerald-400 flex items-center gap-1"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <TrendingUp className="w-5 h-5" />
                        +4.1%
                      </motion.span>
                    </div>
                    <p className="text-gray-400 mt-2">Equivalent to ${(animatedBalance / 3.67).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm text-emerald-400">Quantum Secure</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`p-4 rounded-2xl ${stat.bg} border border-white/10 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-transform duration-300`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 rounded-xl bg-white/10">
                            <stat.icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/10">{stat.change}</span>
                        </div>
                        <p className="text-2xl font-bold mb-1">{stat.value}</p>
                        <p className="text-sm text-gray-300">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleSendMoney}
                className="glass-card backdrop-blur-xl rounded-3xl p-6 border border-blue-500/30 hover:border-blue-500/60 transition-all group hover:scale-105"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 group-hover:scale-110 transition-transform">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Send Money</h3>
                  <p className="text-gray-400 text-sm mb-4">Transfer funds using Pay ID or phone number</p>
                  <div className="text-blue-400 text-sm flex items-center gap-1">
                    Get started <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleReceiveMoney}
                className="glass-card backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/30 hover:border-emerald-500/60 transition-all group hover:scale-105"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 mb-4 group-hover:scale-110 transition-transform">
                    <Hand className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Receive with Palm</h3>
                  <p className="text-gray-400 text-sm mb-4">Accept payments using biometric palm recognition</p>
                  <div className="text-emerald-400 text-sm flex items-center gap-1">
                    Start scanning <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card backdrop-blur-xl rounded-3xl p-6 border border-purple-500/30"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Activity Overview
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm text-emerald-400">Live</span>
                  </div>
                </div>
                
                <div className="h-48 flex items-end gap-2">
                  {[40, 65, 85, 60, 90, 75, 85, 70, 80, 65, 90, 80].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.5 + index * 0.05, duration: 0.8 }}
                        className={`w-full rounded-t-lg ${
                          height > 80 
                            ? 'bg-gradient-to-t from-purple-500 to-purple-300' 
                            : height > 60
                            ? 'bg-gradient-to-t from-cyan-500 to-cyan-300'
                            : 'bg-gradient-to-t from-emerald-500 to-emerald-300'
                        }`}
                      />
                      <div className="text-xs text-gray-400 mt-2">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card backdrop-blur-xl rounded-3xl p-6 border border-cyan-500/30"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Recent Activity
                  </h3>
                  <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {(transactions.length > 0 ? transactions : defaultTransactions).map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-800/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          tx.type === 'income' ? 'bg-emerald-500/20' : 
                          tx.type === 'security' ? 'bg-cyan-500/20' : 
                          'bg-purple-500/20'
                        }`}>
                          <tx.icon className={`w-5 h-5 ${
                            tx.type === 'income' ? 'text-emerald-400' : 
                            tx.type === 'security' ? 'text-cyan-400' : 
                            'text-purple-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{tx.name}</p>
                          <p className="text-xs text-gray-400">{tx.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          tx.amount.startsWith('+') ? 'text-emerald-400' : 
                          tx.amount.startsWith('-') ? 'text-red-400' : 
                          'text-cyan-400'
                        }`}>
                          {tx.amount}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card backdrop-blur-xl rounded-3xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSendMoney}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-500/60 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Send className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Send Money</p>
                      <p className="text-xs text-gray-400">Transfer to any user</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400" />
                </button>

                <button
                  onClick={handleReceiveMoney}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 hover:border-emerald-500/60 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <Hand className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Receive with Palm</p>
                      <p className="text-xs text-gray-400">Biometric payments</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400" />
                </button>
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-card backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-emerald-400" />
                  Biometric Security
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm text-emerald-400">Active</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {biometricStatus.map((feature, index) => (
                  <div key={feature.label} className="p-3 rounded-xl bg-gray-800/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <feature.icon className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="font-medium">{feature.label}</span>
                      </div>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        feature.status === 'Active' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {feature.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${feature.level}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 1 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                        />
                      </div>
                      <span className="text-sm text-gray-400">{feature.level}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-emerald-500/20">
                <div className="grid grid-cols-2 gap-4">
                  {securityFeatures.map((feature) => (
                    <div key={feature.label} className="text-center">
                      <div className="p-2 rounded-xl bg-gray-800/50 inline-block mb-2">
                        <feature.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <p className="text-sm font-medium">{feature.label}</p>
                      <p className="text-xs text-emerald-400">{feature.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="glass-card backdrop-blur-xl rounded-3xl p-6 border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Satellite className="w-5 h-5" />
                    </div>
                    <div className="absolute -inset-2 border border-blue-500/30 rounded-xl"></div>
                  </div>
                  <div>
                    <h3 className="font-bold">Quantum Network</h3>
                    <p className="text-sm text-gray-400">Global Coverage</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-xl bg-blue-500/10">
                  <p className="text-2xl font-bold text-cyan-400">18ms</p>
                  <p className="text-xs text-gray-400">Latency</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-500/10">
                  <p className="text-2xl font-bold text-emerald-400">2.4G</p>
                  <p className="text-xs text-gray-400">Speed</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-500/10">
                  <p className="text-2xl font-bold text-amber-400">99.9%</p>
                  <p className="text-xs text-gray-400">Uptime</p>
                </div>
              </div>

              <div className="relative h-24 bg-gray-900/50 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20"></div>
                    <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
                    
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-cyan-400 rounded-full"
                        animate={{
                          x: Math.cos(i * 45 * (Math.PI / 180)) * 30,
                          y: Math.sin(i * 45 * (Math.PI / 180)) * 30,
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "linear"
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <svg className="absolute inset-0 w-full h-full">
                  {[...Array(8)].map((_, i) => {
                    const angle = i * 45 * (Math.PI / 180);
                    const x1 = 50;
                    const y1 = 50;
                    const x2 = 50 + Math.cos(angle) * 30;
                    const y2 = 50 + Math.sin(angle) * 30;
                    return (
                      <motion.line
                        key={i}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="url(#gradient)"
                        strokeWidth="1"
                        strokeDasharray="4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: i * 0.1 }}
                      />
                    );
                  })}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="glass-card backdrop-blur-xl rounded-2xl p-4 border border-gray-800"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm">
                  {backendConnected ? 'Live Data Connected' : 'Demo Mode Active'}
                </span>
              </div>
              <div className="hidden md:block w-px h-4 bg-gray-700"></div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-400">System: Optimal</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                Status: Ready for Presentation
              </div>
              <button 
                onClick={refreshData}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:shadow-glow-secondary transition-all text-sm"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Reset Demo
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}