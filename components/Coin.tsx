
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CoinSide, AppState } from '../types';

interface CoinProps {
  appState: AppState;
  result: CoinSide;
  onFlip: () => void;
}

interface Particle {
  id: number;
  tx: string;
  ty: string;
  scale: number;
  color: string;
}

export const Coin: React.FC<CoinProps> = ({ appState, result, onFlip }) => {
  // --- VISUAL STATE ---
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0); 
  const [rotationZ, setRotationZ] = useState(0);
  const [isBlurry, setIsBlurry] = useState(false);
  
  // --- PHYSICS STATE (Refs for performance) ---
  const rotationYRef = useRef(0);
  const velocityY = useRef(0);
  const isDragging = useRef(false);
  const lastPointerX = useRef(0);
  const lastMoveTime = useRef(0);
  const animationFrameId = useRef(0);

  // --- PARTICLES STATE ---
  const [particles, setParticles] = useState<Particle[]>([]);

  // --- 1. PHYSICS LOOP ---
  useEffect(() => {
    const loop = () => {
      // Only run physics if not flipping and not currently being held by user
      if (appState !== AppState.FLIPPING && !isDragging.current) {
        // Apply Velocity with Friction
        if (Math.abs(velocityY.current) > 0.01) {
           rotationYRef.current += velocityY.current;
           setRotationY(rotationYRef.current);
           velocityY.current *= 0.95; // Friction (0.95 = smooth glide)
        } else {
           velocityY.current = 0;
        }
      }
      
      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [appState]);

  // --- 2. FLIP LOGIC ---
  useEffect(() => {
    if (appState === AppState.FLIPPING) {
      setIsBlurry(true);
      
      // SMART ROTATION: Snap to nearest forward-facing angle to prevent "rewind" look
      const currentY = rotationYRef.current;
      
      const targetBaseY = Math.round(currentY / 360) * 360; 
      
      // Animate Y to a flat angle quickly before the toss takes over visually
      rotationYRef.current = targetBaseY; 
      setRotationY(targetBaseY);
      velocityY.current = 0; // Kill spin momentum

      // Random subtle Z wobble for realism
      setRotationZ((Math.random() * 6) - 3);

      // --- X-AXIS FLIP CALCULATION ---
      // We always spin forward (positive X)
      const minSpins = 5;
      const degreesPerSpin = 360;
      
      let targetResidue = 0;
      if (result === CoinSide.TAILS) targetResidue = 180;
      if (result === CoinSide.EDGE) targetResidue = 90; 

      const nextRotation = rotationX + (minSpins * degreesPerSpin);
      const currentMod = nextRotation % 360;
      let adjustment = targetResidue - currentMod;
      if (adjustment < 0) adjustment += 360;

      setRotationX(nextRotation + adjustment);

    } else if (appState === AppState.RESULT) {
      setIsBlurry(false);
      setRotationZ(0);
      spawnParticles();
      
      // Ensure we land perfectly flat on Y
      const finalY = Math.round(rotationYRef.current / 360) * 360;
      rotationYRef.current = finalY;
      setRotationY(finalY);
      velocityY.current = 0;
    }
  }, [appState, result]);

  // --- 3. INTERACTION HANDLERS ---
  const getClientX = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    return 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
  };

  const handlePointerDown = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (appState === AppState.FLIPPING) return;
    
    isDragging.current = true;
    lastPointerX.current = getClientX(e);
    velocityY.current = 0; // Stop any existing momentum immediately
  };

  const handlePointerMove = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || appState === AppState.FLIPPING) return;
    
    const x = getClientX(e);
    const delta = x - lastPointerX.current;
    
    lastPointerX.current = x;
    lastMoveTime.current = Date.now();

    // Direct 1:1 Control (Sensitivity 0.5 feels "heavy" and good)
    rotationYRef.current += delta * 0.5;
    setRotationY(rotationYRef.current);

    // Store velocity for inertia upon release
    velocityY.current = delta * 0.5;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    
    // If user holds still for > 100ms before releasing, kill momentum
    // This simulates "stopping" the coin.
    if (Date.now() - lastMoveTime.current > 100) {
       velocityY.current = 0;
    }
  };

  // --- 4. PARTICLES ---
  const spawnParticles = useCallback(() => {
    const count = 40;
    const newParticles: Particle[] = [];
    const color = result === CoinSide.HEADS ? '#2E72F6' : (result === CoinSide.TAILS ? '#E63636' : '#B628FA');
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      const tx = Math.cos(angle) * speed;
      const ty = Math.sin(angle) * speed - 100; 
      newParticles.push({
        id: Date.now() + i,
        tx: `${tx}px`,
        ty: `${ty}px`,
        scale: 0.5 + Math.random() * 0.5,
        color: color
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  }, [result]);

  // --- RENDER HELPERS ---
  // Coin Dimensions - EXTRA THICK & DENSE
  const THICKNESS_LAYERS = 64; // Increased for smoother gradient look
  const FACE_Z = 16; // 32px total thickness
  const LAYER_SPACING = (FACE_Z * 2) / THICKNESS_LAYERS; 

  // Idle floating logic
  const isIdle = appState === AppState.IDLE && !isDragging.current && Math.abs(velocityY.current) < 0.1;

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
      
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
         {particles.map(p => (
            <div
              key={p.id}
              className="absolute w-3 h-3 rounded-full animate-particle-explode"
              style={{
                backgroundColor: p.color,
                '--tx': p.tx,
                '--ty': p.ty,
                boxShadow: `0 0 10px ${p.color}`
              } as React.CSSProperties}
            />
         ))}
      </div>

      <div 
        className={`relative w-full h-full group perspective-1000 cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-center z-10`}
        onClick={(e) => {
           if (Math.abs(velocityY.current) < 2) onFlip(); 
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Glow/Bloom */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl transition-all duration-500 pointer-events-none"
          style={{ 
            backgroundColor: appState === AppState.RESULT 
              ? (result === CoinSide.HEADS ? 'rgba(46, 114, 246, 0.6)' : (result === CoinSide.TAILS ? 'rgba(230, 54, 54, 0.6)' : 'rgba(168, 85, 247, 0.6)')) 
              : 'transparent',
            opacity: appState === AppState.RESULT ? 0.8 : 0,
            transform: appState === AppState.RESULT ? 'scale(1.2)' : 'scale(0.8)'
          }}
        ></div>

        {/* TOSS + IDLE FLOAT CONTAINER */}
        <div className={`w-full h-full pointer-events-none transition-transform duration-500 ${appState === AppState.FLIPPING ? 'animate-toss' : (isIdle ? 'animate-float' : '')}`}>
          
          {/* ROTATION CONTAINER */}
          <div
            className="w-full h-full relative transform-style-3d"
            style={{ 
              transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`,
              transition: appState === AppState.FLIPPING 
                ? 'transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)' 
                : 'none', // Instant update during drag/physics
              filter: isBlurry ? 'blur(0.5px)' : 'none'
            }}
          >
            {/* 1. SOLID EDGE (Reeded Edge) */}
            <div className="absolute inset-0 rounded-full transform-style-3d">
               {Array.from({ length: THICKNESS_LAYERS }).map((_, i) => { 
                  // Calculate Z for this layer to fill the gap between faces
                  const z = -FACE_Z + (i * LAYER_SPACING);
                  
                  // Alternating colors for ridges
                  const isRidge = i % 2 === 0;
                  const color = isRidge ? '#B45309' : '#FCD34D'; // Dark Gold vs Bright Gold
                  
                  return (
                    <div 
                      key={`edge-${i}`}
                      className="absolute inset-0 rounded-full"
                      style={{ 
                        transform: `translateZ(${z}px)`,
                        backgroundColor: color,
                        border: `1px solid ${isRidge ? '#92400E' : '#D97706'}`,
                        boxSizing: 'border-box'
                      }}
                    />
                  )
               })}
            </div>

            {/* 2. HEADS FACE (Front) */}
            <div 
              className="absolute w-full h-full backface-hidden rounded-full"
              style={{ transform: `rotateX(0deg) translateZ(${FACE_Z}px)` }}
            >
              <div 
                className="w-full h-full rounded-full p-[12px] shadow-[inset_0_-4px_6px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.7)] border-[0.5px] border-[#78350F]"
                style={{
                  background: `conic-gradient(from 0deg, #FCD34D, #F59E0B 20deg, #B45309 45deg, #FCD34D 70deg, #F59E0B 100deg, #FCD34D 130deg, #B45309 160deg, #F59E0B 180deg, #FCD34D 200deg, #B45309 225deg, #FCD34D 250deg, #F59E0B 280deg, #B45309 315deg, #FCD34D 340deg, #F59E0B 360deg)`,
                  filter: 'url(#realistic-gold)'
                }}
              >
                 <div className="w-full h-full rounded-full bg-[#1A4BA0] p-[6px] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.4)]">
                     <div 
                       className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden border-[2px] border-[#5D9BFF]/40"
                       style={{
                          background: 'radial-gradient(circle at 50% 30%, #2E72F6, #0F2E6B 90%)',
                          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)'
                       }}
                     >
                        <div className="z-10 flex flex-col items-center transform translate-y-1" style={{ filter: 'url(#deep-emboss)' }}>
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-36 h-36 text-[#FFD700]">
                              <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
                            </svg>
                        </div>
                     </div>
                 </div>
              </div>
            </div>

            {/* 3. TAILS FACE (Back) */}
            <div 
              className="absolute w-full h-full backface-hidden rounded-full"
              style={{ transform: `rotateX(180deg) translateZ(${FACE_Z}px)` }}
            >
               <div 
                 className="w-full h-full rounded-full p-[12px] shadow-[inset_0_-4px_6px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.7)] border-[0.5px] border-[#78350F]"
                 style={{
                  background: `conic-gradient(from 120deg, #FCD34D, #F59E0B 20deg, #B45309 45deg, #FCD34D 70deg, #F59E0B 100deg, #FCD34D 130deg, #B45309 160deg, #F59E0B 180deg, #FCD34D 200deg, #B45309 225deg, #FCD34D 250deg, #F59E0B 280deg, #B45309 315deg, #FCD34D 340deg, #F59E0B 360deg)`,
                  filter: 'url(#realistic-gold)'
                 }}
               >
                 <div className="w-full h-full rounded-full bg-[#9E1A1A] p-[6px] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.4)]">
                    <div 
                      className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden border-[2px] border-[#FF6B6B]/40"
                      style={{
                        background: 'radial-gradient(circle at 50% 30%, #D92424, #540B0B 90%)',
                        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)'
                     }}
                    >
                        <div className="z-10 flex flex-col items-center transform translate-y-1" style={{ filter: 'url(#deep-emboss)' }}>
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32 text-[#E5E7EB]">
                              <path d="M14.5 17.5L3 6V3H6L17.5 14.5L14.5 17.5ZM19.5 12.5L21 11L21 3H13L11.5 4.5L19.5 12.5Z" />
                              <path d="M20.7071 18.2929L19.2929 16.8787L15.4559 20.7157L13.4142 18.6741L18.6741 13.4142L20.7157 15.4558L16.8787 19.2929L18.2929 20.7071C18.6834 21.0976 19.3166 21.0976 19.7071 20.7071L20.7071 19.7071C21.0976 19.3166 21.0976 18.6834 20.7071 18.2929Z" />
                              <path d="M3.29289 18.2929L4.70711 16.8787L8.54416 20.7157L10.5858 18.6741L5.32587 13.4142L3.28427 15.4558L7.12132 19.2929L5.70711 20.7071C5.31658 21.0976 4.68342 21.0976 4.29289 20.7071L3.29289 19.7071C2.90237 19.3166 2.90237 18.6834 3.29289 18.2929Z" />
                            </svg>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dynamic Shadow */}
        <div 
          className={`
            absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-black/40 rounded-[100%] blur-lg transition-all duration-1000
            ${appState === AppState.FLIPPING ? 'w-24 h-4 opacity-20 scale-50' : 'w-48 h-8 opacity-60 scale-100'}
          `}
        ></div>
      </div>
    </div>
  );
};
