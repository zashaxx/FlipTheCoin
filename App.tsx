
import React, { useState, useEffect, useRef } from 'react';
import { Coin } from './components/Coin';
import { StreakDisplay } from './components/StreakDisplay';
import { DynamicBackground } from './components/DynamicBackground';
import { AchievementList } from './components/AchievementList';
import { AchievementToast } from './components/AchievementToast';
import { MilestoneOverlay } from './components/MilestoneOverlay';
import { ShopModal } from './components/ShopModal';
import { BettingPanel } from './components/BettingPanel';
import { NotificationToast } from './components/NotificationToast';
import { SHOP_ITEMS } from './utils/shopItems';
import { CoinSide, AppState, Achievement, AchievementRarity, Trophy, ActiveBet } from './types';
import { 
  playFlipSound, 
  stopSpinSound,
  playRevealSound,
  playClickSound,
  playMilestoneSound,
  playMultiplierSound,
  toggleBackgroundMusic,
  setGlobalMute,
  playCashSound,
  playEdgeSound
} from './utils/sound';

const formatCash = (amount: number): string => {
  if (amount >= 1000000000) return (amount / 1000000000).toFixed(2) + 'B';
  if (amount >= 1000000) return (amount / 1000000).toFixed(2) + 'M';
  if (amount >= 10000) return (amount / 1000).toFixed(1) + 'k';
  return amount.toLocaleString();
};

const generateAchievements = (): Omit<Achievement, 'unlocked'>[] => {
  const list: Omit<Achievement, 'unlocked'>[] = [];

  const streakMilestones = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
    12, 15, 20, 25, 30, 35, 40, 45, 50, 
    60, 70, 80, 90, 100, 125, 150, 200, 250, 300, 400, 500
  ];
  streakMilestones.forEach(s => {
     let rarity = AchievementRarity.COMMON;
     let reward = s * 15;
     if (s >= 10) { rarity = AchievementRarity.RARE; reward = s * 30; }
     if (s >= 25) { rarity = AchievementRarity.EPIC; reward = s * 100; }
     if (s >= 50) { rarity = AchievementRarity.LEGENDARY; reward = s * 500; }
     if (s >= 100) { rarity = AchievementRarity.MYTHIC; reward = s * 2000; }
     
     list.push({
       id: `streak_${s}`,
       title: `Streak Master ${s}`,
       description: `Reach a streak of ${s}.`,
       icon: s >= 100 ? '👑' : (s >= 50 ? '🔥' : (s >= 10 ? '⚡' : '🕯️')),
       rarity,
       reward,
       condition: (currStreak) => currStreak >= s
     });
  });

  const flipTiers = [
    10, 25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
    1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000, 
    15000, 20000, 30000, 40000, 50000, 75000, 100000
  ];
  flipTiers.forEach(t => {
    let rarity = AchievementRarity.COMMON;
    let reward = Math.floor(t * 0.5);
    if (t >= 500) { rarity = AchievementRarity.RARE; reward = t; }
    if (t >= 2500) { rarity = AchievementRarity.EPIC; reward = t * 2; }
    if (t >= 10000) { rarity = AchievementRarity.LEGENDARY; reward = t * 5; }
    if (t >= 50000) { rarity = AchievementRarity.MYTHIC; reward = t * 10; }

    list.push({
      id: `total_${t}`,
      title: `Flipper ${t}`,
      description: `Flip the coin ${t} times total.`,
      icon: '🪙',
      rarity,
      reward,
      condition: (s, r, h, m, total) => total >= t
    });
  });

  [2, 4, 10].forEach(m => {
     list.push({
       id: `mult_${m}`,
       title: `Lucky x${m}`,
       description: `Get a x${m} multiplier.`,
       icon: '🎰',
       rarity: m === 10 ? AchievementRarity.EPIC : AchievementRarity.COMMON,
       reward: m * 200,
       condition: (s, r, h, mult) => mult >= m
     });
  });

  return list;
};

