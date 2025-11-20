
import React, { useEffect, useState } from 'react';

interface BettingPanelProps {
  cash: number;
  currentStreak: number;
  onPlaceBet: (amount: number, targetStreak: number) => void;
  activeBet: { amount: number, targetStreak: number, potentialPayout: number } | null;
  disabled: boolean;
}

export const BettingPanel: React.FC<BettingPanelProps> = ({ cash, currentStreak, onPlaceBet, activeBet, disabled }) => {
  const [betAmount, setBetAmount] = useState(0);
  const [targetStreak, setTargetStreak] = useState(currentStreak + 1);

  // Calculate Odds
  // 50% chance per step. 
  // Multiplier approx 1.9x per step to give house edge but nice payouts.
  const steps = Math.max(1, targetStreak - currentStreak);
  const multiplier = Math.pow(1.9, steps);
  const payout = Math.floor(betAmount * multiplier);

  // Sync target when streak changes (if no bet)
  useEffect(() => {
    if (!activeBet && targetStreak <= currentStreak) {
      setTargetStreak(currentStreak + 1);
    }
  }, [currentStreak, activeBet, targetStreak]);

  if (activeBet) {
    return (
      <div className="w-full max-w-md bg-gradient-to-r from-blue-900/90 to-slate-900/90 backdrop-blur border-2 border-blue-500 rounded-xl p-4 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-pulse-gold">
         <div className="flex justify-between items-center mb-2">
            <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">Active Bet Locked</span>
            <span className="text-white font-black text-lg">${activeBet.amount}</span>
         </div>
         <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
            <div className="text-center">
               <div className="text-[10px] text-slate-400 uppercase">Target Streak</div>
               <div className="text-2xl font-black text-white">{activeBet.targetStreak}</div>
            </div>
            <div className="text-blue-400 text-2xl">➜</div>
            <div className="text-center">
               <div className="text-[10px] text-slate-400 uppercase">Potential Win</div>
               <div className="text-2xl font-black text-[#FFD700]">${activeBet.potentialPayout.toLocaleString()}</div>
            </div>
         </div>
         <div className="mt-2 text-center text-[10px] text-blue-200 font-mono">
            Reach streak {activeBet.targetStreak} to cash out!
         </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-4 mb-4 shadow-lg transition-all duration-300">
       <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Place Your Wager</span>
          <span className="text-[#FFD700] font-bold text-xs">Balance: ${cash.toLocaleString()}</span>
       </div>

       <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Amount Input */}
          <div>
             <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Bet Amount</label>
             <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="0" 
                  max={cash} 
                  value={betAmount} 
                  onChange={(e) => setBetAmount(Math.min(cash, Math.max(0, parseInt(e.target.value) || 0)))}
                  disabled={disabled}
                  className="w-full bg-slate-800 text-white font-bold rounded px-2 py-2 border border-slate-600 focus:border-[#FFD700] outline-none"
                />
             </div>
             <div className="flex gap-1 mt-2">
                {[10, 50, 100, 'MAX'].map((amt) => (
                   <button 
                     key={amt}
                     onClick={() => setBetAmount(amt === 'MAX' ? cash : Math.min(cash, amt as number))}
                     disabled={disabled}
                     className="flex-1 bg-slate-700 text-[10px] text-white rounded py-1 hover:bg-slate-600 disabled:opacity-50"
                   >
                      {amt}
                   </button>
                ))}
             </div>
          </div>

          {/* Target Streak Input */}
          <div>
             <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Target Streak</label>
             <div className="flex items-center gap-2">
                <button 
                   onClick={() => setTargetStreak(Math.max(currentStreak + 1, targetStreak - 1))}
                   disabled={disabled || targetStreak <= currentStreak + 1}
                   className="w-8 h-10 bg-slate-700 rounded text-white hover:bg-slate-600 disabled:opacity-50"
                >-</button>
                <div className="flex-1 text-center font-black text-xl text-white bg-slate-800 h-10 flex items-center justify-center rounded border border-slate-600">
                   {targetStreak}
                </div>
                <button 
                   onClick={() => setTargetStreak(targetStreak + 1)}
                   disabled={disabled}
                   className="w-8 h-10 bg-slate-700 rounded text-white hover:bg-slate-600 disabled:opacity-50"
                >+</button>
             </div>
             <div className="mt-2 text-right">
                <span className="text-[10px] text-green-400 font-mono">x{multiplier.toFixed(1)} Payout</span>
             </div>
          </div>
       </div>

       <button 
         onClick={() => onPlaceBet(betAmount, targetStreak)}
         disabled={disabled || betAmount <= 0 || betAmount > cash}
         className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#78350F] font-black uppercase py-3 rounded-lg shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
       >
          <span>Lock Bet</span>
          <span className="bg-black/10 px-2 rounded text-xs">Win ${payout.toLocaleString()}</span>
       </button>
    </div>
  );
};
