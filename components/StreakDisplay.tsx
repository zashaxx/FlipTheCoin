
import React, { useEffect, useState, useRef } from 'react';
import { CoinSide, AppState } from '../types';
import { playStreakStepSound, playStreakBreakSound } from '../utils/sound';

// --- STREAK TIERS ---
const STREAK_TIERS = [
  { threshold: 1, title: "Spark", icon: "🔥", color: "#FFD700" },
  { threshold: 2, title: "Kindling", icon: "🕯️", color: "#FFC107" },
  { threshold: 3, title: "Ember", icon: "🪵", color: "#FFB300" },
  { threshold: 5, title: "Flame", icon: "🔥", color: "#FF8F00" },
  { threshold: 10, title: "Inferno", icon: "🚒", color: "#E64A19" },
  { threshold: 20, title: "Thunder", icon: "⚡", color: "#FFFF00" },
  { threshold: 50, title: "Godlike", icon: "👑", color: "#FF00FF" },
  { threshold: 100, title: "Eternal", icon: "♾️", color: "#00FFFF" }
];

const getTier = (s: number) => {
  if (s <= 0) return { title: "Dormant", icon: "💤", color: "#94a3b8" };
  const tier = [...STREAK_TIERS].reverse().find(t => s >= t.threshold);
  return tier || STREAK_TIERS[0];
};

interface StreakDisplayProps {
  streak: number;
  highScore: number;
  currentSide: CoinSide | null;
  lastMultiplier?: number; 
  activeMultiplier?: number | null;
  appState: AppState;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak, highScore, currentSide, lastMultiplier = 1, activeMultiplier, appState }) => {
  const [displayStreak, setDisplayStreak] = useState(streak);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTextPopping, setIsTextPopping] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const prevStreakRef = useRef(streak);

  const intensity = Math.min(streak / 50, 1);
  const tier = getTier(displayStreak > 0 ? displayStreak : (isBroken ? prevStreakRef.current : 0));
  const active = displayStreak > 0 || isBroken;
  const isMilestone = active && displayStreak > 0 && displayStreak % 5 === 0;

  useEffect(() => {
    if (streak > prevStreakRef.current) {
      setIsAnimating(true);
      setIsTextPopping(true);
      setIsBroken(false);
      playStreakStepSound(streak);
      
      const timer = setTimeout(() => {
        setDisplayStreak(streak);
        setIsAnimating(false);
      }, 400);
      
      const textTimer = setTimeout(() => {
        setIsTextPopping(false);
      }, 300);

      prevStreakRef.current = streak;
      return () => { clearTimeout(timer); clearTimeout(textTimer); };
    } else if (streak < prevStreakRef.current) {
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

  return (
    <div className="relative w-full flex flex-col items-center z-40 h-[320px] justify-center pointer-events-none transition-all duration-500">
       
       {/* --- HIGH SCORE BADGE --- */}
       <div className="absolute top-0 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-1 text-xs font-bold text-yellow-400 uppercase tracking-widest shadow-lg mb-4 z-10">
          Best Streak: {highScore}
       </div>

       {/* --- CONTAINER --- */}
       <div className={`relative transition-all duration-300 flex flex-col items-center ${isAnimating ? 'scale-110' : (active ? 'scale-105' : 'scale-100')} ${isBroken ? 'animate-shake-intense grayscale' : ''}`}>
          
          {/* TIER ICON */}
          <div 
            className={`text-8xl filter drop-shadow-2xl transition-all duration-300 relative z-20 mb-2 ${active ? 'animate-bounce-gentle' : 'opacity-50 grayscale'}`}
            style={{ 
               transformOrigin: 'bottom center',
               textShadow: active ? `0 10px 30px ${tier.color}` : 'none',
               transform: isAnimating ? 'scale(1.3)' : 'scale(1)'
            }}
          >
             {tier.icon}
          </div>

          <div className="flex items-center justify-center relative w-full">
            
            {/* ROTATING BORDER */}
            <div className={`absolute inset-[-8px] rounded-2xl opacity-80 blur-md transition-opacity duration-500 ${active ? 'animate-spin-slow opacity-100' : 'opacity-0'}`}
                 style={{ 
                    background: active ? `conic-gradient(from 0deg, transparent 0%, ${tier.color} 25%, transparent 50%, ${tier.color} 75%, transparent 100%)` : 'none',
                    animationDuration: `${Math.max(1, 10 - intensity * 8)}s`
                 }} 
            />

            {/* STREAK COUNT BOX */}
            <div className={`
                 relative flex flex-col items-center justify-center z-10
                 min-w-[160px] h-[100px] px-8 rounded-2xl
                 bg-[#1C2B4B]
                 border-[4px]
                 shadow-[0_15px_30px_rgba(0,0,0,0.6),inset_0_2px_10px_rgba(255,255,255,0.1)]
                 transform transition-all duration-200
                 ${isMilestone && !isBroken ? 'animate-pulse-gold' : ''}
                 ${isAnimating 
                    ? 'border-white shadow-[0_0_60px_rgba(255,255,255,0.5)]' 
                    : 'border-slate-700'
                 }
              `}
              style={{
                borderColor: active ? tier.color : undefined
              }}
            >
                 {/* Gloss */}
                 <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/20 to-transparent rounded-t-xl pointer-events-none"></div>

                 <span 
                   className={`text-7xl font-black text-white leading-none drop-shadow-lg transition-all duration-300 text-stroke-sm ${isTextPopping ? 'animate-pop-text' : ''}`}
                   style={{ 
                     fontFamily: '"Lilita One", cursive', 
                     textShadow: isAnimating ? `0 0 30px ${tier.color}` : '0 4px 0 rgba(0,0,0,0.5)',
                     opacity: displayStreak === 0 && !isBroken ? 0.3 : 1
                   }}
                 >
                   {displayStreak}
                 </span>
                 
                 <div className={`mt-1 px-3 py-0.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10`}>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: active ? tier.color : '#64748b' }}>
                        {active ? tier.title : "Streak"}
                     </span>
                 </div>
            </div>

            {/* POWER UP BADGE */}
            {activeMultiplier && (
              <div className="absolute left-[100%] top-1/2 -translate-y-1/2 z-30 animate-pop-in ml-4">
                  <div className="bg-gradient-to-br from-yellow-300 to-yellow-600 border-2 border-white rounded-xl shadow-xl px-3 py-2 transform rotate-12 animate-pulse">
                    <div className="text-[10px] font-black text-yellow-900 uppercase leading-none mb-1">Bonus</div>
                    <div className="text-3xl font-black text-white text-stroke-black drop-shadow-sm leading-none">x{activeMultiplier}</div>
                  </div>
              </div>
            )}
          </div>

          {/* STREAK LOST TEXT */}
          {isBroken && (
             <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 z-50 w-[300px] flex justify-center">
                <div className="bg-[#D32F2F] text-white px-6 py-3 rounded-xl border-4 border-white shadow-2xl animate-pop-in transform -rotate-3">
                    <span className="text-3xl font-black text-stroke-black uppercase tracking-widest whitespace-nowrap drop-shadow-md">
                      CRACKED!
                    </span>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};
