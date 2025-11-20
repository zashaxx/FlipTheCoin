
import React from 'react';
import { AchievementRarity } from '../types';

interface AchievementToastProps {
  title: string;
  icon: string;
  rarity: AchievementRarity;
  reward?: number;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ title, icon, rarity, reward = 0 }) => {
  // Map rarity to color theme
  const getThemeColor = () => {
    switch(rarity) {
        case AchievementRarity.COMMON: return '#94a3b8'; // Slate 400
        case AchievementRarity.RARE: return '#3b82f6'; // Blue 500
        case AchievementRarity.EPIC: return '#a855f7'; // Purple 500
        case AchievementRarity.MYTHIC: return '#06b6d4'; // Cyan 500
        case AchievementRarity.LEGENDARY: 
        default: return '#FFD700'; // Gold
    }
  };

  const themeColor = getThemeColor();

  return (
    <div className="fixed top-8 right-4 z-[100] animate-slide-in-right pointer-events-none">
      <div 
        className="relative bg-slate-900/90 backdrop-blur-2xl border rounded-2xl shadow-2xl w-auto min-w-[320px] p-4 flex items-center gap-5 overflow-visible group"
        style={{ 
            borderColor: `${themeColor}`, 
            boxShadow: `0 10px 50px -10px ${themeColor}60, inset 0 0 20px ${themeColor}20`
        }}
      >
        
        {/* God Rays Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
           <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] animate-spin-slow opacity-30"
                style={{ background: `conic-gradient(from 0deg, transparent 0%, ${themeColor} 10%, transparent 20%, ${themeColor} 30%, transparent 40%)` }}
           ></div>
        </div>

        {/* Animated Shine */}
        <div 
            className="absolute inset-0 -translate-x-full animate-shine pointer-events-none z-0"
            style={{ background: `linear-gradient(to right, transparent, ${themeColor}40, transparent)` }}
        ></div>

        {/* 3D Trophy Icon */}
        <div className="relative w-16 h-16 flex-shrink-0 z-10">
             {/* Glow behind trophy */}
             <div 
                className="absolute inset-0 rounded-full blur-xl animate-pulse"
                style={{ backgroundColor: themeColor, opacity: 0.6 }}
             ></div>
             
             <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] animate-elastic-bounce">
                <defs>
                    <linearGradient id={`gold-gradient-${rarity}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF" />
                        <stop offset="20%" stopColor={themeColor} />
                        <stop offset="50%" stopColor="#8B5A2B" /> 
                        <stop offset="80%" stopColor={themeColor} />
                        <stop offset="100%" stopColor="#FFF" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                {/* Cup Body */}
                <path d="M40,40 Q40,120 100,150 Q160,120 160,40 H40 Z" fill={`url(#gold-gradient-${rarity})`} stroke="#4A3000" strokeWidth="2" />
                
                {/* Handles */}
                <path d="M40,50 C10,50 10,90 40,100" fill="none" stroke={themeColor} strokeWidth="10" strokeLinecap="round" />
                <path d="M160,50 C190,50 190,90 160,100" fill="none" stroke={themeColor} strokeWidth="10" strokeLinecap="round" />
                
                {/* Stem & Base */}
                <path d="M85,150 L85,170 H70 L60,190 H140 L130,170 H115 L115,150" fill="#5e3a13" stroke={themeColor} strokeWidth="2" />
                
                {/* Star Emblem */}
                <path d="M100,70 L110,90 L135,90 L115,105 L125,125 L100,110 L75,125 L85,105 L65,90 L90,90 Z" fill="#FFF" filter="url(#glow)" />
             </svg>
        </div>

        <div className="flex flex-col flex-1 z-10 min-w-0">
          <span className="text-[10px] uppercase font-black tracking-[0.2em] mb-1 opacity-90" style={{ color: themeColor }}>
            {rarity} UNLOCKED
          </span>
          <span className="text-lg font-black text-white leading-none tracking-tight truncate mb-1 drop-shadow-md">
            {title}
          </span>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-xs text-slate-300 font-medium bg-black/30 px-2 py-0.5 rounded text-stroke-sm truncate">
               {icon} {reward > 0 ? 'Reward Claimed' : 'Unlocked'}
             </span>
             {reward > 0 && (
                <span className="text-sm font-black text-green-400 flex items-center gap-1 animate-pulse">
                   <span>+$</span>{reward}
                </span>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
