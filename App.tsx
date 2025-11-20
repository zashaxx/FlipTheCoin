
import React, { useState, useEffect } from 'react';
import { Coin } from './components/Coin';
import { StreakDisplay } from './components/StreakDisplay';
import { DynamicBackground } from './components/DynamicBackground';
import { AchievementList } from './components/AchievementList';
import { AchievementToast } from './components/AchievementToast';
import { MilestoneOverlay } from './components/MilestoneOverlay';
import { OnboardingModal } from './components/OnboardingModal';
import { SocialMenu } from './components/SocialMenu';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CoinSide, AppState, Achievement, UserProfile } from './types';
import { playerService } from './services/playerService';
import { 
  playFlipSound, 
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

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<CoinSide>(CoinSide.HEADS);
  const [history, setHistory] = useState<CoinSide[]>([]);
  
  // User & Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // UI Panels
  const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  
  // Debug Logic
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
  const [activeMultiplier, setActiveMultiplier] = useState<number | null>(null); 
  const [isFlash, setIsFlash] = useState(false);
  const [isStreakBroken, setIsStreakBroken] = useState(false);
  
  // Milestones
  const [milestoneStreak, setMilestoneStreak] = useState<number | null>(null);
  const [highScoreMilestoneShown, setHighScoreMilestoneShown] = useState(false);
  
  // Audio
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Toast / Unlocks
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [toastQueue, setToastQueue] = useState<{title: string, icon: string}[]>([]);
  const [activeToast, setActiveToast] = useState<{title: string, icon: string} | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const storedUser = playerService.getPlayer();
    if (storedUser) {
      setUser(storedUser);
      setHighScore(storedUser.highScore);
    } else {
      setShowOnboarding(true);
    }
  }, []);

  // --- USER ACTIONS ---
  const handleOnboardingComplete = (name: string, age: number) => {
    playMilestoneSound();
    const newUser = playerService.createPlayer(name, age);
    setUser(newUser);
    setShowOnboarding(false);
    setToastQueue(prev => [...prev, { title: `Welcome, ${newUser.gamerTag}!`, icon: '👋' }]);
  };

  const handleLogout = () => {
    // In this version, logout just resets (optional feature, mostly for debugging)
    localStorage.removeItem('cosmic_coin_player_v1');
    window.location.reload();
  };

  const updateHighScore = (newScore: number) => {
    if (newScore > highScore) {
       setHighScore(newScore);
       if (user) {
          const updated = playerService.updateHighScore(user, newScore);
          setUser(updated);
       }
    }
  };

  // --- SOUND & UI ---
  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setGlobalMute(!newState);
    if (newState) toggleBackgroundMusic(true);
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

  // --- GAME LOGIC ---
  const handleFlip = () => {
    if (appState === AppState.FLIPPING) return;
    
    // Close UI panels
    setIsMenuOpen(false);
    setIsSocialMenuOpen(false);
    setIsLeaderboardOpen(false);
    setMilestoneStreak(null);
    
    setIsFlash(false);
    setIsStreakBroken(false);
    setCurrentMultiplier(1);
    setActiveMultiplier(null); 
    
    playFlipSound();

    // Determine Result
    let newResult: CoinSide;
    if (forceEdge) newResult = CoinSide.EDGE;
    else if (forceHeads) newResult = CoinSide.HEADS;
    else if (forceTails) newResult = CoinSide.TAILS;
    else newResult = Math.random() < 0.00001 ? CoinSide.EDGE : (Math.random() > 0.5 ? CoinSide.HEADS : CoinSide.TAILS);
    
    setResult(newResult);
    setAppState(AppState.FLIPPING);

    // Calculate Multiplier
    let pendingMultiplier = 1;
    if (forceMultiplier !== null) {
       pendingMultiplier = forceMultiplier;
    } else {
       let chance = 0.3 / (1 + (streak * 0.1));
       if (streak > 200) chance = 0.001; 
       if (Math.random() < chance) {
          const tier = Math.random();
          pendingMultiplier = tier > 0.90 ? 10 : (tier > 0.70 ? 4 : 2); 
       }
    }

    if (pendingMultiplier > 1) {
       setTimeout(() => {
          setActiveMultiplier(pendingMultiplier);
          playMultiplierSound();
       }, 300); 
    }

    if (navigator.vibrate) navigator.vibrate(10);

    // Finish Flip
    setTimeout(() => {
      stopSpinSound();
      setAppState(AppState.RESULT);
      
      let newStreak = 1;
      
      if (newResult === CoinSide.EDGE) {
        newStreak = 0; 
        setStreakSide(null);
        setHighScoreMilestoneShown(false); 
        playRevealSound('LEGENDARY');
      } else {
        const isStreakCheck = streakSide === newResult;
        
        if (isStreakCheck) {
            newStreak = (streak + 1) * pendingMultiplier;
        } else {
            setIsStreakBroken(true);
            newStreak = 1; 
            setHighScoreMilestoneShown(false); 
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
      
      // Handle High Score Logic
      if (newStreak > highScore) {
        updateHighScore(newStreak); // Persist
        
        // Only trigger milestone popup ONCE per run when you first break the record
        if (newStreak > 2 && !highScoreMilestoneShown) {
           setTimeout(() => {
              setMilestoneStreak(newStreak);
              setHighScoreMilestoneShown(true); 
              playMilestoneSound();
           }, 600);
        }
      }
      
      const newHistory = [newResult, ...history].slice(0, 6);
      setHistory(newHistory);
      checkAchievements(newStreak, newResult, newHistory, pendingMultiplier);

    }, 1200); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-6 relative overflow-hidden font-sans select-none">
      
      <DynamicBackground streak={streak} appState={appState} isBroken={isStreakBroken} result={result} />

      {/* Overlays */}
      {activeToast && showAchievements && <AchievementToast title={activeToast.title} icon={activeToast.icon} />}
      {isFlash && <div className="fixed inset-0 z-[60] bg-white animate-flash-screen pointer-events-none"></div>}
      
      {/* ONBOARDING */}
      {showOnboarding && (
         <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* MILESTONE POPUP */}
      {milestoneStreak && (
         <MilestoneOverlay streak={milestoneStreak} onDismiss={() => setMilestoneStreak(null)} />
      )}

      {/* LEADERBOARD MODAL */}
      {isLeaderboardOpen && (
         <LeaderboardModal user={user} onClose={() => setIsLeaderboardOpen(false)} />
      )}
      
      {/* Top Left Buttons */}
      <div className="absolute top-4 left-4 z-50 flex gap-3">
        <button onClick={() => { playClickSound(); setIsMenuOpen(!isMenuOpen); setIsSocialMenuOpen(false); }} className="game-btn-small">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /></svg>
        </button>
        <button onClick={toggleSound} className={`game-btn-small ${soundEnabled ? 'text-yellow-300' : 'text-slate-400'}`}>
           {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Top Right Buttons (Social / Leaderboard) */}
      <div className="absolute top-4 right-4 z-50 flex gap-3">
         {/* Leaderboard Button */}
         <button 
            onClick={() => { playClickSound(); setIsLeaderboardOpen(true); }}
            className="game-btn-small text-[#FDCB2D]"
         >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a1.125 1.125 0 00-1.125-1.125h-2.25a1.125 1.125 0 00-1.125 1.125V14.25m5.828 0A9.094 9.094 0 0112 14.25m3 4.5v.375" />
             </svg>
         </button>

         {user && (
            <button 
              onClick={() => { playClickSound(); setIsSocialMenuOpen(!isSocialMenuOpen); setIsMenuOpen(false); }} 
              className="game-btn-small relative"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 text-purple-300"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
               {user.friends?.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1A4BA0]"></span>}
            </button>
         )}
         
         <button 
           onClick={() => setIsDebugMenuOpen(!isDebugMenuOpen)} 
           className="px-2 py-1 bg-black/20 text-xs text-white/30 rounded hover:text-white transition-colors"
         >
           ?
         </button>
      </div>

      {/* LEFT MENU - STATS */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-[#1A4BA0] border-r-4 border-[#FDCB2D] shadow-2xl transform transition-transform duration-300 z-[100] p-6 overflow-y-auto ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <h2 className="text-3xl text-[#FDCB2D] mb-6 text-stroke-black drop-shadow-md">STATS</h2>
         <div className="space-y-2 font-body text-white">
             <p>Best Streak: <span className="text-[#FDCB2D] font-bold">{highScore}</span></p>
             {user && <p>Tag: <span className="text-purple-300 font-bold">{user.gamerTag}</span></p>}
             <AchievementList achievements={ACHIEVEMENT_DEFINITIONS.map(def => ({...def, unlocked: unlockedAchievements.has(def.id)}))} />
         </div>
      </div>
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/60 z-[90]"></div>}

      {/* RIGHT MENU - SOCIAL */}
      {user && (
         <SocialMenu 
            user={user} 
            isOpen={isSocialMenuOpen} 
            onClose={() => setIsSocialMenuOpen(false)}
            onAddFriend={() => {}}
            onRemoveFriend={() => {}}
            onLogout={handleLogout}
         />
      )}

      {/* Main Area */}
      <div className="z-10 flex-grow flex flex-col items-center justify-center w-full mt-4 mb-16">
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

      {/* Footer Button */}
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
          {appState !== AppState.FLIPPING && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine skew-x-12 pointer-events-none"></div>}
        </button>

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
