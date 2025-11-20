
import React, { useState, useEffect } from 'react';
import { Coin } from './components/Coin';
import { StreakDisplay } from './components/StreakDisplay';
import { DynamicBackground } from './components/DynamicBackground';
import { AchievementList } from './components/AchievementList';
import { AchievementToast } from './components/AchievementToast';
import { MilestoneOverlay } from './components/MilestoneOverlay';
import { CoinSide, AppState, Achievement } from './types';
import { 
  playFlipSound, 
  startSpinSound, 
  stopSpinSound,
  playRevealSound,
  playClickSound,
  playMilestoneSound,
  playMultiplierSound,
  toggleBackgroundMusic,
  setGlobalMute
} from './utils/sound';

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first_step', title: 'First Step', description: 'Reach a streak of 1.', icon: '🦶', condition: (s) => s >= 1 },
  { id: 'first_spark', title: 'Spark', description: 'Reach a streak of 3.', icon: '🔥', condition: (s) => s >= 3 },
  { id: 'coin_master', title: 'Coin Master', description: 'Reach a streak of 10.', icon: '🪙', condition: (s) => s >= 10 },
  { id: 'lucky_break', title: 'Lucky Break', description: 'Reach a streak of 25.', icon: '🍀', condition: (s) => s >= 25 },
  { id: 'eternal_flame', title: 'Legend', description: 'Reach a streak of 50.', icon: '♾️', condition: (s) => s >= 50 },
  { id: 'centurion', title: 'Champion', description: 'Reach a streak of 100.', icon: '🏆', condition: (s) => s >= 100 },
  { id: 'golden_age', title: 'Royal Lineage', description: 'Get 10 Heads in a row.', icon: '👑', condition: (s, r, h) => s >= 10 && r === CoinSide.HEADS },
  { id: 'tails_never_fails', title: 'Rebel Force', description: 'Get 10 Tails in a row.', icon: '⚔️', condition: (s, r, h) => s >= 10 && r === CoinSide.TAILS },
  { id: 'double_trouble', title: 'Double Up', description: 'Hit a x2 multiplier.', icon: '2️⃣', condition: (s, r, h, m) => m === 2 },
  { id: 'multiplier_hunter', title: 'Super Luck', description: 'Hit a x10 multiplier.', icon: '⚡', condition: (s, r, h, m) => m >= 10 },
];