const BASE_ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
  { id: 'c_heads_start', title: 'Heads Up', description: 'Get 3 Heads in a row.', icon: '🙂', rarity: AchievementRarity.COMMON, reward: 50, condition: (s, r, h) => h.slice(0,3).every(x => x === CoinSide.HEADS) && h.length >= 3 },
  { id: 'c_tails_start', title: 'Tail Spin', description: 'Get 3 Tails in a row.', icon: '🐈', rarity: AchievementRarity.COMMON, reward: 50, condition: (s, r, h) => h.slice(0,3).every(x => x === CoinSide.TAILS) && h.length >= 3 },
  { id: 'e_prophet', title: 'Prophet', description: 'Get 10 Heads in a row.', icon: '🔮', rarity: AchievementRarity.EPIC, reward: 5000, condition: (s, r, h) => h.slice(0,10).every(x => x === CoinSide.HEADS) && h.length >= 10 },
  { id: 'e_rebel', title: 'Rebel', description: 'Get 10 Tails in a row.', icon: '⚔️', rarity: AchievementRarity.EPIC, reward: 5000, condition: (s, r, h) => h.slice(0,10).every(x => x === CoinSide.TAILS) && h.length >= 10 },
  { id: 'l_high_roller', title: 'High Roller', description: 'Get x10 Multiplier twice in a row.', icon: '💎', rarity: AchievementRarity.LEGENDARY, reward: 25000, condition: (s, r, h, m, t, pm) => m === 10 && pm === 10 },
  { id: 'm_impossible', title: 'The Impossible', description: 'Land on the Edge.', icon: '😱', rarity: AchievementRarity.MYTHIC, reward: 1000000, condition: (s, r) => r === CoinSide.EDGE },
];

