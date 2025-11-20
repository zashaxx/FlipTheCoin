
import React, { useEffect, useRef, useMemo } from 'react';
import { CoinSide, AppState } from '../types';

interface CoinProps {
  appState: AppState;
  result: CoinSide;
  onFlip: () => void;
  onSpinComplete: () => void;
  isAutoSpin: boolean;
  isStopping: boolean; 
}

// --- CONSTANTS ---
const COIN_SIZE = 220; // px
const COIN_THICKNESS = 14; 
const SIDE_SEGMENTS = 60;

// SVG ICONS WITH ADVANCED SHADERS
const CrownIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}>
    <defs>
      <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF9C4" /> {/* Light Yellow */}
        <stop offset="40%" stopColor="#FBC02D" /> {/* Gold */}
        <stop offset="100%" stopColor="#F57F17" /> {/* Dark Orange Gold */}
      </linearGradient>
      <filter id="crownEmboss" x="-20%" y="-20%" width="140%" height="140%">
         <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
         <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
         <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.8" specularExponent="25" lightingColor="#FFF" result="specOut">
            <fePointLight x="-5000" y="-10000" z="10000"/>
         </feSpecularLighting>
         <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
         <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
      </filter>
    </defs>
    {/* Crown Shape */}
    <path 
        d="M20 68 L20 35 L35 50 L50 15 L65 50 L80 35 L80 68 Q50 78 20 68 Z" 
        fill="url(#crownGradient)" 
        stroke="#F9A825" 
        strokeWidth="0.5"
        filter="url(#crownEmboss)"
    />
    {/* Jewels */}
    <circle cx="20" cy="35" r="3" fill="#D32F2F" stroke="#880E4F" strokeWidth="0.5" />
    <circle cx="50" cy="15" r="4" fill="#D32F2F" stroke="#880E4F" strokeWidth="0.5" />
    <circle cx="80" cy="35" r="3" fill="#D32F2F" stroke="#880E4F" strokeWidth="0.5" />
    {/* Base Decoration */}
    <path d="M25 68 Q50 76 75 68" stroke="#B8860B" strokeWidth="1" fill="none" opacity="0.6" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}>
    <defs>
      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF9C4" /> 
        <stop offset="40%" stopColor="#FBC02D" /> 
        <stop offset="100%" stopColor="#F57F17" /> 
      </linearGradient>
      <filter id="starEmboss" x="-20%" y="-20%" width="140%" height="140%">
         <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
         <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
         <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.8" specularExponent="25" lightingColor="#FFF" result="specOut">
            <fePointLight x="-5000" y="-10000" z="10000"/>
         </feSpecularLighting>
         <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
         <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
      </filter>
    </defs>
    <path 
        d="M50 8 L65 39 L99 39 L72 60 L82 94 L50 74 L18 94 L28 60 L1 39 L35 39 Z" 
        fill="url(#starGradient)" 
        stroke="#F9A825" 
        strokeWidth="0.5"
        filter="url(#starEmboss)"
    />
  </svg>
);

// --- CSS FOR REALISTIC METAL SHADER ---
const METAL_FACE_STYLE: React.CSSProperties = {
    // High-fidelity gold gradient simulating realistic light reflection
    background: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771C 100%)',
    // Complex Shadow for Rim Depth
    boxShadow: `
        inset 0 0 0 2px rgba(255,255,255,0.4),
        inset 0 0 5px 4px rgba(0,0,0,0.3),
        inset 0 0 0 8px #B8860B,
        inset 0 0 20px 12px rgba(0,0,0,0.6),
        0 0 4px 2px rgba(0,0,0,0.3)
    `
};

// --- TEXTURE OVERLAY COMPONENT ---
// Adds Noise (Patina) and Micro-scratches for realism
const TextureOverlay = () => (
    <div className="absolute inset-0 rounded-full pointer-events-none z-0 overflow-hidden">
        {/* 1. Fine Grain (Patina/Matte) */}
        <svg className="absolute inset-0 w-full h-full opacity-40" style={{ mixBlendMode: 'multiply' }}>
            <filter id="noiseFilter">
                <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="2" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
        
        {/* 2. Specular Sheen (Light hitting curve) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.7)_0%,transparent_45%)] mix-blend-overlay"></div>
        
        {/* 3. Micro Scratches (Imperfections) */}
         <svg className="absolute inset-0 w-full h-full opacity-30" style={{ mixBlendMode: 'soft-light' }}>
            <filter id="scratchFilter">
                 <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
                 <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 -1 1" in="noise" result="diff"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#scratchFilter)"/>
         </svg>
    </div>
);

