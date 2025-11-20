
import React, { useEffect } from 'react';

interface MilestoneOverlayProps {
  streak: number;
  onDismiss: () => void;
}

export const MilestoneOverlay: React.FC<MilestoneOverlayProps> = ({ streak, onDismiss }) => {
  
  // Auto dismiss after 4 seconds if user doesn't click
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getMessage = (s: number) => {
    if (s >= 100) return "DIVINE INTERVENTION!";
    if (s >= 50) return "UNSTOPPABLE FORCE!";
    if (s >= 25) return "LEGENDARY RECORD!";
    if (s >= 10) return "NEW HIGH SCORE!";
    return "NEW HIGH SCORE!";
  };

  const message = getMessage(streak);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/95 backdrop-blur-lg cursor-pointer animate-flash-screen"
      style={{animationDuration: '0.3s', animationFillMode: 'backwards'}}
      onClick={onDismiss}
    >
      {/* Clean Radial Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vmax] h-[100vmax] bg-[radial-gradient(circle,rgba(255,215,0,0.15)_0%,transparent_70%)] animate-pulse"></div>
      </div>

      {/* Rotating Rays - Simplified to avoid texture glitching */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-30">
         <div 
            className="w-[150vmax] h-[150vmax] animate-spin-ray-slow" 
            style={{
                background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.1) 0deg 10deg, transparent 10deg 20deg)'
            }}
         ></div>
      </div>

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
         <div 
           key={i}
           className="absolute rounded-full bg-white/60 animate-float"
           style={{
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
             width: `${Math.random() * 6 + 2}px`,
             height: `${Math.random() * 6 + 2}px`,
             animationDuration: `${2 + Math.random() * 4}s`,
             animationDelay: `${Math.random()}s`
           }}
         />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center animate-milestone-enter">
         
         <div className="text-[#FDCB2D] text-xl md:text-2xl font-black tracking-[0.4em] uppercase mb-6 animate-pulse drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-stroke-sm text-center px-4">
            New Personal Best
         </div>

         <div className="relative mb-10">
           {/* Solid Glow behind text */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/10 blur-2xl rounded-full scale-150"></div>
           
           <h1 className="text-[8rem] md:text-[12rem] leading-[0.8] font-black text-white drop-shadow-2xl text-stroke-thick animate-elastic-bounce">
             {streak}
           </h1>
         </div>

         <div className="mt-4 bg-gradient-to-r from-[#D014FF] to-[#6A00FF] border-[4px] border-[#FFD700] px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -rotate-2 animate-shake-intense relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
            <span className="relative text-3xl sm:text-4xl font-black text-white uppercase text-stroke-black italic block whitespace-nowrap drop-shadow-md">
              {message}
            </span>
         </div>

         <p className="text-white/50 mt-16 animate-pulse text-sm font-bold tracking-widest uppercase">Tap to Continue</p>
      </div>
      
      {/* Confetti Explosion */}
      {Array.from({ length: 40 }).map((_, i) => (
         <div 
           key={`confetti-${i}`}
           className="absolute w-3 h-3 rounded-sm animate-confetti-fall"
           style={{
             left: `${Math.random() * 100}%`,
             top: '-10%',
             backgroundColor: ['#FFD700', '#FF69B4', '#00FFFF', '#FF4500'][Math.floor(Math.random() * 4)],
             animationDelay: `${Math.random() * 0.3}s`,
             animationDuration: `${1.5 + Math.random() * 2}s`
           }}
         />
      ))}

    </div>
  );
};