// Milestone thresholds
const MILESTONES = [10, 25, 50, 100, 200, 500, 1000];

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<CoinSide>(CoinSide.HEADS);
  const [history, setHistory] = useState<CoinSide[]>([]);
  
  // Debug / Test State
  const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
  const [forceEdge, setForceEdge] = useState(false);
  const [forceHeads, setForceHeads] = useState(false);
  const [forceTails, setForceTails] = useState(false);
  const [forceMultiplier, setForceMultiplier] = useState<number | null>(null);
  const [showAchievements, setShowAchievements] = useState(true); 
  
  // Stats
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [streakSide, setStreakSide] = useState<CoinSide | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [activeMultiplier, setActiveMultiplier] = useState<number | null>(null); // For the "Pre-flip" display
  const [isFlash, setIsFlash] = useState(false);
  const [isStreakBroken, setIsStreakBroken] = useState(false);
  
  // Milestones
  const [milestoneStreak, setMilestoneStreak] = useState<number | null>(null);
  
  // Audio
  const [soundEnabled, setSoundEnabled] = useState(true);

  // UI
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [toastQueue, setToastQueue] = useState<{title: string, icon: string}[]>([]);
  const [activeToast, setActiveToast] = useState<{title: string, icon: string} | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setGlobalMute(!newState);
    if (newState) {
      toggleBackgroundMusic(true);
    }
  }

  // Toast Manager
  useEffect(() => {
    if (activeToast === null && toastQueue.length > 0) {
      setActiveToast(toastQueue[0]);
      setToastQueue(prev => prev.slice(1));
      setTimeout(() => setActiveToast(null), 4000);
    }
  }, [activeToast, toastQueue]);

  const unlockAchievement = (id: string) => {
    const def = ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
    if (def && !unlockedAchievements.has(id)) {
      setUnlockedAchievements(prev => new Set(prev).add(id));
      if (showAchievements) {
         setToastQueue(prev => [...prev, { title: def.title, icon: def.icon }]);
      }
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  }

  const checkAchievements = (newStreak: number, newResult: CoinSide, newHistory: CoinSide[], multiplier: number) => {
    ACHIEVEMENT_DEFINITIONS.forEach(def => {
      if (!unlockedAchievements.has(def.id)) {
        if (def.condition && def.condition(newStreak, newResult, newHistory, multiplier)) {
           unlockAchievement(def.id);
        }
      }
    });
  };

  const handleFlip = () => {
    if (appState === AppState.FLIPPING) return;
    if (isMenuOpen) setIsMenuOpen(false);
    if (milestoneStreak) setMilestoneStreak(null);
    
    setIsFlash(false);
    // Do not reset broken state immediately so animation finishes if exists
    setIsStreakBroken(false);
    
    setCurrentMultiplier(1);
    setActiveMultiplier(null); // Reset visualization
    
    playFlipSound();

    // --- DETERMINE RESULT ---
    let newResult: CoinSide;
    if (forceEdge) newResult = CoinSide.EDGE;
    else if (forceHeads) newResult = CoinSide.HEADS;
    else if (forceTails) newResult = CoinSide.TAILS;
    else newResult = Math.random() < 0.00001 ? CoinSide.EDGE : (Math.random() > 0.5 ? CoinSide.HEADS : CoinSide.TAILS);
    
    setResult(newResult);
    setAppState(AppState.FLIPPING);

    // --- CALCULATE MULTIPLIER (PRE-FLIP) ---
    let pendingMultiplier = 1;

    if (forceMultiplier !== null) {
       pendingMultiplier = forceMultiplier;
    } else {
       let chance = 0.3 / (1 + (streak * 0.1));
       if (streak > 200) chance = 0.001; 
       
       if (Math.random() < chance) {
          const tier = Math.random();
          if (tier > 0.90) pendingMultiplier = 10; 
          else if (tier > 0.70) pendingMultiplier = 4; 
          else pendingMultiplier = 2; 
       }
    }

    if (pendingMultiplier > 1) {
       setTimeout(() => {
          setActiveMultiplier(pendingMultiplier);
          playMultiplierSound();
       }, 300); 
    }

    if (navigator.vibrate) navigator.vibrate(10);

    // --- FINISH FLIP ---
    setTimeout(() => {
      stopSpinSound();
      setAppState(AppState.RESULT);
      
      let newStreak = 1;
      
      if (newResult === CoinSide.EDGE) {
        newStreak = 0; 
        setStreakSide(null);
        playRevealSound('LEGENDARY');
      } else {
        const isStreakCheck = streakSide === newResult;
        
        if (isStreakCheck) {
            newStreak = (streak + 1) * pendingMultiplier;
        } else {
            // Streak broken
            setIsStreakBroken(true);
            // Reset visual state after a while
            setTimeout(() => setIsStreakBroken(false), 2000);
        }
        
        if (pendingMultiplier >= 4 && isStreakCheck) {
           playRevealSound('LEGENDARY');
           setIsFlash(true);
           if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
        } else if (pendingMultiplier === 2 || newStreak > 10) {
           playRevealSound('RARE');
        } else {
           playRevealSound('COMMON');
        }
      }
      
      setCurrentMultiplier(pendingMultiplier);
      setStreak(newStreak);
      if (newResult !== CoinSide.EDGE) setStreakSide(newResult);
      if (newStreak > highScore) setHighScore(newStreak);
      
      const newHistory = [newResult, ...history].slice(0, 6);
      setHistory(newHistory);
      checkAchievements(newStreak, newResult, newHistory, pendingMultiplier);

      if (MILESTONES.includes(newStreak)) {
         setTimeout(() => {
            setMilestoneStreak(newStreak);
            playMilestoneSound();
         }, 600); 
      }

    }, 1200); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-6 relative overflow-hidden font-sans select-none">
      
      {/* --- DYNAMIC BACKGROUND --- */}
      <DynamicBackground streak={streak} appState={appState} isBroken={isStreakBroken} />

      {/* Overlays */}
      {activeToast && showAchievements && <AchievementToast title={activeToast.title} icon={activeToast.icon} />}
      {isFlash && <div className="fixed inset-0 z-[60] bg-white animate-flash-screen pointer-events-none"></div>}
      
      {milestoneStreak && (
         <MilestoneOverlay streak={milestoneStreak} onDismiss={() => setMilestoneStreak(null)} />
      )}
      
      {/* Header */}
      <div className="absolute top-4 left-4 z-50 flex gap-3">
        <button onClick={() => { playClickSound(); setIsMenuOpen(!isMenuOpen); }} className="game-btn-small">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /></svg>
        </button>
        <button onClick={toggleSound} className={`game-btn-small ${soundEnabled ? 'text-yellow-300' : 'text-slate-400'}`}>
           {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* DEBUG BUTTON */}
      <div className="absolute top-4 right-4 z-50">
         <button 
           onClick={() => setIsDebugMenuOpen(!isDebugMenuOpen)} 
           className="px-3 py-1 bg-black/40 text-xs text-white/50 rounded-full hover:bg-black/60 hover:text-white transition-colors border border-white/10"
         >
           DEV
         </button>
      </div>

      {/* TEST MENU OVERLAY */}
      {isDebugMenuOpen && (
         <div className="absolute top-14 right-4 z-50 w-56 bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl text-xs">
            <h3 className="text-yellow-400 font-bold mb-3 uppercase tracking-wider">Debug Controls</h3>
            <div className="space-y-2">
               <label className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-1 rounded">
                  <span>Show Achievements</span>
                  <input type="checkbox" checked={showAchievements} onChange={(e) => setShowAchievements(e.target.checked)} />
               </label>
               <div className="h-px bg-white/10 my-2"></div>
               <label className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-1 rounded">
                  <span>Force Heads</span>
                  <input type="checkbox" checked={forceHeads} onChange={(e) => { setForceHeads(e.target.checked); if(e.target.checked) { setForceTails(false); setForceEdge(false); } }} />
               </label>
               <label className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-1 rounded">
                  <span>Force Tails</span>
                  <input type="checkbox" checked={forceTails} onChange={(e) => { setForceTails(e.target.checked); if(e.target.checked) { setForceHeads(false); setForceEdge(false); } }} />
               </label>
               <label className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-1 rounded">
                  <span>Force Edge</span>
                  <input type="checkbox" checked={forceEdge} onChange={(e) => { setForceEdge(e.target.checked); if(e.target.checked) { setForceHeads(false); setForceTails(false); } }} />
               </label>
               <div className="pt-2 border-t border-white/10">
                  <p className="mb-1 text-slate-400">Force Multiplier</p>
                  <div className="flex gap-1">
                     <button onClick={() => setForceMultiplier(null)} className={`flex-1 py-1 rounded ${forceMultiplier === null ? 'bg-blue-600' : 'bg-slate-700'}`}>Off</button>
                     <button onClick={() => setForceMultiplier(2)} className={`flex-1 py-1 rounded ${forceMultiplier === 2 ? 'bg-blue-600' : 'bg-slate-700'}`}>2x</button>
                     <button onClick={() => setForceMultiplier(10)} className={`flex-1 py-1 rounded ${forceMultiplier === 10 ? 'bg-blue-600' : 'bg-slate-700'}`}>10x</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Menu */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-[#1A4BA0] border-r-4 border-[#FDCB2D] shadow-2xl transform transition-transform duration-300 z-[100] p-6 overflow-y-auto ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <h2 className="text-3xl text-[#FDCB2D] mb-6 text-stroke-black drop-shadow-md">STATS</h2>
         <div className="space-y-2 font-body text-white">
             <p>Best Streak: <span className="text-[#FDCB2D] font-bold">{highScore}</span></p>
             <AchievementList achievements={ACHIEVEMENT_DEFINITIONS.map(def => ({...def, unlocked: unlockedAchievements.has(def.id)}))} />
         </div>
      </div>
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/60 z-[90]"></div>}

      {/* Main Area */}
      <div className="z-10 flex-grow flex flex-col items-center justify-center w-full mt-4 mb-16">
        
        {/* STREAK DISPLAY */}
        <div className="mb-4 w-full flex justify-center">
          <StreakDisplay 
             streak={streak} 
             highScore={highScore} 
             currentSide={streakSide} 
             lastMultiplier={currentMultiplier} 
             activeMultiplier={activeMultiplier}
             appState={appState} 
          />
        </div>

        <div className="relative z-20 scale-90 sm:scale-100">
           <Coin appState={appState} result={result} onFlip={handleFlip} />
        </div>

        {/* Result Text */}
        <div className="h-24 flex items-center justify-center text-center mt-6 z-30 pointer-events-none">
          {appState === AppState.RESULT && (
             <div className="animate-pop-in">
                <p 
                  className={`
                    text-7xl font-black text-stroke-black drop-shadow-[0_8px_0_rgba(0,0,0,0.5)] tracking-tighter
                    ${result === CoinSide.HEADS ? 'text-[#FDCB2D]' : 'text-white'} 
                    ${result === CoinSide.TAILS ? 'text-[#ff6b6b]' : ''}
                  `}
                >
                  {result}
                </p>
             </div>
          )}
        </div>
      </div>

      {/* Footer / Button */}
      <div className="z-20 w-full flex flex-col items-center px-6 pb-10">
        <button
          onClick={handleFlip}
          disabled={appState === AppState.FLIPPING}
          className={`
            w-full max-w-xs h-20 rounded-2xl text-3xl tracking-wider uppercase font-black text-stroke-sm
            transition-all duration-100 shadow-game-button mb-8 relative overflow-hidden
            ${appState === AppState.FLIPPING 
              ? 'bg-slate-600 border-b-4 border-slate-800 text-slate-400 cursor-default transform scale-95' 
              : 'bg-[#FDCB2D] border-b-8 border-[#CA9208] text-[#78350F] hover:brightness-110 active:border-b-0 active:translate-y-2 active:shadow-none animate-pulse-glow'
            }
          `}
        >
          <span className="relative z-10">{appState === AppState.FLIPPING ? 'FLIPPING...' : 'FLIP'}</span>
          {/* Button Shine */}
          {appState !== AppState.FLIPPING && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine skew-x-12 pointer-events-none"></div>}
        </button>

        {/* History pills */}
        <div className="flex gap-3 h-12 items-center">
          {history.map((side, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
               <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-black shadow-md ${side === CoinSide.HEADS ? 'bg-[#2E72F6] border-[#1A4BA0] text-white' : 'bg-[#E63636] border-[#9E1A1A] text-white'}`}>
                  {side === CoinSide.HEADS ? 'H' : 'T'}
               </div>
            </div>
          ))}
          {history.length === 0 && <div className="w-full text-white/30 text-xs uppercase font-bold tracking-widest">No History</div>}
        </div>
      </div>
      
      <style>{`
        .game-btn-small {
           @apply bg-blue-900/80 p-3 rounded-xl border-b-4 border-blue-800 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all text-white shadow-lg backdrop-blur-sm;
        }
        @keyframes pulseGlow {
           0%, 100% { box-shadow: 0 6px 0px 0px rgba(0,0,0,0.4), 0 0 0 rgba(253, 203, 45, 0); }
           50% { box-shadow: 0 6px 0px 0px rgba(0,0,0,0.4), 0 0 20px rgba(253, 203, 45, 0.6); }
        }
        .animate-pulse-glow {
           animation: pulseGlow 2s infinite;
        }
      `}</style>
    </div>
  );
}