export const Coin: React.FC<CoinProps> = ({ appState, result, onFlip, onSpinComplete, isAutoSpin, isStopping }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLDivElement>(null);
  
  // --- PHYSICS STATE ---
  const state = useRef({
    rotationY: 0,
    rotationX: 0,
    rotationZ: 0,
    velocityY: 0,
    isDragging: false,
    interactionTiltX: 0,
    interactionTiltY: 0
  });

  const reqRef = useRef<number>(0);
  const stopTargetRef = useRef<number | null>(null);
  const hasTriggeredComplete = useRef(false);

  // Generate side segments once
  const sideSegments = useMemo(() => {
    return Array.from({ length: SIDE_SEGMENTS }).map((_, i) => {
      const angle = (i / SIDE_SEGMENTS) * 360;
      const segmentWidth = (Math.PI * COIN_SIZE) / SIDE_SEGMENTS + 0.5; // Slight overlap
      return (
        <div
          key={i}
          className="absolute backface-hidden"
          style={{
            width: `${segmentWidth}px`,
            height: `${COIN_THICKNESS}px`,
            // Correct Geometry: Rotate Z to distribute around circle, Translate Y to rim, Rotate X to align thickness with Z
            transform: `rotateZ(${angle}deg) translateY(-${COIN_SIZE / 2 - 0.5}px) rotateX(90deg)`,
            // More metallic cylinder shader - vertical gradient relative to the strip thickness
            background: `linear-gradient(to bottom, #aa771c 0%, #fcf6ba 25%, #bf953f 50%, #b38728 75%, #aa771c 100%)`,
            left: '50%',
            top: '50%',
            marginLeft: `-${segmentWidth / 2}px`,
            marginTop: `-${COIN_THICKNESS / 2}px`,
            filter: 'brightness(0.9)'
          }}
        />
      );
    });
  }, []);

  // --- INTERACTION HANDLERS ---
  useEffect(() => {
    const handleMove = (x: number, y: number) => {
      if (state.current.isDragging) return;
      const { innerWidth, innerHeight } = window;
      const normX = (x - innerWidth / 2) / (innerWidth / 2);
      const normY = (y - innerHeight / 2) / (innerHeight / 2);
      state.current.interactionTiltX = -normY * 15;
      state.current.interactionTiltY = normX * 15;
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // --- ANIMATION LOOP ---
  useEffect(() => {
    if (appState === AppState.FLIPPING && !isStopping && !isAutoSpin) {
        stopTargetRef.current = null;
        hasTriggeredComplete.current = false;
        state.current.velocityY = 40 + Math.random() * 10; 
        
        const currentRot = state.current.rotationY;
        const isHeads = result === CoinSide.HEADS; 
        const targetMod = isHeads ? 0 : 180;
        const minSpins = 1800;
        let target = Math.ceil((currentRot + minSpins) / 360) * 360 + targetMod;
        if (Math.abs(target % 360 - targetMod) > 1) target += 180;
        stopTargetRef.current = target;

    } else if (isAutoSpin && !isStopping) {
        stopTargetRef.current = null;
        hasTriggeredComplete.current = false;
    }

    const loop = () => {
      const s = state.current;

      if (appState === AppState.FLIPPING) {
         if (isAutoSpin && !isStopping) {
            if (s.velocityY < 40) s.velocityY += 1.0;
            s.rotationY += s.velocityY;
         } else {
            if (isStopping && stopTargetRef.current === null) {
                const currentRot = s.rotationY;
                let targetMod = 0;
                if (result === CoinSide.HEADS) targetMod = 0;
                else if (result === CoinSide.TAILS) targetMod = 180;
                else if (result === CoinSide.EDGE) targetMod = 90; // Stop showing side

                const spins = 4;
                let target = Math.ceil((currentRot + 360 * spins) / 360) * 360 + targetMod;
                
                const rem = target % 360;
                // Normalize target logic
                if (result === CoinSide.EDGE) {
                   // If targetMod is 90, ensure we land on 90, 450, etc.
                   if (Math.abs(rem - 90) > 1) {
                       // If we are at 0 or 180, add 90
                       target += (90 - rem) + (rem > 90 ? 360 : 0); 
                   }
                } else if (result === CoinSide.HEADS) {
                   if (Math.abs(rem) > 1) target += (360 - rem);
                } else {
                   if (Math.abs(rem - 180) > 1) target += (180 - (rem > 180 ? rem - 360 : rem));
                }
                stopTargetRef.current = target;
            }

            if (stopTargetRef.current !== null) {
                const diff = stopTargetRef.current - s.rotationY;
                const distRatio = Math.min(1, Math.abs(diff) / 1000);
                
                if (Math.abs(diff) > 0.5) {
                    const p = 0.05 + (1 - distRatio) * 0.1; 
                    s.rotationY += diff * p;
                } else {
                    s.rotationY = stopTargetRef.current;
                    s.velocityY = 0;
                    if (!hasTriggeredComplete.current) {
                        hasTriggeredComplete.current = true;
                        onSpinComplete();
                    }
                }
            }
         }
         s.rotationX += (0 - s.rotationX) * 0.1;
         s.rotationZ += (0 - s.rotationZ) * 0.1;
      } else {
         // Idle / Result
         
         if (result === CoinSide.EDGE && appState === AppState.RESULT) {
             // Edge balance wobble
             const wobble = Math.sin(Date.now() * 0.005) * 2; 
             s.rotationX += (0 - s.rotationX) * 0.1; // Vertical (0)
             s.rotationZ += (wobble - s.rotationZ) * 0.1; // Slight tilt
         } else {
             s.rotationX += (s.interactionTiltX - s.rotationX) * 0.1;
             s.rotationZ += (s.interactionTiltY - s.rotationZ) * 0.1;
         }
      }

      if (coinRef.current) {
        coinRef.current.style.transform = `
            translateY(${appState === AppState.IDLE ? Math.sin(Date.now() * 0.002)*10 : 0}px)
            rotateX(${s.rotationX}deg) 
            rotateZ(${s.rotationZ}deg) 
            rotateY(${s.rotationY}deg)
        `;
      }
      reqRef.current = requestAnimationFrame(loop);
    };
    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [appState, isAutoSpin, isStopping, result, onSpinComplete]);

  return (
    <div 
      className="relative group z-20 perspective-1000"
      style={{ width: COIN_SIZE, height: COIN_SIZE }}
      onClick={appState === AppState.IDLE || appState === AppState.RESULT ? onFlip : undefined}
    >
      <div ref={containerRef} className="w-full h-full flex items-center justify-center preserve-3d">
         <div ref={coinRef} className="relative w-full h-full transform-style-3d will-change-transform">
             
             {/* --- FRONT FACE (HEADS / CROWN) --- */}
             <div 
                className="absolute inset-0 rounded-full backface-hidden flex items-center justify-center"
                style={{ 
                    transform: `translateZ(${COIN_THICKNESS / 2}px)`,
                    ...METAL_FACE_STYLE
                }}
             >
                <TextureOverlay />
                
                {/* Inner Recessed Ring for extra bump detail */}
                <div className="absolute inset-[12px] rounded-full border border-yellow-600/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] z-10"></div>
                
                {/* Icon Container with Emboss Effect */}
                <div className="w-[65%] h-[65%] transform transition-transform duration-200 relative z-20">
                    <CrownIcon />
                </div>
             </div>

             {/* --- SIDE FACES (EDGE) --- */}
             {sideSegments}

             {/* --- BACK FACE (TAILS / STAR) --- */}
             <div 
                className="absolute inset-0 rounded-full backface-hidden flex items-center justify-center"
                style={{ 
                    transform: `rotateY(180deg) translateZ(${COIN_THICKNESS / 2}px)`,
                    ...METAL_FACE_STYLE,
                    // Slight tint shift for Tails (older gold look)
                    filter: 'contrast(1.1) sepia(0.2)' 
                }}
             >
                 <TextureOverlay />

                 {/* Inner Recessed Ring */}
                 <div className="absolute inset-[12px] rounded-full border border-yellow-700/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] z-10"></div>

                 {/* Icon */}
                 <div className="w-[65%] h-[65%] relative z-20 opacity-95">
                    <StarIcon />
                 </div>
             </div>

         </div>
      </div>
    </div>
  );
};
