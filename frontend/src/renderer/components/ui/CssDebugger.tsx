// src/renderer/components/ui/CssDebugger.tsx
import React, { useEffect, useState } from 'react';

export default function CssDebugger() {
  const [tailwindWorking, setTailwindWorking] = useState(false);
  const [cssWorking, setCssWorking] = useState(false);

  useEffect(() => {
    // Test if Tailwind is working
    const testElement = document.createElement('div');
    testElement.className = 'hidden';
    testElement.style.cssText = 'position: absolute; top: -100px;';
    document.body.appendChild(testElement);
    
    const computed = window.getComputedStyle(testElement);
    setTailwindWorking(computed.display === 'none');
    
    document.body.removeChild(testElement);
    
    // Test if CSS is loading
    setCssWorking(document.styleSheets.length > 0);
    
    console.log('CSS Debug Report:');
    console.log('- Tailwind working:', tailwindWorking);
    console.log('- CSS sheets:', document.styleSheets.length);
    console.log('- Body background:', window.getComputedStyle(document.body).backgroundColor);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 10000,
      border: '1px solid #333',
    }}>
      <div>CSS Status:</div>
      <div style={{ color: tailwindWorking ? 'lime' : 'red' }}>
        Tailwind: {tailwindWorking ? '✓' : '✗'}
      </div>
      <div style={{ color: cssWorking ? 'lime' : 'red' }}>
        CSS Files: {cssWorking ? '✓' : '✗'}
      </div>
    </div>
  );
}