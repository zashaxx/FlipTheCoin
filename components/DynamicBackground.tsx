
import React, { useMemo } from 'react';
import { AppState, CoinSide } from '../types';

interface DynamicBackgroundProps {
  streak: number;
  appState: AppState;
  isBroken?: boolean;
  result?: CoinSide | null;
}

// --- GRADIENT CONFIGURATION ---
const ARENAS = [
  { 
    id: 'dawn', 
    maxStreak: 5, 
    gradient: 'linear-gradient(-45deg, #2E3192, #1BFFFF, #2E3192, #1BFFFF)',
    floorColor1: '#E3F2FD',
    floorColor2: '#BBDEFB',
    bgColorTop: '#E3F2FD',
    bgColorBottom: '#0D47A1'
  },
  { 
    id: 'neon', 
    maxStreak: 15, 
    gradient: 'linear-gradient(-45deg, #C33764, #1D2671, #C33764, #1D2671)', 
    floorColor1: '#F3E5F5',
    floorColor2: '#E1BEE7',
    bgColorTop: '#E1BEE7',
    bgColorBottom: '#4A148C'
  },
  { 
    id: 'solar', 
    maxStreak: 30, 
    gradient: 'linear-gradient(-45deg, #FF512F, #DD2476, #FF512F, #DD2476)',
    floorColor1: '#FFEBEE',
    floorColor2: '#FFCDD2',
    bgColorTop: '#FFCCBC',
    bgColorBottom: '#BF360C'
  },
  { 
    id: 'void', 
    maxStreak: 50, 
    gradient: 'linear-gradient(-45deg, #141E30, #243B55, #141E30, #243B55)',
    floorColor1: '#CFD8DC',
    floorColor2: '#B0BEC5',
    bgColorTop: '#B0BEC5',
    bgColorBottom: '#263238'
  },
  { 
    id: 'ascension', 
    maxStreak: 99999, 
    gradient: 'linear-gradient(-45deg, #F2994A, #F2C94C, #F2994A, #F2C94C)',
    floorColor1: '#FFFDE7',
    floorColor2: '#FFF9C4',
    bgColorTop: '#FFF9C4',
    bgColorBottom: '#F57F17'
  }
];

const BROKEN_ARENA = {
    id: 'broken',
    gradient: 'linear-gradient(-45deg, #870000, #190a05, #870000)',
    floorColor1: '#B71C1C', 
    floorColor2: '#E57373',
    bgColorTop: '#FFCDD2',
    bgColorBottom: '#3E0000'
};

const EDGE_ARENA = {
    id: 'edge',
    maxStreak: 0, // Added to satisfy type compatibility
    gradient: 'linear-gradient(-45deg, #000000, #00FFFF, #000000, #00FFFF)',
    floorColor1: '#222', 
    floorColor2: '#111',
    bgColorTop: '#000',
    bgColorBottom: '#004444'
};

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ streak, appState, isBroken, result }) => {
  
  // Determine the target arena based on streak
  const targetArena = useMemo(() => {
    if (result === CoinSide.EDGE && appState === AppState.RESULT) return EDGE_ARENA;
    if (isBroken) return BROKEN_ARENA;
    return ARENAS.find(a => streak < a.maxStreak) || ARENAS[ARENAS.length - 1];
  }, [streak, isBroken, result, appState]);

  const getFlashColor = () => {
    if (result === CoinSide.HEADS) return 'radial-gradient(circle, rgba(46, 114, 246, 0.8) 0%, transparent 80%)';
    if (result === CoinSide.TAILS) return 'radial-gradient(circle, rgba(230, 54, 54, 0.8) 0%, transparent 80%)';
    if (result === CoinSide.EDGE) return 'radial-gradient(circle, rgba(0, 255, 255, 0.9) 0%, transparent 80%)';
    return 'none';
  };

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden bg-[#1C2B4B]">
      
      {/* BACKGROUND STACK - Crossfading layers */}
      {ARENAS.concat([EDGE_ARENA]).map((arena) => {
         const isActive = targetArena.id === arena.id;
         // Edge is special, only active if explicitly selected
         
         return (
            <div 
              key={arena.id}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Moving Gradient Layer */}
                <div 
                  className="absolute inset-0 animate-gradient-xy"
                  style={{
                    background: arena.gradient,
                    backgroundSize: '400% 400%'
                  }}
                />
                
                {/* Vignette to darken edges slightly for focus */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.3)_100%)]"></div>

                {/* Floor for this arena */}
                <div className="absolute bottom-0 left-0 w-full h-[55%] perspective-floor z-0 opacity-60">
                  <div 
                    className="floor-plane w-full h-full absolute top-0 left-0 origin-bottom animate-floor-scroll"
                    style={{
                       backgroundImage: `
                          linear-gradient(45deg, ${arena.floorColor1} 25%, ${arena.floorColor2} 25%, ${arena.floorColor2} 50%, ${arena.floorColor1} 50%, ${arena.floorColor1} 75%, ${arena.floorColor2} 75%, ${arena.floorColor2} 100%)
                       `,
                       backgroundSize: '100px 100px',
                    }}
                  />
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-transparent to-black/50"
                    style={{ 
                        background: `linear-gradient(to top, transparent, ${arena.bgColorBottom} 90%)`
                    }} 
                  ></div>
                </div>
            </div>
         );
      })}

      {/* BROKEN STATE OVERLAY (Red Flash) */}
      <div 
         className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${isBroken ? 'opacity-100' : 'opacity-0'}`}
         style={{ background: BROKEN_ARENA.gradient, backgroundSize: '200% 200%' }}
      >
         <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* UNIVERSAL EFFECTS */}

      {/* 1. Landing Flash Burst */}
      {appState === AppState.RESULT && (
        <div 
            className="absolute inset-0 z-10 animate-flash-burst pointer-events-none mix-blend-screen"
            style={{ background: getFlashColor() }}
        />
      )}

      {/* 2. Rotating Rays */}
      <div 
         className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax] opacity-20 pointer-events-none transition-all duration-1000 animate-spin-ray`}
         style={{
           background: `repeating-conic-gradient(from 0deg, white 0deg 15deg, transparent 15deg 30deg)`,
           mixBlendMode: 'overlay'
         }}
      />

      {/* 3. Ambient Particles (Global) */}
      <div className="absolute inset-0 pointer-events-none z-20">
         {Array.from({length: 25}).map((_, i) => (
            <div 
              key={i} 
              className="absolute rounded-full bg-white/30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                animationDuration: `${3 + Math.random() * 5}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
         ))}
      </div>
    </div>
  );
};
