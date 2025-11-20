
import React, { useMemo } from 'react';
import { AppState, CoinSide } from '../types';

interface DynamicBackgroundProps {
  streak: number;
  appState: AppState;
  isBroken?: boolean;
  result?: CoinSide | null;
}

// Arena Configuration - Improved Colors for better distinction
const ARENAS = [
  { 
    id: 'training', 
    maxStreak: 5, 
    floorColor1: '#FF9800', // Vibrant Orange
    floorColor2: '#FFCC80', 
    bgColorTop: '#FFE0B2',
    bgColorBottom: '#E65100'
  },
  { 
    id: 'spell_valley', 
    maxStreak: 15, 
    floorColor1: '#7E57C2', // Deep Purple
    floorColor2: '#D1C4E9',
    bgColorTop: '#D1C4E9',
    bgColorBottom: '#4527A0'
  },
  { 
    id: 'royal_arena', 
    maxStreak: 30, 
    floorColor1: '#0277BD', // Rich Blue
    floorColor2: '#81D4FA',
    bgColorTop: '#B3E5FC',
    bgColorBottom: '#01579B'
  },
  { 
    id: 'legendary', 
    maxStreak: 50, 
    floorColor1: '#D81B60', // Hot Pink/Red
    floorColor2: '#F48FB1',
    bgColorTop: '#F8BBD0',
    bgColorBottom: '#880E4F'
  },
  { 
    id: 'ultimate', 
    maxStreak: 99999, 
    floorColor1: '#FFD600', // Pure Gold
    floorColor2: '#FFF9C4',
    bgColorTop: '#FFF59D',
    bgColorBottom: '#FBC02D'
  }
];

const BROKEN_ARENA = {
    id: 'broken',
    floorColor1: '#B71C1C', 
    floorColor2: '#E57373',
    bgColorTop: '#FFCDD2',
    bgColorBottom: '#3E0000'
};

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ streak, appState, isBroken, result }) => {
  
  const arena = useMemo(() => {
    if (isBroken) return BROKEN_ARENA;
    return ARENAS.find(a => streak < a.maxStreak) || ARENAS[ARENAS.length - 1];
  }, [streak, isBroken]);

  // Calculate animation speeds - Faster as streak gets higher
  const raySpeed = Math.max(4, 25 - (streak * 0.4)); 
  const floorSpeed = Math.max(2, 20 - (streak * 0.5)); 

  const getFlashColor = () => {
    if (result === CoinSide.HEADS) return 'radial-gradient(circle, rgba(46, 114, 246, 0.8) 0%, transparent 80%)';
    if (result === CoinSide.TAILS) return 'radial-gradient(circle, rgba(230, 54, 54, 0.8) 0%, transparent 80%)';
    if (result === CoinSide.EDGE) return 'radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, transparent 80%)';
    return 'none';
  };

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden">
      {/* 1. Gradient Background (Sky) */}
      <div 
        className="absolute inset-0 transition-colors duration-1000 ease-in-out"
        style={{
          background: `linear-gradient(to bottom, ${arena.bgColorTop}, ${arena.bgColorBottom})`
        }}
      />
      
      {/* Permanent Vignette for Depth (Gradient Effect) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-0"></div>

      {/* 2. Landing Flash Burst - Stronger now */}
      {appState === AppState.RESULT && (
        <div 
            className="absolute inset-0 z-0 animate-flash-burst pointer-events-none mix-blend-screen"
            style={{ background: getFlashColor() }}
        />
      )}

      {/* 3. Radial Glow Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vmax] h-[120vmax] opacity-50 bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,transparent_60%)] pointer-events-none" />

      {/* 4. Rotating Rays (Dynamic Speed) */}
      <div 
         className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax] opacity-30 pointer-events-none transition-all duration-1000 animate-spin-ray`}
         style={{
           background: `repeating-conic-gradient(from 0deg, white 0deg 15deg, transparent 15deg 30deg)`,
           animationDuration: `${appState === AppState.FLIPPING ? 1 : raySpeed}s`
         }}
      />

      {/* 5. 3D Checkered Floor (Dynamic Speed) */}
      <div className="absolute bottom-0 left-0 w-full h-[55%] perspective-floor z-0">
        <div 
          className="floor-plane w-full h-full absolute top-0 left-0 origin-bottom animate-floor-scroll opacity-60"
          style={{
             backgroundImage: `
                linear-gradient(45deg, ${arena.floorColor1} 25%, ${arena.floorColor2} 25%, ${arena.floorColor2} 50%, ${arena.floorColor1} 50%, ${arena.floorColor1} 75%, ${arena.floorColor2} 75%, ${arena.floorColor2} 100%)
             `,
             backgroundSize: '100px 100px',
             animationDuration: `${floorSpeed}s`
          }}
        />
        {/* Fade out floor at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/30 pointer-events-none" style={{background: `linear-gradient(to top, transparent, ${arena.bgColorBottom})`}}></div>
      </div>
      
      {/* 6. Ambient Particles (More intensity based on streak) */}
      <div className="absolute inset-0 pointer-events-none z-0">
         {Array.from({length: 20 + Math.min(streak, 40)}).map((_, i) => (
            <div 
              key={i} 
              className="absolute rounded-full bg-white/40 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 8 + 2}px`,
                height: `${Math.random() * 8 + 2}px`,
                animationDuration: `${3 + Math.random() * 5}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
         ))}
      </div>
    </div>
  );
};