// src/components/ui/NeuralNetwork.tsx - FIXED VERSION
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface NeuralNetworkProps {
  density?: number;
  speed?: number;
  className?: string;
}

export const NeuralNetwork = ({ 
  density = 30, 
  speed = 1,
  className = "" 
}: NeuralNetworkProps) => {
  const [nodes, setNodes] = useState<Array<{id: string, x: number, y: number, connections: number[]}>>([]);

  useEffect(() => {
    // Generate unique nodes with unique connections
    const newNodes = Array.from({ length: density }, (_, i) => ({
      id: `node-${i}-${Date.now()}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      connections: Array.from({ length: 3 }, () => 
        Math.floor(Math.random() * density)
      ).filter((conn, idx, arr) => arr.indexOf(conn) === idx) // Remove duplicates
    }));
    
    // Ensure all connections are unique pairs
    const connectionPairs = new Set<string>();
    newNodes.forEach((node, nodeIndex) => {
      node.connections.forEach(targetId => {
        const pair = [nodeIndex, targetId].sort().join('-');
        if (!connectionPairs.has(pair) && nodeIndex !== targetId) {
          connectionPairs.add(pair);
        }
      });
    });

    setNodes(newNodes);
  }, [density]);

  const connectionPairs = new Set<string>();
  nodes.forEach((node, nodeIndex) => {
    node.connections.forEach(targetId => {
      const pair = [nodeIndex, targetId].sort().join('-');
      if (!connectionPairs.has(pair) && nodeIndex !== targetId) {
        connectionPairs.add(pair);
      }
    });
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Background Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      
      {/* Neural Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute w-1 h-1 bg-cyan-500/40 rounded-full"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Neural Connections - Only render unique pairs */}
      {Array.from(connectionPairs).map((pair) => {
        const [sourceIdx, targetIdx] = pair.split('-').map(Number);
        const source = nodes[sourceIdx];
        const target = nodes[targetIdx];
        
        if (!source || !target) return null;
        
        const angle = Math.atan2(target.y - source.y, target.x - source.x) * (180 / Math.PI);
        const distance = Math.sqrt(
          Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)
        );

        return (
          <motion.div
            key={`connection-${pair}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
            style={{
              left: `${Math.min(source.x, target.x)}%`,
              top: `${Math.min(source.y, target.y)}%`,
              width: `${distance}%`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 0'
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        );
      })}
      
      {/* Scanning Beams */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`beam-${i}`}
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
          animate={{
            y: ['0%', '100%']
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 1.3,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};