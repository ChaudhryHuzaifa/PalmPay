import { motion } from 'framer-motion';

export const HolographicGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 99%, rgba(0, 212, 170, 0.3) 100%),
            linear-gradient(transparent 99%, rgba(0, 212, 170, 0.3) 100%)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Animated Scan Lines */}
      <motion.div
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 212, 170, 0.05) 2px,
              rgba(0, 212, 170, 0.05) 4px
            )
          `
        }}
      />
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-cyan-500/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-cyan-500/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyan-500/30" />
    </div>
  );
};