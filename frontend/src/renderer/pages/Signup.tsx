// src/pages/Signup.tsx
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, ChevronRight, ChevronLeft, 
  CheckCircle2, Fingerprint, Cpu, Shield, Sparkles, Orbit, 
  Camera, ArrowLeft 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'react-hot-toast';
import { HolographicGrid } from '../components/ui/HolographicGrid';
import { NeuralNetwork } from '../components/ui/NeuralNetwork';
import './Signup.css';

const steps = [
  { 
    id: 1, 
    title: "Personal Details", 
    icon: User,
    description: "Enter your information",
    color: "from-emerald-500 to-cyan-500"
  },
  { 
    id: 2, 
    title: "Security PIN", 
    icon: Lock,
    description: "Set your 6-digit PIN",
    color: "from-cyan-500 to-blue-500"
  },
  { 
    id: 3, 
    title: "Palm Enrollment", 
    icon: Fingerprint,
    description: "Register your palm biometric",
    color: "from-blue-500 to-violet-500"
  },
];

const Signup = () => {
  const navigate = useNavigate();
  const { register, enrollBiometric, isLoading, error } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    pin: '',
  });
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'environment' }
      });
      if (videoRef.current) { videoRef.current.srcObject = stream; }
    } catch (error) {
      toast.error('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePalmImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  };

  const handleNext = async (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      if (currentStep === 1) { setTimeout(startCamera, 500); }
    }
  };

  const handleCaptureImage = () => {
    const imageData = capturePalmImage();
    if (imageData) {
      const newImages = [...capturedImages, imageData];
      setCapturedImages(newImages);
      setEnrollmentProgress(newImages.length);
      if (newImages.length >= 3) { toast.success('3 palm samples captured!'); }
      else { toast.success(`Sample ${newImages.length}/3 captured`); }
    }
  };

  const handleCompleteEnrollment = async () => {
    if (capturedImages.length < 3) {
      toast.error('Please capture at least 3 palm samples');
      return;
    }
    setIsEnrolling(true);
    try {
      const registrationSuccess = await register(formData.fullName, formData.email, formData.phone, formData.pin);
      if (!registrationSuccess) {
        toast.error(error || 'Registration failed');
        setIsEnrolling(false);
        return;
      }
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        toast.error('User ID not found');
        setIsEnrolling(false);
        return;
      }
      const biometricResult = await enrollBiometric(userId, capturedImages, 'RIGHT');
      if (biometricResult.success) {
        toast.success('🎉 Biometric enrollment complete!');
        stopCamera();
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Enrollment failed. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) { stopCamera(); }
    setCurrentStep(prev => prev - 1);
  };

  const handleSkipBiometric = async () => {
    const registrationSuccess = await register(formData.fullName, formData.email, formData.phone, formData.pin);
    if (registrationSuccess) {
      toast.success('Account created!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-950 via-gray-900 to-black flex flex-col items-center p-4 md:p-8 relative overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="fixed inset-0 pointer-events-none">
        <HolographicGrid />
        <NeuralNetwork density={30} />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* FIXED: Back to Home Icon Added */}
      <div className="relative z-10 w-full max-w-6xl mb-8 flex items-center justify-between">
        <Button 
          variant="glass" 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 px-4 py-2 text-sm border-cyan-500/30 hover:bg-cyan-500/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        {/* Progress Visualization */}
        <div className="flex justify-center mb-12 flex-shrink-0">
          <div className="relative">
            <div className="w-64 h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"
                  initial={{ strokeDasharray: '0 283' }}
                  animate={{ strokeDasharray: `${(currentStep + 1) * 94.3} 283` }}
                  transition={{ duration: 1 }}
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              {steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-500 ${
                    idx <= currentStep ? `bg-gradient-to-br ${step.color} shadow-[0_0_20px_rgba(6,182,212,0.4)]` : 'bg-gray-900 border border-gray-700'
                  }`}
                  style={{
                    top: `${50 - 45 * Math.cos((idx * 120) * Math.PI / 180)}%`,
                    left: `${50 + 45 * Math.sin((idx * 120) * Math.PI / 180)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {idx < currentStep ? <CheckCircle2 className="w-8 h-8 text-white" /> : <step.icon className="w-8 h-8 text-white" />}
                </motion.div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{currentStep + 1}/3</div>
                  <div className="text-sm text-gray-400">Step {currentStep + 1}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full glass-card backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-cyan-500/30 relative overflow-hidden mb-12 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/50" />
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold mb-4">
                      <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Personal Details</span>
                    </h2>
                    <p className="text-gray-400 text-lg">Set up your neural identity profile</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                    <Input label="Full Name" placeholder="Enter your full name" value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} icon={User} className="bg-gray-900/50" />
                    <Input label="Email Address" type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} icon={Mail} className="bg-gray-900/50" />
                    <Input label="Phone Number" placeholder="+971 XX XXX XXXX" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} icon={Phone} className="bg-gray-900/50" />
                  </div>
                  <div className="max-w-2xl mx-auto pt-4">
                    <Button onClick={() => handleNext({})} disabled={!formData.fullName || !formData.email || !formData.phone} className="w-full py-6 text-lg group">
                      <span className="relative z-10 flex items-center justify-center gap-3">Continue to Security <ChevronRight className="group-hover:translate-x-1 transition-transform" /></span>
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div key="step2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="text-center max-w-2xl mx-auto">
                  <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg"><Lock className="w-12 h-12 text-white" /></div>
                  <h2 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">Secure Access PIN</span></h2>
                  <p className="text-gray-400 text-lg mb-10">Choose a 6-digit PIN for instant access</p>
                  <div className="mb-12 flex justify-center">
                    <div className="grid grid-cols-6 gap-3">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <input key={i} type="password" maxLength={1} className="w-14 h-16 rounded-xl bg-gray-950 border-2 border-cyan-500/30 text-center text-2xl font-bold text-white focus:border-cyan-500 outline-none" onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const newPin = formData.pin.split('');
                            newPin[i] = val;
                            setFormData(prev => ({ ...prev, pin: newPin.join('') }));
                            if (i < 5) (document.querySelectorAll('input[type="password"]')[i + 1] as HTMLInputElement)?.focus();
                          }
                        }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="glass" onClick={handlePrevious} className="flex-1 py-6 text-lg">Back</Button>
                    <Button onClick={() => handleNext({})} disabled={formData.pin.length !== 6} className="flex-[2] py-6 text-lg">
                      Continue to Biometric
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <h2 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">Biometric Enrollment</span></h2>
                  <p className="text-gray-400 text-lg mb-10">Capture 3 high-resolution palm samples</p>
                  <div className="relative mb-10 max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-cyan-500/30 bg-black aspect-video shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-56 h-56 border-2 border-dashed border-cyan-400/50 rounded-full flex items-center justify-center">
                        <Fingerprint className="w-16 h-16 opacity-30 text-white animate-pulse" />
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                      <Button onClick={handleCaptureImage} disabled={capturedImages.length >= 3 || isEnrolling} className="px-8 py-4 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-500/50">
                        <Camera className="mr-2 w-5 h-5" /> Capture Sample {capturedImages.length + 1}/3
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center mb-10">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex items-center justify-center bg-gray-900 ${capturedImages[i] ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-gray-800'}`}>
                        {capturedImages[i] ? <img src={`data:image/jpeg;base64,${capturedImages[i]}`} className="w-full h-full object-cover" /> : <div className="w-2 h-2 rounded-full bg-gray-800" />}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
                    <Button variant="glass" onClick={handlePrevious} className="flex-1 py-6">Back</Button>
                    <Button onClick={handleCompleteEnrollment} disabled={capturedImages.length < 3 || isEnrolling} className="flex-[2] py-6 bg-gradient-to-r from-blue-600 to-violet-600 border-none">
                      {isEnrolling ? 'Processing...' : 'Finalize Registration'}
                    </Button>
                    <button onClick={handleSkipBiometric} className="text-gray-500 hover:text-gray-300 text-sm mt-2 md:mt-0">Skip for now</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="pb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black/50 backdrop-blur-md border border-white/5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-400">Quantum Grade Encryption Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;