const ALL_ACHIEVEMENTS = [...BASE_ACHIEVEMENTS, ...generateAchievements()];

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<CoinSide>(CoinSide.HEADS);
  const [history, setHistory] = useState<CoinSide[]>([]);
  
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const [cash, setCash] = useState(100);
  const [inventory, setInventory] = useState<string[]>([]);
  const [activeBet, setActiveBet] = useState<ActiveBet | null>(null);
  
  const [lastWin, setLastWin] = useState(0);
  const [notification, setNotification] = useState<{msg: string, type: 'error'|'success'|'info'} | null>(null);

  const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isBettingOpen, setIsBettingOpen] = useState(false);
  
  const [forceEdge, setForceEdge] = useState(false);
  const [forceHeads, setForceHeads] = useState(false);
  const [forceTails, setForceTails] = useState(false);
  const [forceMultiplier, setForceMultiplier] = useState<number | null>(null);
  const [showAchievements, setShowAchievements] = useState(true); 
  
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [totalFlips, setTotalFlips] = useState(0);
  const [streakSide, setStreakSide] = useState<CoinSide | null>(null);
  
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [previousMultiplier, setPreviousMultiplier] = useState<number>(1);
  const [activeMultiplier, setActiveMultiplier] = useState<number | null>(null); 
  
  const [isFlash, setIsFlash] = useState(false);
  const [isStreakBroken, setIsStreakBroken] = useState(false);
  
  const [milestoneStreak, setMilestoneStreak] = useState<number | null>(null);
  const [isEdgePopup, setIsEdgePopup] = useState(false);
  const [highScoreMilestoneShown, setHighScoreMilestoneShown] = useState(false);
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [toastQueue, setToastQueue] = useState<{title: string, icon: string, rarity: AchievementRarity, reward: number}[]>([]);
  const [activeToast, setActiveToast] = useState<{title: string, icon: string, rarity: AchievementRarity, reward: number} | null>(null);

  // Ref to store pending calculation data to avoid race conditions
  const flipRef = useRef<{
      result: CoinSide;
      multiplier: number;
      lastMultiplier: number;
  }>({ result: CoinSide.HEADS, multiplier: 1, lastMultiplier: 1 });

  useEffect(() => {
    const storedScore = localStorage.getItem('cosmic_coin_highscore');
    if (storedScore) setHighScore(parseInt(storedScore, 10));

    const storedFlips = localStorage.getItem('cosmic_coin_total_flips');
    if (storedFlips) setTotalFlips(parseInt(storedFlips, 10));

    const storedCash = localStorage.getItem('cosmic_coin_cash');
    if (storedCash) setCash(parseInt(storedCash, 10));
    else setCash(100); 

    const storedInventory = localStorage.getItem('cosmic_coin_inventory');
    if (storedInventory) {
       try { setInventory(JSON.parse(storedInventory)); } catch (e) {}
    }

    const storedUnlocks = localStorage.getItem('cosmic_coin_achievements');
    if (storedUnlocks) {
      try { setUnlockedAchievements(new Set(JSON.parse(storedUnlocks))); } catch (e) {}
    }
  }, []);

  const updateHighScore = (newScore: number) => {
    if (newScore > highScore) {
       setHighScore(newScore);
       localStorage.setItem('cosmic_coin_highscore', newScore.toString());
    }
  };

  const incrementTotalFlips = () => {
    const newTotal = totalFlips + 1;
    setTotalFlips(newTotal);
    localStorage.setItem('cosmic_coin_total_flips', newTotal.toString());
    return newTotal;
  };

  const updateCash = (amount: number) => {
     setCash(prev => {
       const newVal = Math.max(0, prev + amount);
       localStorage.setItem('cosmic_coin_cash', newVal.toString());
       return newVal;
     });
  };

  const showNotification = (msg: string, type: 'error' | 'success' | 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuyItem = (item: Trophy) => {
     if (cash >= item.price) {
        updateCash(-item.price);
        const newInv = [...inventory, item.id];
        setInventory(newInv);
        localStorage.setItem('cosmic_coin_inventory', JSON.stringify(newInv));
        playCashSound();
        showNotification(`Purchased ${item.name}!`, 'success');
     }
  };

  const handleEasterEgg = () => {
     setIsDebugMenuOpen(true);
     showNotification("DEV MODE UNLOCKED", 'success');
     playRevealSound('LEGENDARY');
  };

  const handlePlaceBet = (amount: number, target: number) => {
     if (amount > cash) return;
     updateCash(-amount);
     
     const steps = Math.max(1, target - streak);
     const payout = Math.floor(amount * Math.pow(1.9, steps));
     
     setActiveBet({
        amount,
        targetStreak: target,
        startStreak: streak,
        potentialPayout: payout
     });
     playClickSound();
     setIsBettingOpen(false); 
  };

  useEffect(() => {
    if (activeToast === null && toastQueue.length > 0) {
      setActiveToast(toastQueue[0]);
      setToastQueue(prev => prev.slice(1));
      setTimeout(() => setActiveToast(null), 4000);
    }
  }, [activeToast, toastQueue]);

  const unlockAchievement = (id: string) => {
    const def = ALL_ACHIEVEMENTS.find(a => a.id === id);
    if (def && !unlockedAchievements.has(id)) {
      const newSet = new Set(unlockedAchievements).add(id);
      setUnlockedAchievements(newSet);
      localStorage.setItem('cosmic_coin_achievements', JSON.stringify(Array.from(newSet)));
      updateCash(def.reward); 

      if (showAchievements) {
         setToastQueue(prev => [...prev, { title: def.title, icon: def.icon, rarity: def.rarity, reward: def.reward }]);
         playCashSound();
      }
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  }

  const checkAchievements = (newStreak: number, newResult: CoinSide, newHistory: CoinSide[], multiplier: number, currentTotalFlips: number, prevMult: number) => {
    ALL_ACHIEVEMENTS.forEach(def => {
      if (!unlockedAchievements.has(def.id)) {
        if (def.condition && def.condition(newStreak, newResult, newHistory, multiplier, currentTotalFlips, prevMult)) {
           unlockAchievement(def.id);
        }
      }
    });
  };

  const finalizeFlip = (newResult: CoinSide, pendingMultiplier: number, lastMult: number) => {
      const newTotalFlips = incrementTotalFlips();
      let newStreak = 1;
      
      if (newResult === CoinSide.EDGE) {
        newStreak = streak; 
        setHighScoreMilestoneShown(false); 
        playEdgeSound(); // SPECIFIC EDGE SOUND
        setIsEdgePopup(true);
        const payout = 10000;
        updateCash(payout);
        setLastWin(payout);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
      } else {
        const isStreakCheck = streakSide === newResult;
        if (isStreakCheck || streak === 0) {
            newStreak = streak + 1;
            if (newStreak > 1 && Math.random() < 0.05) {
               const luckyFind = 10 * pendingMultiplier;
               updateCash(luckyFind);
               setLastWin(luckyFind);
               playCashSound();
            }
        } else {
            setIsStreakBroken(true);
            newStreak = 0; 
            setHighScoreMilestoneShown(false); 
            setTimeout(() => setIsStreakBroken(false), 2000);
        }
        
        if (pendingMultiplier >= 4 && (isStreakCheck || streak === 0)) {
           playRevealSound('LEGENDARY');
           setIsFlash(true);
        } else if (pendingMultiplier === 2 || newStreak > 10) {
           playRevealSound('RARE');
        } else {
           playRevealSound('COMMON');
        }
      }
      
      if (activeBet) {
         if (newResult === CoinSide.EDGE) {
             updateCash(activeBet.potentialPayout * 10);
             showNotification(`EDGE! Jackpot x10!`, 'success');
             setActiveBet(null);
         } else if (newStreak >= activeBet.targetStreak) {
             updateCash(activeBet.potentialPayout);
             setLastWin(activeBet.potentialPayout);
             showNotification(`Bet Won! +$${activeBet.potentialPayout}`, 'success');
             playCashSound();
             setActiveBet(null);
         } else if (newStreak === 0 && streak > 0) {
             showNotification(`Bet Lost!`, 'error');
             setActiveBet(null);
         }
      }

      setCurrentMultiplier(pendingMultiplier);
      setStreak(newStreak);
      if (newResult !== CoinSide.EDGE) setStreakSide(newResult);
      
      if (newStreak > highScore) {
        updateHighScore(newStreak);
        if (newStreak > 2 && !highScoreMilestoneShown && newResult !== CoinSide.EDGE) {
           setTimeout(() => {
              setMilestoneStreak(newStreak);
              setHighScoreMilestoneShown(true); 
              playMilestoneSound();
           }, 600);
        }
      }
      
      const newHistory = [newResult, ...history].slice(0, 6);
      setHistory(newHistory);
      checkAchievements(newStreak, newResult, newHistory, pendingMultiplier, newTotalFlips, lastMult);
      
      setAppState(AppState.RESULT);
      setIsStopping(false);
      stopSpinSound();
  };

  // Triggered by Coin component when physics has completely settled
  const handleSpinComplete = () => {
      const { result, multiplier, lastMultiplier } = flipRef.current;
      finalizeFlip(result, multiplier, lastMultiplier);
  };

  const handleFlipAction = () => {
    // If in auto-spin mode and already flipping, this button acts as STOP
    if (isAutoSpin && appState === AppState.FLIPPING) {
       if (isStopping) return; 
       setIsStopping(true);
       playClickSound();
       
       // Calculate Result immediately for deterministic stopping
       let newResult: CoinSide;
       if (forceEdge) newResult = CoinSide.EDGE;
       else if (forceHeads) newResult = CoinSide.HEADS;
       else if (forceTails) newResult = CoinSide.TAILS;
       else {
         // 0.001% Chance for Edge (1 in 100,000)
         const isEdge = Math.random() < 0.00001;
         if (isEdge) newResult = CoinSide.EDGE;
         else newResult = Math.random() > 0.5 ? CoinSide.HEADS : CoinSide.TAILS;
       }
       setResult(newResult);
       
       // Calculate Multiplier
       let pendingMultiplier = 1;
       if (streak >= 2) { 
           if (forceMultiplier !== null) {
              pendingMultiplier = forceMultiplier;
           } else {
              // Frequent at low scores, rare at high
              let chance = 0.02; 
              if (streak < 50) chance = 0.20; // 20% chance if score < 50
              if (streak > 200) chance = 0.001; // 0.1% chance if score > 200

              if (Math.random() < chance) {
                 const tier = Math.random();
                 pendingMultiplier = tier > 0.90 ? 10 : (tier > 0.70 ? 4 : 2); 
              }
           }
       }
       
       // Store for callback
       flipRef.current = { 
           result: newResult, 
           multiplier: pendingMultiplier, 
           lastMultiplier: currentMultiplier 
       };
       
       return;
    }
    
    if (appState === AppState.FLIPPING) return;
    
    if (cash <= 0 && !activeBet) {
       const bonus = 100;
       updateCash(bonus);
       playCashSound();
       showNotification("Bankrupt! Welfare Bonus: $100", 'success');
       return; 
    }
    
    // Reset UI
    setIsMenuOpen(false);
    setIsShopOpen(false);
    setIsBettingOpen(false);
    setMilestoneStreak(null);
    setIsEdgePopup(false);
    setIsFlash(false);
    setIsStreakBroken(false);
    setLastWin(0);
    
    setPreviousMultiplier(currentMultiplier);
    const lastMult = currentMultiplier;
    setCurrentMultiplier(1);
    setActiveMultiplier(null); 
    
    playFlipSound();

    // Calculate Result
    let newResult: CoinSide;
    if (forceEdge) newResult = CoinSide.EDGE;
    else if (forceHeads) newResult = CoinSide.HEADS;
    else if (forceTails) newResult = CoinSide.TAILS;
    else {
      // 0.001% Chance for Edge (1 in 100,000)
      const isEdge = Math.random() < 0.00001;
      if (isEdge) newResult = CoinSide.EDGE;
      else newResult = Math.random() > 0.5 ? CoinSide.HEADS : CoinSide.TAILS;
    }
    
    setResult(newResult);
    setAppState(AppState.FLIPPING);
    setIsStopping(false);

    let pendingMultiplier = 1;
    if (streak >= 2) { 
        if (forceMultiplier !== null) {
           pendingMultiplier = forceMultiplier;
        } else {
           // Frequent at low scores, rare at high
           let chance = 0.02; 
           if (streak < 50) chance = 0.20; // 20% chance if score < 50
           if (streak > 200) chance = 0.001; // 0.1% chance if score > 200

           if (Math.random() < chance) {
              const tier = Math.random();
              pendingMultiplier = tier > 0.90 ? 10 : (tier > 0.70 ? 4 : 2); 
           }
        }
    }

    if (pendingMultiplier > 1 && newResult !== CoinSide.EDGE) {
       setTimeout(() => { setActiveMultiplier(pendingMultiplier); playMultiplierSound(); }, 300); 
    }
    if (navigator.vibrate) navigator.vibrate(10);

    // Store for callback
    flipRef.current = { 
        result: newResult, 
        multiplier: pendingMultiplier, 
        lastMultiplier: lastMult 
    };
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setGlobalMute(!newState);
    if (newState) toggleBackgroundMusic(true);
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#1C2B4B] text-white font-sans select-none flex flex-col relative touch-none">
      
      <DynamicBackground streak={streak} appState={appState} isBroken={isStreakBroken} result={result} />

      {/* Overlays */}
      {notification && <NotificationToast message={notification.msg} type={notification.type} />}
      {activeToast && showAchievements && (
         <AchievementToast 
            title={activeToast.title} 
            icon={activeToast.icon} 
            rarity={activeToast.rarity}
            reward={activeToast.reward}
         />
      )}
      {isFlash && <div className="fixed inset-0 z-[60] bg-white animate-flash-screen pointer-events-none"></div>}
      
      {(milestoneStreak || isEdgePopup) && (
         <MilestoneOverlay 
            streak={milestoneStreak || streak} 
            isEdge={isEdgePopup}
            onDismiss={() => {
              setMilestoneStreak(null);
              setIsEdgePopup(false);
            }} 
         />
      )}

      {isShopOpen && (
         <ShopModal 
            cash={cash} 
            inventory={inventory} 
            onBuy={handleBuyItem} 
            onClose={() => setIsShopOpen(false)} 
            onEasterEgg={handleEasterEgg}
         />
      )}

      {isBettingOpen && (
         <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-pop-in" onClick={() => setIsBettingOpen(false)}>
            <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
               <div className="bg-[#1C2B4B] rounded-2xl border-2 border-blue-500 shadow-2xl overflow-hidden">
                  <div className="bg-blue-900/50 p-4 flex justify-between items-center border-b border-blue-500/30">
                     <h3 className="text-white font-black text-xl uppercase italic tracking-wider">Wager Station</h3>
                     <button onClick={() => setIsBettingOpen(false)} className="text-blue-300 hover:text-white font-bold">✕</button>
                  </div>
                  <div className="p-4">
                    <BettingPanel 
                      cash={cash} 
                      currentStreak={streak} 
                      onPlaceBet={handlePlaceBet} 
                      activeBet={activeBet}
                      disabled={appState === AppState.FLIPPING}
                    />
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* --- HEADER --- */}
      <div className="absolute top-0 left-0 w-full p-3 z-50 flex justify-between items-start pointer-events-none">
          <div className="flex gap-3 pointer-events-auto items-center">
            <button onClick={() => { playClickSound(); setIsMenuOpen(!isMenuOpen); }} className="relative group w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full shadow-lg border-2 border-[#FFF] hover:scale-110 transition-transform active:scale-95">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-[#78350F] drop-shadow-md">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
              {unlockedAchievements.size > 0 && <span className="absolute 0 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>}
            </button>

            {/* AUTO SPIN TOGGLE */}
            <div 
               onClick={() => { if (appState !== AppState.FLIPPING) setIsAutoSpin(!isAutoSpin); }}
               className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 border-2 border-white/20 shadow-inner ${isAutoSpin ? 'bg-green-500' : 'bg-slate-700'} ${appState === AppState.FLIPPING ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${isAutoSpin ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
            </div>
            
            <button onClick={toggleSound} className={`w-10 h-10 sm:w-12 sm:h-12 bg-black/30 backdrop-blur rounded-full flex items-center justify-center border border-white/10 hover:bg-black/50 ${soundEnabled ? 'text-white' : 'text-red-400'}`}>
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>

          <div className="flex flex-col items-end gap-2 pointer-events-auto">
                {/* Cash Display */}
                <div 
                    onClick={() => setIsShopOpen(true)}
                    className="bg-slate-900/80 backdrop-blur-md border-2 border-[#FFD700] pl-2 pr-3 py-1.5 rounded-2xl shadow-[0_0_15px_rgba(255,215,0,0.3)] flex items-center gap-2 animate-slide-in-right cursor-pointer hover:bg-slate-800 transition-colors group max-w-[160px] sm:max-w-[220px] overflow-hidden"
                >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center text-[#78350F] font-black text-sm sm:text-lg shadow-inner group-hover:rotate-12 transition-transform">$</div>
                    <span className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-wider truncate">{formatCash(cash)}</span>
                </div>
                
                {/* Wager Button - Nicely Columned */}
                <button 
                    onClick={() => { playClickSound(); setIsBettingOpen(true); }}
                    className="w-full px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-white shadow-lg border border-blue-400 hover:brightness-110 active:scale-95 transition-all animate-slide-in-right text-center flex items-center justify-center gap-1"
                    style={{ animationDelay: '0.1s' }}
                >
                    <span>WAGER</span>
                    <span className="bg-black/20 px-1 rounded">BET</span>
                </button>
                
                {/* Shop Icons (Below Wager now for cleaner header or kept to left? Let's keep them left in flex row below) */}
                 <div className="flex -space-x-2 items-center pt-1 self-end">
                  {inventory.slice(-3).map((id, idx) => {
                      const item = SHOP_ITEMS.find(i => i.id === id);
                      if(!item) return null;
                      return (
                        <div 
                          key={idx} 
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-base sm:text-lg shadow-lg relative z-0 transform hover:scale-110 transition-transform animate-pulse-glow" 
                          style={{zIndex: idx}}
                        >
                            {item.icon}
                        </div>
                      )
                  })}
                </div>
          </div>
      </div>

      {/* LEFT MENU DRAWER */}
      <div className={`fixed inset-y-0 left-0 w-80 sm:w-96 bg-[#0F172A] border-r-2 border-[#FDCB2D] shadow-2xl transform transition-transform duration-300 z-[100] flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-6 bg-gradient-to-r from-[#1e293b] to-[#0F172A] border-b border-slate-700 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] text-[80px] opacity-10">🏆</div>
            <h2 className="text-3xl text-[#FDCB2D] mb-1 text-stroke-black drop-shadow-md font-black uppercase italic relative z-10">Achievements</h2>
            <div className="text-xs text-slate-400 font-mono relative z-10">Unlocked: {unlockedAchievements.size} / {ALL_ACHIEVEMENTS.length}</div>
         </div>
         <div className="p-6 flex-1 overflow-y-auto">
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                   <div className="text-[10px] uppercase text-slate-500 font-bold">Best Streak</div>
                   <div className="text-2xl font-black text-[#FDCB2D]">{highScore}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                   <div className="text-[10px] uppercase text-slate-500 font-bold">Total Flips</div>
                   <div className="text-2xl font-black text-white">{formatCash(totalFlips).replace('k','K')}</div>
                </div>
             </div>
             <AchievementList achievements={ALL_ACHIEVEMENTS.map(def => ({...def, unlocked: unlockedAchievements.has(def.id)}))} />
         </div>
      </div>
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"></div>}

      {/* --- MAIN GAME CONTENT --- */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 min-h-0">
        
        <div className="w-full flex flex-col items-center justify-center origin-bottom scale-75 sm:scale-100">
            <StreakDisplay 
              streak={streak} 
              highScore={highScore} 
              currentSide={streakSide} 
              lastMultiplier={currentMultiplier} 
              activeMultiplier={activeMultiplier}
              appState={appState} 
            />
        </div>

        <div className="relative z-20 transition-transform transform scale-[0.6] sm:scale-90 flex-shrink-0 mt-4">
           <Coin 
              appState={appState} 
              result={result} 
              onFlip={handleFlipAction} 
              onSpinComplete={handleSpinComplete}
              isAutoSpin={isAutoSpin}
              isStopping={isStopping}
           />
        </div>

        <div className="h-16 flex items-center justify-center text-center mt-2 z-30 pointer-events-none flex-shrink-0">
          {appState === AppState.RESULT && (
             <div className="animate-pop-in flex flex-col items-center">
                <p 
                  className={`
                    text-5xl sm:text-7xl font-black text-stroke-black drop-shadow-[0_8px_0_rgba(0,0,0,0.5)] tracking-tighter
                    ${result === CoinSide.HEADS ? 'text-[#FDCB2D]' : (result === CoinSide.TAILS ? 'text-[#E0E0E0]' : 'text-[#00FFFF]')}
                  `}
                >
                  {result}
                </p>
                {lastWin > 0 && (
                   <div className="text-2xl sm:text-3xl font-black text-green-400 text-stroke-sm drop-shadow-md animate-bounce mt-1">
                      +${lastWin.toLocaleString()}
                   </div>
                )}
             </div>
          )}
        </div>
      </div>

      <div className="z-20 w-full flex flex-col items-center px-4 pb-6 shrink-0 bg-gradient-to-t from-[#1C2B4B] via-[#1C2B4B]/90 to-transparent pt-6">
        
        {activeBet && !isBettingOpen && (
            <div 
               onClick={() => setIsBettingOpen(true)}
               className="mb-4 bg-blue-900/80 backdrop-blur border border-blue-400 px-4 py-1.5 rounded-full flex items-center gap-3 cursor-pointer animate-pulse-gold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.5)] max-w-full truncate"
            >
               <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Bet</span>
               <span className="text-base font-black text-white">${activeBet.amount} ➜ ${activeBet.potentialPayout}</span>
            </div>
        )}

        <button
          onClick={handleFlipAction}
          disabled={appState === AppState.FLIPPING && !isAutoSpin}
          className={`
            w-full max-w-xs h-16 sm:h-20 rounded-2xl text-2xl sm:text-3xl tracking-wider uppercase font-black text-stroke-sm
            transition-all duration-100 shadow-game-button mb-4 relative overflow-hidden
            ${appState === AppState.FLIPPING 
              ? (isAutoSpin 
                  ? (isStopping ? 'bg-red-800 border-red-950 text-red-300 cursor-wait' : 'bg-red-500 border-red-700 text-white hover:bg-red-400 hover:scale-[1.02]') 
                  : 'bg-slate-600 border-b-4 border-slate-800 text-slate-400 cursor-default transform scale-95') 
              : 'bg-[#FDCB2D] border-b-8 border-[#CA9208] text-[#78350F] hover:brightness-110 active:border-b-0 active:translate-y-2 active:shadow-none animate-pulse-glow'
            }
          `}
        >
          <span className="relative z-10">
            {appState === AppState.FLIPPING 
               ? (isAutoSpin ? (isStopping ? 'STOPPING...' : 'STOP SPIN') : 'FLIPPING...') 
               : (cash <= 0 && !activeBet ? 'GET BONUS $100' : (isAutoSpin ? 'START SPIN' : 'FLIP COIN'))}
          </span>
          {appState !== AppState.FLIPPING && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine skew-x-12 pointer-events-none"></div>}
        </button>

        <div className="flex gap-2 h-10 items-center justify-center w-full overflow-hidden">
          {history.length > 0 ? history.map((side, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 animate-pop-in" style={{animationDelay: `${idx * 0.05}s`}}>
               <div className={`
                 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-md 
                 ${side === CoinSide.HEADS ? 'bg-[#FFD700] border-[#B8860B] text-[#78350F]' : 
                   side === CoinSide.TAILS ? 'bg-[#E0E0E0] border-[#9E9E9E] text-[#424242]' : 
                   'bg-[#00FFFF] border-white text-black shadow-[0_0_10px_cyan]'}
               `}>
                  {side === CoinSide.HEADS ? 'H' : (side === CoinSide.TAILS ? 'T' : 'E')}
               </div>
            </div>
          )) : <div className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Start Flipping</div>}
        </div>
      </div>
      
      {isDebugMenuOpen && (
         <div className="fixed top-20 right-4 bg-slate-900/95 text-white p-6 rounded-2xl text-xs z-[120] space-y-4 backdrop-blur-md border border-slate-700 shadow-2xl w-64 animate-slide-in-right">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <div className="font-black text-lg text-purple-400 uppercase tracking-widest">Dev Tools</div>
                <button onClick={() => setIsDebugMenuOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2">
               <label className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg cursor-pointer"><input type="checkbox" checked={forceHeads} onChange={e => { setForceHeads(e.target.checked); setForceTails(false); setForceEdge(false); }} className="accent-purple-500 scale-125" /> Force Heads</label>
               <label className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg cursor-pointer"><input type="checkbox" checked={forceTails} onChange={e => { setForceTails(e.target.checked); setForceHeads(false); setForceEdge(false); }} className="accent-purple-500 scale-125" /> Force Tails</label>
               <label className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg cursor-pointer ring-1 ring-cyan-500/50"><input type="checkbox" checked={forceEdge} onChange={e => { setForceEdge(e.target.checked); setForceHeads(false); setForceTails(false); }} className="accent-cyan-500 scale-125" /> Force Edge</label>
            </div>
            <button onClick={() => updateCash(1000000)} className="w-full py-2 bg-green-900/50 text-green-400 border border-green-900 rounded font-bold">+ $1M Cash</button>
            <button onClick={() => { setStreak(0); setHighScore(0); setTotalFlips(0); setInventory([]); setActiveBet(null); setUnlockedAchievements(new Set()); setCash(100); localStorage.clear(); window.location.reload(); }} className="w-full py-2 bg-red-900/50 text-red-400 border border-red-900 rounded">Reset Data</button>
         </div>
      )}
    </div>
  );
}
