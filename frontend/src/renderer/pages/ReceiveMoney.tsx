// src/pages/ReceivePayment.tsx - SIMPLE CAMERA IMPLEMENTATION LIKE SIGNUP.TSX
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Camera, CheckCircle, Scan, Fingerprint } from 'lucide-react';
import { apiService } from '../utils/apiService';
import { toast } from 'react-hot-toast';

const ReceivePayment: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'amount' | 'scan' | 'success'>('amount');
  const [amount, setAmount] = useState('250');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-focus on amount input
  useEffect(() => {
    if (step === 'amount') {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) input.focus();
    }
  }, [step]);

  // Start camera when scan step is active - EXACTLY LIKE SIGNUP.TSX
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'environment'
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Camera access denied. Please enable camera permissions.');
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  // Stop camera - EXACTLY LIKE SIGNUP.TSX
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // Capture palm image - EXACTLY LIKE SIGNUP.TSX
  const capturePalmImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64 (remove data URL prefix)
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  };

  // Handle camera when step changes
  useEffect(() => {
    if (step === 'scan') {
      // Small delay to ensure component is rendered
      setTimeout(() => {
        startCamera();
      }, 100);
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [step]);

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (numAmount > 10000) {
      setError('Maximum amount is AED 10,000');
      return;
    }
    setError('');
    setStep('scan');
  };

  const handlePalmScan = async (imageBase64?: string) => {
    setLoading(true);
    setError('');
    
    let capturedImage = imageBase64;
    
    // If no image provided, capture from camera
    if (!capturedImage) {
      capturedImage = capturePalmImage();
      if (!capturedImage) {
        setLoading(false);
        toast.error('Failed to capture palm image');
        return;
      }
    }
    
    try {
      // Call biometric payment endpoint
      const response = await apiService.biometricPayment(
        parseFloat(amount),
        capturedImage
      );
      
      if (response.success) {
        setSuccessData(response.data);
        toast.success(`Received AED ${amount} successfully!`);
        
        // Update local user balance
        const user = apiService.getUser();
        if (user) {
          user.balance += parseFloat(amount);
          localStorage.setItem('auth_user', JSON.stringify(user));
        }
        
        setStep('success');
        
        // Auto-redirect after 5 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      } else {
        setError(response.error || 'Payment failed');
        toast.error('Payment failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick amount buttons
  const quickAmounts = [100, 250, 500, 1000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors border border-gray-700/50"
            disabled={loading}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Receive Payment</h1>
          <div className="text-sm text-gray-400">
            {step === 'amount' ? 'Enter Amount' : 
             step === 'scan' ? 'Scan Palm' : 'Success!'}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['amount', 'scan', 'success'].map((s, index) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                  ${step === s ? 'bg-blue-500' : 
                    index < ['amount', 'scan', 'success'].indexOf(step) ? 'bg-green-500' : 'bg-gray-700'}`}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm hidden sm:inline">
                  {s === 'amount' ? 'Amount' : s === 'scan' ? 'Scan' : 'Success'}
                </span>
              </div>
              {index < 2 && <div className="flex-1 h-1 bg-gray-700 mx-4"></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Amount Input */}
        {step === 'amount' && (
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 animate-fadeIn">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <DollarSign size={24} />
              Enter Payment Amount
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Amount in AED
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl text-gray-400">AED</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = value.split('.');
                    if (parts.length > 2) return;
                    if (parts[1] && parts[1].length > 2) return;
                    setAmount(value);
                  }}
                  placeholder="0.00"
                  className="w-full p-4 pl-20 bg-gray-700 rounded-xl text-3xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className={`p-3 rounded-lg transition-all ${amount === quickAmount.toString() 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    AED {quickAmount}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleAmountSubmit}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              Continue to Palm Scan →
            </button>
          </div>
        )}

        {/* Step 2: Palm Scan - SIMPLE CAMERA LIKE SIGNUP.TSX */}
        {step === 'scan' && (
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 animate-fadeIn">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Camera size={24} />
              Customer Palm Scan
            </h2>
            
            <div className="mb-6">
              <div className="p-4 bg-gray-700/50 rounded-xl mb-6">
                <p className="text-gray-300">
                  Amount: <span className="text-white font-bold text-2xl">AED {parseFloat(amount).toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Ask the customer to show their palm to the camera
                </p>
              </div>
              
              <div className="relative">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-gray-900/50 rounded-xl">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-300">Processing payment...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Camera Feed - EXACTLY LIKE SIGNUP.TSX */}
                    <div className="rounded-3xl overflow-hidden border-2 border-blue-500/30 bg-black">
                      <div className="relative aspect-video">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        
                        {/* Guidance Overlay - SIMPLIFIED */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-64 h-64 border-2 border-dashed border-cyan-400/50 rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                            <Fingerprint className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Position palm here</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Capture Button */}
                    <button
                      onClick={() => handlePalmScan()}
                      disabled={loading}
                      className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      <Scan size={20} />
                      Capture Palm & Process Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  stopCamera();
                  setStep('amount');
                  setError('');
                }}
                className="flex-1 p-4 bg-gray-700 rounded-xl font-bold hover:bg-gray-600 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  // Test payment without camera
                  setLoading(true);
                  setTimeout(() => {
                    handlePalmScan('demo_palm_image_base64');
                  }, 1000);
                }}
                className="flex-1 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:opacity-90 transition-all text-sm"
                disabled={loading}
              >
                Test Payment
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-300">
                Make sure the palm is clearly visible in the circle. The camera light should turn on.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && successData && (
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Payment Received!</h2>
              <p className="text-gray-300 mb-6">The transaction was successful</p>
              
              <div className="w-full max-w-md space-y-4">
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    AED {parseFloat(amount).toFixed(2)}
                  </div>
                  <p className="text-gray-400">Amount received</p>
                </div>
                
                <div className="p-4 bg-gray-700/30 rounded-xl text-left">
                  <p className="text-sm text-gray-400">From</p>
                  <p className="font-bold">Customer</p>
                </div>
                
                <div className="p-4 bg-gray-700/30 rounded-xl text-left">
                  <p className="text-sm text-gray-400">To</p>
                  <p className="font-bold">Your Account</p>
                </div>
                
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <p className="text-sm text-gray-400">New Balance</p>
                  <p className="text-2xl font-bold">
                    AED {((apiService.getUser()?.balance || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full mt-8 p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl font-bold hover:opacity-90 transition-all"
              >
                Return to Dashboard
              </button>
              
              <p className="text-sm text-gray-400 mt-4">
                Auto-redirecting in 5 seconds...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivePayment;