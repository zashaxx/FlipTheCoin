
import React, { useEffect, useState, useRef } from 'react';
import { CoinSide, AppState } from '../types';
import { playStreakStepSound, playStreakBreakSound } from '../utils/sound';

// --- STREAK TIERS ---
const STREAK_TIERS = [
  { threshold: 1, title: "Spark", icon: "🔥", color: "#FFD700" },
  { threshold: 2, title: "Kindling", icon: "🕯️", color: "#FFC107" },
  { threshold: 3, title: "Ember", icon: "🪵", color: "#FFB300" },
  { threshold: 4, title: "Flicker", icon: "🎇", color: "#FFA000" },
  { threshold: 5, title: "Flame", icon: "🔥", color: "#FF8F00" },
  { threshold: 6, title: "Torch", icon: "🔦", color: "#FF6F00" },
  { threshold: 7, title: "Bonfire", icon: "🏕️", color: "#E65100" },
  { threshold: 8, title: "Blaze", icon: "🧨", color: "#FF5722" },
  { threshold: 9, title: "Ignition", icon: "🚀", color: "#F4511E" },
  { threshold: 10, title: "Inferno", icon: "🚒", color: "#E64A19" },
  { threshold: 12, title: "Scorcher", icon: "☀️", color: "#BF360C" },
  { threshold: 15, title: "Voltage", icon: "⚡", color: "#FFEB3B" },
  { threshold: 20, title: "Thunder", icon: "🥁", color: "#FFFF00" },
  { threshold: 25, title: "Hurricane", icon: "🌬️", color: "#00B0FF" },
  { threshold: 30, title: "Void", icon: "🕳️", color: "#536DFE" },
  { threshold: 40, title: "Cosmos", icon: "🔭", color: "#AA00FF" },
  { threshold: 50, title: "Godlike", icon: "👑", color: "#880E4F" },
  { threshold: 100, title: "Eternal", icon: "♾️", color: "#FF00FF" }
];

const getTier = (s: number) => {
  if (s <= 0) return { title: "Dormant", icon: "💤", color: "#94a3b8" };
  // Find the highest tier less than or equal to streak
  const tier = [...STREAK_TIERS].reverse().find(t => s >= t.threshold);
  return tier || STREAK_TIERS[0];
};

interface StreakDisplayProps {
  streak: number;
  highScore: number;
  currentSide: CoinSide | null;
  lastMultiplier?: number; 
  appState: AppState;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak, highScore, currentSide, lastMultiplier = 1, appState }) => {
  const [displayStreak, setDisplayStreak] = useState(streak);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const prevStreakRef = useRef(streak);

  // Intensity Helper: 0 to 1 based on streak, caps at 50
  const intensity = Math.min(streak / 50, 1);

  useEffect(() => {
    if (streak > prevStreakRef.current) {
      // STREAK INCREASED
      setIsAnimating(true);
      setIsBroken(false);
      playStreakStepSound(streak);
      
      // "Count up" effect delay
      const timer = setTimeout(() => {
        setDisplayStreak(streak);
        setIsAnimating(false);
      }, 400); 

      prevStreakRef.current = streak;
      return () => clearTimeout(timer);

    } else if (streak < prevStreakRef.current) {
      // STREAK LOST
      setIsBroken(true);
      playStreakBreakSound();
      
      const timer = setTimeout(() => {
         setDisplayStreak(streak);
         setIsBroken(false);
         prevStreakRef.current = streak;
      }, 1200);
      
      return () => clearTimeout(timer);
    } else {
      setDisplayStreak(streak);
      prevStreakRef.current = streak;
    }
  }, [streak]);

  const tier = getTier(displayStreak > 0 ? displayStreak : (isBroken ? prevStreakRef.current : 0));
  const active = displayStreak > 0 || isBroken;

  return (
    <div className="relative w-full flex flex-col items-center z-40 h-64 justify-center pointer-events-none">
       
       {/* HEAT DISTORTION FILTER DEFINITION */}
       <svg width="0" height="0" className="absolute">
         <defs>
           <filter id="heatHaze">
             <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="turbulence">
                <animate attributeName="baseFrequency" dur="10s" values="0.05;0.08;0.05" repeatCount="indefinite" />
             </feTurbulence>
             <feDisplacementMap in2="turbulence" in="SourceGraphic" scale={3 + (intensity * 5)} xChannelSelector="R" yChannelSelector="G" />
           </filter>
         </defs>
       </svg>

       {/* --- CONTAINER --- */}
       <div className={`relative transition-transform duration-300 flex flex-col items-center ${isAnimating ? 'scale-110' : 'scale-100'} ${isBroken ? 'animate-shake-intense grayscale contrast-125' : ''}`}>
          
          {/* Background Glow based on Tier Color + Intensity */}
          {active && !isBroken && (
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 blur-3xl rounded-full transition-colors duration-500" 
              style={{ 
                backgroundColor: tier.color,
                width: `${8 + (intensity * 8)}rem`,
                height: `${8 + (intensity * 8)}rem`,
                opacity: 0.4 + (intensity * 0.4)
              }}
            ></div>
          )}
          
          {/* Dynamic Embers */}
          {active && !isBroken && (
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none overflow-visible">
                {[...Array(8 + Math.floor(intensity * 10))].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full animate-ember-rise opacity-0"
                      style={{
                        backgroundColor: i % 2 === 0 ? tier.color : '#FFFFFF',
                        left: `${20 + Math.random() * 60}%`,
                        top: '70%',
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1.5 + Math.random()}s`,
                        boxShadow: `0 0 4px ${tier.color}`
                      }}
                    />
                ))}
             </div>
          )}

          {/* Main Icon Container */}
          <div className="relative flex flex-col items-center">
            
            {/* TIER ICON */}
            <div 
              className={`text-8xl filter drop-shadow-lg transition-all duration-300 relative z-10 ${isAnimating ? 'animate-elastic-bounce' : 'animate-bounce-gentle'}`}
              style={{ 
                 opacity: active ? 1 : 0.3,
                 transformOrigin: 'bottom center',
                 filter: active ? 'url(#heatHaze) drop-shadow(0 10px 10px rgba(0,0,0,0.3))' : 'none'
              }}
            >
               {tier.icon}
            </div>

            {/* BROKEN TEXT OVERLAY - MOVED UP TO NOT BLOCK */}
            {isBroken && (
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 rotate-[-5deg] z-50 w-full flex justify-center">
                  <span className="text-5xl font-black text-red-600 text-stroke-white drop-shadow-[0_5px_0_rgba(0,0,0,0.3)] whitespace-nowrap animate-pop-in">
                    CRACKED!
                  </span>
               </div>
            )}

          </div>

          {/* STREAK COUNT BUBBLE */}
          <div className={`
               relative mt-4 flex flex-col items-center justify-center
               min-w-[80px] px-4 py-1 rounded-2xl border-4 border-white/20
               bg-gradient-to-b from-white/10 to-black/40 shadow-lg backdrop-blur-md
               transform transition-all duration-300
               ${isAnimating ? 'scale-125 border-yellow-400/50' : 'scale-100'}
               ${streak > 10 ? 'animate-shake-intense' : ''}
            `}>
               <span 
                 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 leading-none drop-shadow-sm transition-all duration-300"
                 style={{ 
                   fontFamily: '"Lilita One", cursive', 
                   textShadow: isAnimating ? `0 0 20px ${tier.color}` : '0 4px 0 rgba(0,0,0,0.3)',
                   transform: isAnimating ? `scale(${1 + intensity * 0.2})` : 'scale(1)'
                 }}
               >
                 {displayStreak}
               </span>
               
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mt-1">
                  {active ? tier.title : "Streak"}
               </span>
            </div>

       </div>

       {/* PARTICLES ON LEVEL UP */}
       {isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
             {Array.from({ length: 12 + Math.floor(intensity * 20) }).map((_, i) => (
                <div 
                   key={i}
                   className="absolute w-2 h-2 rounded-full animate-confetti-fall"
                   style={{
                      backgroundColor: tier.color,
                      left: '50%',
                      top: '50%',
                      animationDuration: '1s',
                      transform: `rotate(${i * (360/12)}deg) translateY(-60px)`
                   }}
                />
             ))}
          </div>
       )}
    </div>
  );
};
