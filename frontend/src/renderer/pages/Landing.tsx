// src/pages/Landing.tsx - FIXED VERSION
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Hand, Shield, Zap, Lock, Sparkles, Orbit, Cpu, Brain, 
  Fingerprint, Globe, Satellite, Wifi, Server,
  ChevronRight, ChevronLeft, Star, Target, Rocket, Crown
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const features = [
  {
    icon: Shield,
    title: "Quantum-Secure Biometrics",
    description: "Military-grade palm vein recognition with quantum-resistant encryption.",
    visual: "🔐",
    gradient: "from-blue-600 via-cyan-500 to-emerald-500",
    stats: ["99.99% Accuracy", "0.0001% False Positive", "Quantum Safe"]
  },
  {
    icon: Zap,
    title: "Hyper-Speed Transactions",
    description: "Complete payments in 0.3 seconds with neural network processing.",
    visual: "⚡",
    gradient: "from-emerald-500 via-cyan-400 to-blue-500",
    stats: ["<300ms Processing", "10K TPS", "Near-Zero Latency"]
  },
  {
    icon: Globe,
    title: "Global Neural Network",
    description: "Borderless payments powered by decentralized quantum nodes.",
    visual: "🌐",
    gradient: "from-purple-600 via-pink-500 to-orange-500",
    stats: ["200+ Countries", "Zero Fees", "Instant Settlement"]
  },
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Self-learning system that adapts to your spending patterns.",
    visual: "🧠",
    gradient: "from-violet-600 via-purple-500 to-pink-500",
    stats: ["Predictive AI", "Fraud Detection", "Smart Insights"]
  }
];

const Landing = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentFeature = features[currentSlide];
  const IconComponent = currentFeature.icon;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white overflow-hidden relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Advanced Background Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24px,rgba(6,182,212,0.05)_25px,transparent_26px),linear-gradient(90deg,transparent_24px,rgba(6,182,212,0.05)_25px,transparent_26px)] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.2)_0%,transparent_70%)]" />
      </div>

      {/* Floating Particles */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[1px] h-[1px] bg-cyan-400 rounded-full"
          initial={{
            x: Math.random() * 100 + 'vw',
            y: Math.random() * 100 + 'vh',
            scale: 0
          }}
          animate={{
            x: Math.random() * 100 + 'vw',
            y: Math.random() * 100 + 'vh',
            scale: [0, 1, 0],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}

      {/* Animated Circuit Lines */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
            style={{
              top: `${(i + 1) * 12}%`,
              left: '10%',
              right: '10%',
              filter: 'blur(1px)'
            }}
            animate={{
              backgroundPosition: ['0% center', '100% center', '0% center']
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Interactive Light Effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(6,182,212,0.15) 0%, transparent 50%)`,
          transition: 'background 0.3s ease'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Animated Header */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative px-8 py-6 border-b border-cyan-900/30 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center border border-cyan-500/30">
                  <Hand className="w-8 h-8 text-cyan-400" />
                </div>
                <motion.div
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-2 border-2 border-dashed border-cyan-400/30 rounded-3xl"
                />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent animate-gradient">
                  PalmPay Quantum
                </h1>
                <p className="text-sm text-cyan-400/70 font-mono">v2.0.1 • Neural Network Active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-xl border border-cyan-900/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-cyan-300">Live Network</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Total Nodes</p>
                  <p className="text-lg font-bold text-cyan-300">1,247</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/login')}
                variant="glass"
                className="border border-cyan-500/30 hover:border-cyan-500"
              >
                Login
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="max-w-7xl w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Main Hero */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-300">NEURAL PAYMENT SYSTEM ONLINE</span>
                  </div>
                  
                  <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent animate-gradient">
                      The Future of
                    </span>
                    <br />
                    <motion.span
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
                    >
                      Quantum Finance
                    </motion.span>
                  </h1>
                  
                  <p className="text-xl text-gray-400 leading-relaxed">
                    Experience the next evolution in digital payments with our 
                    <span className="text-cyan-300 font-medium"> quantum-secure biometric system</span>. 
                    Your palm is your key to instant, borderless transactions powered by 
                    <span className="text-emerald-300 font-medium"> neural network intelligence</span>.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "2.4M+", label: "Active Users", icon: Target },
                    { value: "$18.7B", label: "Processed", icon: Rocket },
                    { value: "99.99%", label: "Uptime", icon: Crown }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-gray-900/50 to-black/50 p-4 rounded-2xl border border-cyan-900/30 backdrop-blur-sm"
                    >
                      <stat.icon className="w-6 h-6 text-cyan-400 mb-2" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Button 
                    onClick={() => navigate('/signup')}
                    size="lg"
                    className="flex-1 py-6 text-lg group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <Rocket className="w-6 h-6" />
                      Sign Up
                      <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                  
                  <Button 
                    variant="glass"
                    onClick={() => navigate('/login')}
                    size="lg"
                    className="flex-1 py-6 text-lg group relative overflow-hidden border border-cyan-500/30"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <Orbit className="w-6 h-6" />
                      Login
                    </span>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right Column - Feature Carousel */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                {/* Carousel Container */}
                <div className="relative h-[500px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className={`absolute inset-0 bg-gradient-to-br ${currentFeature.gradient} rounded-3xl p-8 shadow-2xl`}
                    >
                      {/* Feature Content */}
                      <div className="h-full flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="text-sm text-white/70">FEATURE {(currentSlide + 1)}/4</div>
                                <div className="text-2xl font-bold text-white">{currentFeature.title}</div>
                              </div>
                            </div>
                            <div className="text-5xl">{currentFeature.visual}</div>
                          </div>
                          
                          <p className="text-lg text-white/90 mb-8">
                            {currentFeature.description}
                          </p>
                        </div>
                        
                        {/* Stats */}
                        <div className="space-y-4">
                          <div className="h-px bg-white/20" />
                          <div className="grid grid-cols-3 gap-3">
                            {currentFeature.stats.map((stat, idx) => (
                              <div key={idx} className="text-center">
                                <div className="text-sm text-white/70">{stat}</div>
                                <div className="text-xs text-white/50 mt-1">Performance</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Carousel Controls */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {features.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentSlide 
                            ? 'w-8 bg-gradient-to-r from-cyan-500 to-blue-500' 
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + features.length) % features.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % features.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="px-8 pb-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-gray-900/50 via-black/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-cyan-900/30">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-300">POWERED BY QUANTUM TECH STACK</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { name: "React 18", color: "from-cyan-500 to-blue-500" },
                  { name: "TypeScript", color: "from-blue-500 to-indigo-500" },
                  { name: "WebRTC", color: "from-emerald-500 to-cyan-500" },
                  { name: "WebGL", color: "from-purple-500 to-pink-500" },
                  { name: "TensorFlow", color: "from-orange-500 to-red-500" },
                  { name: "WebAssembly", color: "from-yellow-500 to-orange-500" },
                  { name: "IPFS", color: "from-blue-400 to-cyan-400" },
                  { name: "Quantum", color: "from-violet-500 to-purple-500" }
                ].map((tech, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`bg-gradient-to-br ${tech.color} p-4 rounded-xl text-center backdrop-blur-sm`}
                  >
                    <div className="text-sm font-bold text-white">{tech.name}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity }
        }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{ 
          rotate: [360, 0],
          scale: [1.1, 1, 1.1]
        }}
        transition={{ 
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
          scale: { duration: 5, repeat: Infinity }
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
      />
    </div>
  );
};

export default Landing;