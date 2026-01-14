
import React, { useEffect, useState } from 'react';

const Cursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailing, setTrailing] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', updatePosition);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const moveTrail = () => {
      setTrailing((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.1, // Smooth delay
        y: prev.y + (position.y - prev.y) * 0.1,
      }));
      requestAnimationFrame(moveTrail);
    };
    moveTrail();
  }, [position]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block">
      {/* Main Dot */}
      <div 
        className="absolute w-3 h-3 bg-slate-900 rounded-full transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{ left: position.x, top: position.y }}
      />
      {/* Trailing Ring */}
      <div 
        className="absolute w-8 h-8 border border-slate-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
        style={{ left: trailing.x, top: trailing.y }}
      />
    </div>
  );
};

export default Cursor;
