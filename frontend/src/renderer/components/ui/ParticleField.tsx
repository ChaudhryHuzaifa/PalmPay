import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

export const ParticleField = ({ count = 30 }: { count?: number }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <AnimatePresence>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: [particle.x + '%', (particle.x + 20) + '%'],
            y: [particle.y + '%', (particle.y - 10) + '%'],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute rounded-full"
          style={{
            width: particle.size + 'px',
            height: particle.size + 'px',
            left: 0,
            top: 0,
            background: 'radial-gradient(circle, #00D4AA, transparent)',
            boxShadow: '0 0 10px #00D4AA',
          }}
        />
      ))}
    </AnimatePresence>
  );
};