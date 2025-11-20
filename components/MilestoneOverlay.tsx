
import React, { useEffect } from 'react';

interface MilestoneOverlayProps {
  streak: number;
  isEdge?: boolean;
  onDismiss: () => void;
}

export const MilestoneOverlay: React.FC<MilestoneOverlayProps> = ({ streak, isEdge = false, onDismiss }) => {
  
  // Auto dismiss after 4 seconds if user doesn't click (longer for Edge)
  useEffect(() => {
    const duration = isEdge ? 10000 : 4000;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, isEdge]);

  const getMessage = (s: number) => {
    if (isEdge) return "IMPOSSIBLE OUTCOME";
    if (s >= 100) return "DIVINE INTERVENTION!";
    if (s >= 50) return "UNSTOPPABLE FORCE!";
    if (s >= 25) return "LEGENDARY RECORD!";
    if (s >= 10) return "NEW HIGH SCORE!";
    return "NEW HIGH SCORE!";
  };

  const message = getMessage(streak);
  const colorClass = isEdge ? 'text-cyan-400' : 'text-[#FDCB2D]';
  const bgClass = isEdge ? 'from-cyan-900 to-black' : 'from-[#0F172A] to-black';

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-xl cursor-pointer animate-flash-screen bg-gradient-to-br ${bgClass} opacity-95`}
      style={{animationDuration: '0.3s', animationFillMode: 'both'}}
      onClick={onDismiss}
    >
      {/* Clean Radial Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vmax] h-[100vmax] animate-pulse ${isEdge ? 'bg-[radial-gradient(circle,rgba(0,255,255,0.2)_0%,transparent_70%)]' : 'bg-[radial-gradient(circle,rgba(255,215,0,0.15)_0%,transparent_70%)]'}`}></div>
      </div>

      {/* Rotating Rays */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-40">
         <div 
            className="w-[150vmax] h-[150vmax] animate-spin-ray-slow" 
            style={{
                background: `repeating-conic-gradient(from 0deg, ${isEdge ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.1)'} 0deg 10deg, transparent 10deg 20deg)`
            }}
         ></div>
      </div>

      {/* Floating Particles */}
      {Array.from({ length: 40 }).map((_, i) => (
         <div 
           key={i}
           className={`absolute rounded-full animate-float ${isEdge ? 'bg-cyan-200 shadow-[0_0_10px_#00FFFF]' : 'bg-white/60'}`}
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
      <div className="relative z-10 flex flex-col items-center animate-milestone-enter px-6 text-center">
         
         <div className={`${colorClass} text-xl md:text-3xl font-black tracking-[0.4em] uppercase mb-6 animate-pulse drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-stroke-sm text-center`}>
            {isEdge ? 'Reality Glitch' : 'New Personal Best'}
         </div>

         <div className="relative mb-10 group">
           {/* Solid Glow behind text */}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-2xl rounded-full scale-150 ${isEdge ? 'bg-cyan-500/30' : 'bg-white/10'}`}></div>
           
           {isEdge ? (
             <div className="relative">
                <h1 className="text-[5rem] md:text-[7rem] leading-[0.8] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 drop-shadow-2xl text-stroke-thick animate-shake-intense">
                  EDGE
                </h1>
                <div className="text-2xl font-bold text-cyan-200 uppercase tracking-widest mt-4 animate-pulse">Probability: 0.001%</div>
             </div>
           ) : (
             <h1 className="text-[8rem] md:text-[12rem] leading-[0.8] font-black text-white drop-shadow-2xl text-stroke-thick animate-elastic-bounce">
               {streak}
             </h1>
           )}
         </div>

         <div className={`mt-4 border-[4px] px-10 py-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] transform -rotate-2 animate-shake-intense relative overflow-hidden
            ${isEdge 
              ? 'bg-gradient-to-r from-cyan-600 to-blue-900 border-cyan-400' 
              : 'bg-gradient-to-r from-[#D014FF] to-[#6A00FF] border-[#FFD700]'
            }
         `}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
            <span className="relative text-3xl sm:text-5xl font-black text-white uppercase text-stroke-black italic block whitespace-nowrap drop-shadow-md">
              {message}
            </span>
         </div>

         <p className="text-white/50 mt-16 animate-pulse text-sm font-bold tracking-widest uppercase">Tap to Continue</p>
      </div>
      
      {/* Confetti Explosion */}
      {Array.from({ length: isEdge ? 80 : 40 }).map((_, i) => (
         <div 
           key={`confetti-${i}`}
           className="absolute w-3 h-3 rounded-sm animate-confetti-fall"
           style={{
             left: `${Math.random() * 100}%`,
             top: '-10%',
             backgroundColor: isEdge 
                ? ['#00FFFF', '#FFFFFF', '#0088FF'][Math.floor(Math.random() * 3)]
                : ['#FFD700', '#FF69B4', '#00FFFF', '#FF4500'][Math.floor(Math.random() * 4)],
             animationDelay: `${Math.random() * 0.3}s`,
             animationDuration: `${1.5 + Math.random() * 2}s`,
             boxShadow: isEdge ? '0 0 10px cyan' : 'none'
           }}
         />
      ))}

    </div>
  );
};
