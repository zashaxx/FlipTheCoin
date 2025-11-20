
import React, { useMemo } from 'react';
import { AppState } from '../types';

interface DynamicBackgroundProps {
  streak: number;
  appState: AppState;
}

// Arena Configuration
const ARENAS = [
  { 
    id: 'training', 
    maxStreak: 5, 
    floorColor1: '#FF9800', // Orange
    floorColor2: '#FFE0B2', 
    bgColorTop: '#FFCC80',
    bgColorBottom: '#E65100'
  },
  { 
    id: 'spell_valley', 
    maxStreak: 15, 
    floorColor1: '#673AB7', // Purple
    floorColor2: '#D1C4E9',
    bgColorTop: '#B39DDB',
    bgColorBottom: '#4527A0'
  },
  { 
    id: 'royal_arena', 
    maxStreak: 30, 
    floorColor1: '#1E88E5', // Blue
    floorColor2: '#BBDEFB',
    bgColorTop: '#90CAF9',
    bgColorBottom: '#0D47A1'
  },
  { 
    id: 'legendary', 
    maxStreak: 50, 
    floorColor1: '#E91E63', // Pink/Magenta
    floorColor2: '#F8BBD0',
    bgColorTop: '#F48FB1',
    bgColorBottom: '#880E4F'
  },
  { 
    id: 'ultimate', 
    maxStreak: 99999, 
    floorColor1: '#FFD700', // Gold
    floorColor2: '#FFF9C4',
    bgColorTop: '#FFF59D',
    bgColorBottom: '#F57F17'
  }
];

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ streak, appState }) => {
  
  const arena = useMemo(() => {
    return ARENAS.find(a => streak < a.maxStreak) || ARENAS[ARENAS.length - 1];
  }, [streak]);

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden">
      {/* 1. Gradient Background (Sky) */}
      <div 
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `linear-gradient(to bottom, ${arena.bgColorTop}, ${arena.bgColorBottom})`
        }}
      />

      {/* 2. Radial Glow Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vmax] h-[100vmax] opacity-60 bg-[radial-gradient(circle,rgba(255,255,255,0.3)_0%,transparent_60%)] pointer-events-none" />

      {/* 3. Rotating Rays */}
      <div 
         className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax] opacity-20 pointer-events-none transition-all duration-1000 ${appState === AppState.FLIPPING ? 'animate-spin-ray-fast' : 'animate-spin-ray-slow'}`}
         style={{
           background: `repeating-conic-gradient(from 0deg, white 0deg 15deg, transparent 15deg 30deg)`
         }}
      />

      {/* 4. 3D Checkered Floor */}
      <div className="absolute bottom-0 left-0 w-full h-[50%] perspective-floor z-0">
        <div 
          className="floor-plane w-full h-full absolute top-0 left-0 origin-bottom animate-floor-scroll opacity-40"
          style={{
             backgroundImage: `
                linear-gradient(45deg, ${arena.floorColor1} 25%, ${arena.floorColor2} 25%, ${arena.floorColor2} 50%, ${arena.floorColor1} 50%, ${arena.floorColor1} 75%, ${arena.floorColor2} 75%, ${arena.floorColor2} 100%)
             `,
             backgroundSize: '100px 100px'
          }}
        />
        {/* Fade out floor at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20 pointer-events-none" style={{background: `linear-gradient(to top, transparent, ${arena.bgColorBottom})`}}></div>
      </div>
      
      {/* 5. Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
         {Array.from({length: 20}).map((_, i) => (
            <div 
              key={i} 
              className="absolute rounded-full bg-white/30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 2}px`,
                height: `${Math.random() * 10 + 2}px`,
                animationDuration: `${3 + Math.random() * 5}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
         ))}
      </div>
    </div>
  );
};
