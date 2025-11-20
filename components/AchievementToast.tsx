
import React from 'react';

interface AchievementToastProps {
  title: string;
  icon: string;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ title, icon }) => {
  return (
    <div className="fixed top-8 right-4 z-[100] animate-slide-in-right pointer-events-none">
      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-[#FFD700]/50 rounded-2xl shadow-[0_10px_40px_-10px_rgba(253,203,45,0.5)] w-auto min-w-[280px] p-4 flex items-center gap-4 overflow-hidden group">
        
        {/* Animated Background Shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/10 to-transparent -translate-x-full animate-shine pointer-events-none"></div>

        {/* Better Trophy Icon */}
        <div className="relative w-14 h-14 flex-shrink-0">
             <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-xl opacity-20 animate-pulse"></div>
             <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                <defs>
                    <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF7CC" />
                        <stop offset="20%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#FDB931" />
                        <stop offset="100%" stopColor="#9E7C0C" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur"/>
                        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                </defs>
                
                {/* Base */}
                <path d="M30,85 Q50,95 70,85 L75,90 L25,90 Z" fill="#8B5A2B" />
                {/* Cup */}
                <path d="M20,20 Q20,60 50,75 Q80,60 80,20 L20,20 Z" fill="url(#trophyGold)" stroke="#B8860B" strokeWidth="2" />
                {/* Handles */}
                <path d="M20,25 C5,25 5,45 20,50" fill="none" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />
                <path d="M80,25 C95,25 95,45 80,50" fill="none" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />
                {/* Star */}
                <path d="M50,35 L54,45 L65,45 L56,52 L59,62 L50,55 L41,62 L44,52 L35,45 L46,45 Z" fill="#FFF" opacity="0.8" />
             </svg>
        </div>

        <div className="flex flex-col flex-1 z-10">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#FFD700] mb-0.5">Achievement Unlocked</span>
          <span className="text-xl font-black text-white font-sans leading-none tracking-tight">{title}</span>
          <span className="text-xs text-slate-400 font-medium mt-1">{icon} Reward Claimed</span>
        </div>
      </div>
    </div>
  );
};
