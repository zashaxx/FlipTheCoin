
import React, { useEffect } from 'react';

interface MilestoneOverlayProps {
  streak: number;
  onDismiss: () => void;
}

export const MilestoneOverlay: React.FC<MilestoneOverlayProps> = ({ streak, onDismiss }) => {
  
  // Auto dismiss after 3 seconds if user doesn't click
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getMessage = (s: number) => {
    if (s >= 100) return "DIVINE INTERVENTION!";
    if (s >= 50) return "UNSTOPPABLE FORCE!";
    if (s >= 25) return "LEGENDARY STREAK!";
    if (s >= 10) return "DOUBLE DIGITS!";
    return "MILESTONE REACHED!";
  };

  const message = getMessage(streak);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1C2B4B]/95 backdrop-blur-md cursor-pointer animate-flash-screen"
      style={{animationDuration: '0.2s', animationFillMode: 'backwards'}}
      onClick={onDismiss}
    >
      {/* Background Rays */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
         <div className="w-[150vmax] h-[150vmax] god-rays animate-spin-ray-slow opacity-50"></div>
      </div>

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
         <div 
           key={i}
           className="absolute rounded-full bg-white/40 animate-float"
           style={{
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
             width: `${Math.random() * 8}px`,
             height: `${Math.random() * 8}px`,
             animationDuration: `${2 + Math.random() * 4}s`,
             animationDelay: `${Math.random()}s`
           }}
         />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center animate-milestone-enter">
         
         <div className="text-[#FDCB2D] text-2xl font-black tracking-[0.5em] uppercase mb-8 animate-pulse drop-shadow-[0_4px_0_rgba(0,0,0,1)] text-stroke-sm">
            New Record
         </div>

         <div className="relative mb-10">
           {/* Glow behind text */}
           <div className="absolute inset-0 bg-white/20 blur-3xl transform scale-150"></div>
           
           <h1 className="text-[10rem] leading-[0.8] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-2xl text-stroke-thick animate-elastic-bounce">
             {streak}
           </h1>
           
           {/* Shiny overlay on text */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-text-shimmer bg-[length:200%_100%] mix-blend-overlay pointer-events-none"></div>
         </div>

         <div className="mt-4 bg-gradient-to-r from-[#D014FF] to-[#6A00FF] border-[6px] border-[#FFD700] px-10 py-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -rotate-3 animate-shake-intense">
            <span className="text-4xl sm:text-5xl font-black text-white uppercase text-stroke-black italic block whitespace-nowrap drop-shadow-md">
              {message}
            </span>
         </div>

         <p className="text-white/50 mt-16 animate-pulse text-sm font-bold tracking-widest uppercase">Tap to Continue</p>
      </div>
      
      {/* Confetti Explosion */}
      {Array.from({ length: 50 }).map((_, i) => (
         <div 
           key={`confetti-${i}`}
           className="absolute w-3 h-3 bg-white animate-confetti-fall"
           style={{
             left: `${Math.random() * 100}%`,
             top: '-10%',
             backgroundColor: ['#FFD700', '#FF69B4', '#00FFFF', '#FF4500'][Math.floor(Math.random() * 4)],
             animationDelay: `${Math.random() * 0.5}s`,
             animationDuration: `${2 + Math.random() * 2}s`
           }}
         />
      ))}

    </div>
  );
};
