// src/pages/Login.tsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Hand, Lock, Shield, Sparkles, Orbit, Fingerprint,
  ChevronRight, Smartphone, Key, Eye, EyeOff
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [pinDigits, setPinDigits] = useState<string[]>(Array(6).fill(''));
  // FIXED: Changed from hardcoded number to empty string
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const { login, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
    hiddenInputRef.current?.focus();
  }, [clearError]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    const newDigits = Array(6).fill('');
    val.split('').forEach((digit, i) => {
      newDigits[i] = digit;
    });
    setPinDigits(newDigits);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pinDigits.join('').length === 6) {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    const pin = pinDigits.join('');
    if (pin.length < 6) {
      toast.error('Please enter a valid 6-digit PIN');
      return;
    }
    const success = await login(phoneNumber, pin);
    if (success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(error || 'Login failed');
    }
  };

  const handlePinInput = (num: number | string) => {
    if (typeof num === 'number') {
      const emptyIndex = pinDigits.findIndex(d => d === '');
      if (emptyIndex !== -1) {
        const newDigits = [...pinDigits];
        newDigits[emptyIndex] = num.toString();
        setPinDigits(newDigits);
        if (hiddenInputRef.current) hiddenInputRef.current.value = newDigits.join('');
      }
    }
  };

  const handleBackspace = () => {
    const lastIndex = pinDigits.findLastIndex(d => d !== '');
    if (lastIndex !== -1) {
      const newDigits = [...pinDigits];
      newDigits[lastIndex] = '';
      setPinDigits(newDigits);
      if (hiddenInputRef.current) hiddenInputRef.current.value = newDigits.join('');
    }
  };

  const clearPin = () => {
    setPinDigits(Array(6).fill(''));
    if (hiddenInputRef.current) hiddenInputRef.current.value = '';
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen bg-black text-white overflow-y-auto relative custom-scrollbar"
      onMouseMove={handleMouseMove}
    >
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="numeric"
        value={pinDigits.join('')}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none"
        autoFocus
      />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24px,rgba(6,182,212,0.05)_25px,transparent_26px),linear-gradient(90deg,transparent_24px,rgba(6,182,212,0.05)_25px,transparent_26px)] bg-[size:50px_50px]" />
        <div 
            className="absolute inset-0 transition-opacity duration-300"
            style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(6,182,212,0.15) 0%, transparent 50%)`,
            }}
        />
      </div>

      <div className="relative z-10 min-h-full flex flex-col">
        <motion.div className="relative px-8 py-6 border-b border-cyan-900/30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center border border-cyan-500/30">
                <Hand className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  PalmPay Quantum
                </h1>
              </div>
            </div>
            <Button onClick={() => navigate('/')} variant="glass">← Home</Button>
          </div>
        </motion.div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-4xl">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-8 lg:sticky lg:top-8">
                <div className="space-y-6">
                  <h1 className="text-5xl font-bold leading-tight">
                    Neural<br />
                    <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Authentication</span>
                  </h1>
                  <p className="text-xl text-gray-400">Access your quantum-secure account with multi-layer verification.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[{ icon: Shield, t: "Encrypted" }, { icon: Fingerprint, t: "Biometric" }].map((f, i) => (
                    <div key={i} className="bg-gray-900/50 p-4 rounded-2xl border border-cyan-900/30">
                      <f.icon className="w-6 h-6 text-cyan-400 mb-2" />
                      <div className="text-sm font-semibold">{f.t}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-cyan-900/30 shadow-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold mb-2">Access Account</h2>
                    <p className="text-gray-400 text-sm">Enter your phone number and 6-digit secure PIN</p>
                </div>

                <div className="mb-6">
                  {/* FIXED: Removed readOnly and added onChange */}
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-black/50 border border-cyan-900/30 rounded-xl px-6 py-4 text-white text-center mb-8 focus:border-cyan-500 outline-none transition-all"
                  />
                  
                  <div 
                    className="grid grid-cols-6 gap-2 mb-8 cursor-text"
                    onClick={() => hiddenInputRef.current?.focus()}
                  >
                    {pinDigits.map((d, i) => (
                      <div key={i} className={`h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold ${d ? 'border-cyan-500 bg-cyan-500/10' : 'border-cyan-900/30'}`}>
                        {d ? (showPin ? d : '•') : ''}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'clear', 0, 'back'].map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                            if (key === 'clear') clearPin();
                            else if (key === 'back') handleBackspace();
                            else handlePinInput(key as number);
                        }}
                        className="h-14 rounded-xl bg-gray-800/50 hover:bg-cyan-500/20 border border-cyan-900/30 transition-all font-bold"
                      >
                        {key === 'clear' ? 'C' : key === 'back' ? '⌫' : key}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleLogin}
                  disabled={pinDigits.includes('') || !phoneNumber || isLoading}
                  className="w-full py-6 text-lg bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                  {isLoading ? "Authenticating..." : "Secure Login"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 mt-auto text-center">
            <p className="text-xs text-gray-600">PalmPay Quantum v2.0.1 • Neural Payment Network</p>
        </div>
      </div>
    </div>
  );
};

export default Login;