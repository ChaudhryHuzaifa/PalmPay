// src/components/PalmScanner.tsx (Production)
import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Scan, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiService } from '../../utils/apiservice';

interface PalmScannerProps {
  onScanComplete: (imageBase64: string) => void;
  onError?: (error: string) => void;
  mode?: 'register' | 'payment';
  autoCapture?: boolean;
}

const PalmScanner: React.FC<PalmScannerProps> = ({
  onScanComplete,
  onError,
  mode = 'register',
  autoCapture = true
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [scanning, setScanning] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [quality, setQuality] = useState<number>(0);

  const videoConstraints = {
    facingMode: { exact: 'environment' }, // Use back camera
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  };

  const captureImage = useCallback(() => {
    if (!webcamRef.current) return null;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError('Could not capture image');
      onError?.('Could not capture image');
      return null;
    }
    
    return imageSrc;
  }, [onError]);

  const startCountdown = () => {
    setCountdown(3);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          setTimeout(() => {
            const image = captureImage();
            if (image) {
              setCaptured(true);
              onScanComplete(image);
              setScanning(false);
            }
          }, 500);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const handleScanClick = () => {
    setScanning(true);
    setError(null);
    setCaptured(false);
    
    if (autoCapture) {
      // Start auto-capture after 2 seconds
      setTimeout(() => {
        startCountdown();
      }, 2000);
    }
  };

  const handleManualCapture = () => {
    const image = captureImage();
    if (image) {
      setCaptured(true);
      onScanComplete(image);
      setScanning(false);
    }
  };

  return (
    <div className="w-full">
      {/* Scanner UI */}
      {!scanning ? (
        <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl">
          <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {mode === 'register' ? 'Register Your Palm' : 'Scan Palm for Payment'}
          </h3>
          <p className="text-gray-600 mb-4">
            {mode === 'register' 
              ? 'Hold your palm open in front of the camera'
              : 'Customer: Show your palm to complete payment'}
          </p>
          <button
            onClick={handleScanClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center mx-auto gap-2"
          >
            <Scan size={20} />
            Start Scanning
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Webcam Feed */}
          <div className="relative rounded-xl overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-[400px] object-cover"
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Palm Guide */}
              <div className="w-64 h-64 border-4 border-green-500 rounded-full opacity-50 animate-pulse" />
              
              {/* Countdown */}
              {countdown && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="text-6xl font-bold text-white bg-black bg-opacity-50 rounded-full w-24 h-24 flex items-center justify-center">
                    {countdown}
                  </div>
                </div>
              )}
              
              {/* Instructions */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white text-lg font-medium bg-black bg-opacity-50 p-2 rounded">
                  {mode === 'register' 
                    ? 'Hold your palm steady inside the circle'
                    : 'Customer: Please show your palm'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="mt-4 flex justify-between items-center">
            {!autoCapture && !captured && (
              <button
                onClick={handleManualCapture}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Scan size={20} />
                Capture Now
              </button>
            )}
            
            <button
              onClick={() => {
                setScanning(false);
                setCaptured(false);
                setError(null);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Status Messages */}
      {captured && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <span>Palm captured successfully!</span>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
          <XCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Tips */}
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Tips for best results:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Ensure good lighting</li>
          <li>Keep palm fully open</li>
          <li>Hold steady for 2-3 seconds</li>
          <li>Keep palm parallel to camera</li>
        </ul>
      </div>
    </div>
  );
};

export default PalmScanner;