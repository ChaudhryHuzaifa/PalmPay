// File: frontend/src/renderer/pages/SendMoney.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, User, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { apiService } from '../utils/apiService';

interface RecipientInfo {
  name: string;
  currency: string;
  exists: boolean;
  isSelf?: boolean;
}

const SendMoney: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'amount' | 'recipient' | 'confirm'>('amount');
  const [amount, setAmount] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);

  // Load user balance on mount
  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await apiService.getBalance();
      if (response.success && response.data) {
        setUserBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const handleAmountNext = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (numAmount > userBalance) {
      setError(`Insufficient balance. You have AED ${userBalance.toFixed(2)}`);
      return;
    }
    
    setStep('recipient');
    setError('');
  };

  const validatePhoneNumber = async (phone: string) => {
  if (!phone || phone.length < 10) return;
  
  setValidating(true);
  setError('');
  
  try {
    // Get the raw digits (remove all formatting)
    const rawDigits = phone.replace(/\D/g, '');
    
    // Ensure it has the country code
    let phoneToValidate = rawDigits;
    if (!rawDigits.startsWith('971') && rawDigits.length === 9) {
      phoneToValidate = `971${rawDigits}`;
    }
    
    console.log('📱 Validating phone:', phoneToValidate);
    
    const response = await apiService.validatePhoneNumber(phoneToValidate);
    
    if (response.success && response.data) {
      if (!response.data.exists) {
        setError('No user found with this number');
        setRecipientInfo(null);
      } else if (response.data.isSelf) {
        setError('You cannot send money to yourself');
        setRecipientInfo(null);
      } else {
        setRecipientInfo({
          name: response.data.name || 'User',
          currency: response.data.currency || 'AED',
          exists: true
        });
        setError('');
      }
    } else {
      setError('Could not validate phone number');
      setRecipientInfo(null);
    }
  } catch (error) {
    setError('Could not validate phone number');
    console.error('Validation error:', error);
  } finally {
    setValidating(false);
  }
};

  const handleRecipientNext = async () => {
    if (!recipientPhone) {
      setError('Please enter recipient phone number');
      return;
    }
    
    if (!recipientInfo?.exists) {
      setError('Please validate the phone number first');
      return;
    }
    
    setStep('confirm');
    setError('');
  };

  const handleSendMoney = async () => {
  if (!recipientInfo?.exists) {
    setError('Please validate recipient first');
    return;
  }
  
  setLoading(true);
  setError('');
  
  try {
    // Extract raw digits from formatted phone
    const rawDigits = recipientPhone.replace(/\D/g, '');
    
    // Ensure proper format for API
    let phoneToSend = rawDigits;
    if (!rawDigits.startsWith('971') && rawDigits.length === 9) {
      phoneToSend = `971${rawDigits}`;
    }
    
    console.log('💰 Sending to phone:', phoneToSend);
    
    const response = await apiService.sendMoney(
      phoneToSend,
      parseFloat(amount),
      description
    );
    
    if (response.success) {
      setSuccess(response.message || `AED ${amount} sent to ${recipientInfo?.name}`);
      
      // Update balance
      await loadBalance();
      
      // Clear form after 3 seconds and go back to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } else {
      setError(response.error || response.message || 'Failed to send money');
    }
  } catch (error: any) {
    setError(error.message || 'An unexpected error occurred');
  } finally {
    setLoading(false);
  }
};
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phone = value.replace(/\D/g, '');
    
    // Always ensure it starts with 971 for UAE
    let fullNumber = phone;
    if (!phone.startsWith('971') && phone.length > 0) {
      fullNumber = '971' + phone;
    }
    
    // Format as +971 XXX XXX XXX (up to 12 digits: 971 + 9)
    const formatted = fullNumber.replace(
      /(\d{3})(\d{0,3})(\d{0,3})(\d{0,3})/,
      (match, p1, p2, p3, p4) => {
        let result = `+${p1}`;
        if (p2) result += ` ${p2}`;
        if (p3) result += ` ${p3}`;
        if (p4) result += ` ${p4}`;
        return result;
      }
    );
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  
  // Format for display (keep + and spaces)
  const formatted = formatPhoneNumber(value);
  setRecipientPhone(formatted);
  
  // Extract raw digits for validation
  const rawDigits = value.replace(/\D/g, '');
  
  // Auto-validate when we have at least 11 digits (971 + 8) or 12 digits (971 + 9)
  if (rawDigits.length >= 11) {  // 971 + 8 digits
    // Ensure proper format for validation
    let phoneToValidate = rawDigits;
    if (!rawDigits.startsWith('971') && rawDigits.length === 9) {
      phoneToValidate = `971${rawDigits}`;
    }
    validatePhoneNumber(phoneToValidate);
  } else {
    setRecipientInfo(null);
    if (rawDigits.length > 0 && rawDigits.length < 11) {
      setError('Enter full phone number (8-9 digits after +971)');
    } else {
      setError('');
    }
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors border border-gray-700/50"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Send Money</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* Balance Display */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
          <p className="text-sm text-gray-400">Available Balance</p>
          <p className="text-2xl font-bold text-cyan-400">AED {userBalance.toFixed(2)}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 relative">
          {['amount', 'recipient', 'confirm'].map((s, index) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === s ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 
                  ['amount', 'recipient', 'confirm'].indexOf(step) >= index ? 'bg-blue-500/30' : 'bg-gray-800'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs mt-2 capitalize">{s}</span>
              </div>
              {index < 2 && (
                <div className="flex-1 h-0.5 bg-gray-800 mx-2 relative">
                  <div 
                    className={`absolute top-0 left-0 h-full ${
                      ['amount', 'recipient', 'confirm'].indexOf(step) > index ? 
                      'bg-gradient-to-r from-blue-500 to-cyan-500 w-full' : 'w-0'
                    } transition-all duration-300`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              className="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle size={20} />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Amount */}
        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <motion.div
              key="amount-step"
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div>
                <label className="block text-sm font-medium mb-2">Enter Amount (AED)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">AED</span>
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
                    className="w-full p-4 pl-16 bg-gray-800 rounded-xl text-2xl font-bold"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[10, 50, 100, 500].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      AED {quickAmount}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAmountNext}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 2: Recipient */}
          {step === 'recipient' && (
            <motion.div
              key="recipient-step"
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div>
                <label className="block text-sm font-medium mb-2">Recipient Phone Number</label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={handlePhoneChange}
                    placeholder="+971 5XX XXX XXX"
                    className="w-full p-4 pl-12 bg-gray-800 rounded-xl"
                    autoFocus
                  />
                  {validating && (
                    <Loader size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 animate-spin" />
                  )}
                  {recipientInfo?.exists && !validating && (
                    <CheckCircle size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400" />
                  )}
                </div>
                
                {recipientInfo && (
                  <motion.div
                    className="mt-4 p-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <User size={24} className="text-emerald-400" />
                    <div>
                      <h3 className="font-bold">{recipientInfo.name}</h3>
                      <p className="text-sm text-gray-400">Verified user • {recipientInfo.currency}</p>
                    </div>
                  </motion.div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Lunch payment, Rent, etc."
                    className="w-full p-4 bg-gray-800 rounded-xl"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  className="flex-1 p-4 bg-gray-800 rounded-xl font-bold hover:bg-gray-700 transition-colors"
                  onClick={() => setStep('amount')}
                >
                  Back
                </button>
                <button
                  className="flex-1 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRecipientNext}
                  disabled={!recipientInfo?.exists}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && (
            <motion.div
              key="confirm-step"
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Confirm Transaction</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="font-bold">AED {parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">To:</span>
                    <span className="font-bold">{recipientInfo?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span>{recipientPhone}</span>
                  </div>
                  {description && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Description:</span>
                      <span>{description}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-400">New Balance:</span>
                      <span className="font-bold text-emerald-400">
                        AED {(userBalance - parseFloat(amount)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  className="flex-1 p-4 bg-gray-800 rounded-xl font-bold hover:bg-gray-700 transition-colors disabled:opacity-50"
                  onClick={() => setStep('recipient')}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  className="flex-1 p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleSendMoney}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send AED {parseFloat(amount).toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SendMoney;