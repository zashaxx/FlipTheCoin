
import React from 'react';
import { Achievement } from '../types';

interface AchievementListProps {
  achievements: Achievement[];
}

export const AchievementList: React.FC<AchievementListProps> = ({ achievements }) => {
  return (
    <div className="w-full mt-8">
       <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Achievements</h3>
       <div className="space-y-3">
          {achievements.map(a => {
             if (a.secret && !a.unlocked) return null; // Hide secret achievements until unlocked

             return (
               <div key={a.id} className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${a.unlocked ? 'bg-slate-800/50 border-purple-500/30' : 'bg-slate-900/30 border-slate-800 opacity-50 grayscale'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${a.unlocked ? 'bg-purple-900 text-purple-200' : 'bg-slate-800 text-slate-600'}`}>
                    {a.icon}
                  </div>
                  <div className="flex-1">
                     <div className={`text-sm font-bold tracking-wide ${a.unlocked ? 'text-white' : 'text-slate-500'}`}>{a.title}</div>
                     <div className="text-xs text-slate-400 leading-tight">{a.description}</div>
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
};
