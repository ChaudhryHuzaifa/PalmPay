import { forwardRef } from 'react'
import type { LucideProps } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.FC<LucideProps>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="text-sm text-gray-300 font-medium">{label}</label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          )}
          <input
            ref={ref}
            className={`
              w-full ${Icon ? 'pl-12' : 'px-6'} py-4 bg-palm-glass backdrop-blur rounded-2xl
              border ${error ? 'border-red-500' : 'border-white/10'}
              text-white placeholder-gray-400
              focus:outline-none focus:border-palm-primary/50 focus:ring-2 focus:ring-palm-primary/20
              transition-all duration-300
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)