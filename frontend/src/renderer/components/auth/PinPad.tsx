import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft } from 'lucide-react'
import { Button } from '../ui/Button'
import { toast } from 'react-hot-toast'

interface PinPadProps {
  onSuccess: () => void
  onBack?: () => void
}

export const PinPad = ({ onSuccess, onBack }: PinPadProps) => {
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleNumber = (num: string) => {
    if (pin.length < 6) setPin(pin + num)
  }

  const handleDelete = () => setPin(pin.slice(0, -1))

  const handleSubmit = async () => {
    if (pin.length !== 6) {
      toast.error('Please enter 6-digit PIN')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSuccess()
    } catch (error) {
      toast.error('Invalid PIN. Try again.')
      setPin('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Lock className="w-12 h-12 text-palm-primary mb-6" />
      
      <div className="flex gap-3 mb-8">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`
              w-4 h-4 rounded-full border-2 transition-all
              ${i < pin.length ? 'bg-palm-primary border-palm-primary scale-110' : 'border-gray-400'}
            `}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((item) => (
          <motion.button
            key={item}
            whileHover={{ scale: item ? 1.1 : 1 }}
            whileTap={{ scale: item ? 0.9 : 1 }}
            onClick={() => {
              if (item === '⌫') handleDelete()
              else if (item) handleNumber(item)
            }}
            disabled={!item || isLoading}
            className={`
              aspect-square rounded-2xl text-2xl font-bold
              ${item ? 'bg-palm-glass hover:bg-white/10' : ''}
              ${item === '⌫' ? 'text-red-400 hover:text-red-300' : 'text-white'}
              transition-all disabled:opacity-0
            `}
          >
            {item}
          </motion.button>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={pin.length !== 6 || isLoading} className="w-full max-w-xs">
        {isLoading ? 'Verifying...' : 'Confirm'}
      </Button>

      {onBack && (
        <button
          onClick={onBack}
          className="mt-4 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
      )}
    </div>
  )
}