
import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, UserProfile } from '../types';
import { playerService } from '../services/playerService';

interface LeaderboardModalProps {
  user: UserProfile | null;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ user, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const data = playerService.getLeaderboard(user);
    setEntries(data);
  }, [user]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-flash-screen">
       {/* Close Overlay */}
       <div className="absolute inset-0" onClick={onClose}></div>

       <div className="relative bg-[#1C2B4B] w-full max-w-md max-h-[80vh] rounded-3xl border-2 border-[#FDCB2D] shadow-[0_0_50px_rgba(253,203,45,0.2)] flex flex-col overflow-hidden animate-pop-in">
          
          {/* Header */}
          <div className="bg-gradient-to-b from-[#FDCB2D] to-[#FFB016] p-6 flex items-center justify-between shrink-0 relative z-10 border-b-4 border-[#CA9208]">
             <div className="flex items-center gap-3">
                <div className="text-4xl filter drop-shadow-md">🏆</div>
                <div>
                   <h2 className="text-2xl font-black text-[#78350F] uppercase tracking-wide leading-none">Leaderboard</h2>
                   <p className="text-[#78350F]/70 text-xs font-bold uppercase tracking-wider mt-1">Global Rankings</p>
                </div>
             </div>
             <button onClick={onClose} className="bg-black/10 hover:bg-black/20 rounded-full p-2 transition-colors text-[#78350F]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0F172A]">
             {entries.map((entry) => (
                <div 
                   key={entry.id} 
                   className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all
                      ${entry.isCurrentUser 
                         ? 'bg-purple-900/30 border-purple-500 sticky -top-1 -bottom-1 z-10 shadow-lg backdrop-blur-md transform scale-[1.02]' 
                         : 'bg-slate-800/50 border-slate-700'
                      }
                   `}
                >
                   {/* Rank */}
                   <div className={`w-10 flex-shrink-0 text-center font-black text-xl italic
                      ${entry.rank === 1 ? 'text-[#FFD700] drop-shadow-[0_2px_4px_rgba(255,215,0,0.5)]' : 
                        entry.rank === 2 ? 'text-slate-300' : 
                        entry.rank === 3 ? 'text-amber-600' : 'text-slate-600'}
                   `}>
                      #{entry.rank}
                   </div>

                   {/* Avatar */}
                   <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border border-white/10">
                      <img src={entry.avatar} alt="Av" className="w-full h-full object-cover" />
                   </div>

                   {/* Info */}
                   <div className="flex-1 min-w-0">
                      <div className={`font-bold truncate ${entry.isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                         {entry.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                         {entry.gamerTag}
                      </div>
                   </div>

                   {/* Score */}
                   <div className="text-right">
                      <div className="text-xl font-black text-[#FDCB2D] leading-none">
                         {entry.score}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Streak</div>
                   </div>
                </div>
             ))}
          </div>

          {/* User Status Bar (if not in top list view, can show here, but sticky item handles it) */}
       </div>
    </div>
  );
};
