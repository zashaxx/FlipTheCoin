
import React from 'react';
import { Achievement, AchievementRarity } from '../types';

interface AchievementListProps {
  achievements: Achievement[];
}

const RARITY_ORDER = [
  AchievementRarity.COMMON,
  AchievementRarity.RARE,
  AchievementRarity.EPIC,
  AchievementRarity.LEGENDARY,
  AchievementRarity.MYTHIC
];

const RARITY_STYLES = {
  [AchievementRarity.COMMON]: { label: 'Common', bg: 'bg-slate-500', text: 'text-slate-300', border: 'border-slate-600' },
  [AchievementRarity.RARE]: { label: 'Rare', bg: 'bg-blue-500', text: 'text-blue-300', border: 'border-blue-600' },
  [AchievementRarity.EPIC]: { label: 'Epic', bg: 'bg-purple-500', text: 'text-purple-300', border: 'border-purple-600' },
  [AchievementRarity.LEGENDARY]: { label: 'Legendary', bg: 'bg-yellow-500', text: 'text-yellow-300', border: 'border-yellow-600' },
  [AchievementRarity.MYTHIC]: { label: 'Mythic', bg: 'bg-cyan-500', text: 'text-cyan-300', border: 'border-cyan-500' },
};

export const AchievementList: React.FC<AchievementListProps> = ({ achievements }) => {
  
  const grouped = RARITY_ORDER.map(r => ({
    rarity: r,
    items: achievements.filter(a => a.rarity === r)
  })).filter(g => g.items.length > 0);

  return (
    <div className="w-full mt-2 pb-10">
       <div className="space-y-6">
          {grouped.map(group => {
             const style = RARITY_STYLES[group.rarity];
             return (
               <div key={group.rarity}>
                 <div className={`text-[10px] font-black uppercase tracking-widest mb-2 pl-1 ${style.text}`}>
                    {style.label} TIER
                 </div>
                 <div className="space-y-3">
                    {group.items.map(a => {
                       if (a.secret && !a.unlocked) return null;

                       return (
                         <div 
                            key={a.id} 
                            className={`flex items-center gap-4 p-3 rounded-lg border transition-all relative overflow-hidden group
                              ${a.unlocked 
                                ? `bg-slate-800/80 ${style.border}/40` 
                                : 'bg-slate-900/40 border-slate-800 opacity-60 grayscale'}
                            `}
                         >
                            {a.unlocked && <div className={`absolute inset-0 opacity-5 bg-gradient-to-r from-transparent via-${style.bg.replace('bg-','')} to-transparent animate-shine`}></div>}
                            
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner flex-shrink-0 ${a.unlocked ? `${style.bg}/20 ${style.text}` : 'bg-slate-800 text-slate-600'}`}>
                              {a.icon}
                            </div>
                            <div className="flex-1 min-w-0 z-10">
                               <div className={`text-sm font-bold tracking-wide truncate ${a.unlocked ? 'text-white' : 'text-slate-500'}`}>
                                 {a.title}
                               </div>
                               <div className="text-xs text-slate-400 leading-tight truncate">
                                 {a.description}
                               </div>
                               {/* Reward Badge */}
                               <div className="mt-1.5 flex">
                                 <span className={`text-[10px] font-black px-2 py-0.5 rounded bg-black/30 ${a.unlocked ? 'text-green-400' : 'text-slate-600'}`}>
                                    ${a.reward} CASH
                                 </span>
                               </div>
                            </div>
                            {a.unlocked && (
                              <div className="text-xs text-green-400 font-bold">✓</div>
                            )}
                         </div>
                       );
                    })}
                 </div>
               </div>
             )
          })}
       </div>
    </div>
  );
};
