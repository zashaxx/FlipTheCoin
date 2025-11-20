
import React, { useState } from 'react';

interface OnboardingModalProps {
  onComplete: (name: string, age: number) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(18);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.length < 3) {
      setError('Name must be at least 3 characters.');
      return;
    }

    setIsSubmitting(true);
    onComplete(name, age);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/95 backdrop-blur-xl animate-flash-screen">
      <div className="w-full max-w-md p-8 mx-4 bg-[#1C2B4B] border border-purple-500/50 rounded-3xl shadow-[0_0_60px_rgba(168,85,247,0.3)] relative overflow-visible">
        
        {/* Background Decoration */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
             <div className="inline-block bg-purple-900/50 p-4 rounded-full mb-4 border border-purple-500/30 shadow-inner">
                <span className="text-4xl">🚀</span>
             </div>
             <h2 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-sm">
                New Profile
             </h2>
             <p className="text-slate-400 text-sm font-medium mt-2">
                Enter your details to join the cosmic leaderboard.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-widest pl-1">
                Codename
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/80 border-2 border-slate-700 focus:border-purple-500 rounded-xl px-4 py-4 text-white outline-none transition-all placeholder-slate-600 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)] text-lg font-bold"
                placeholder="e.g. StarLord"
                maxLength={15}
                autoFocus
              />
            </div>

            {/* Age Slider */}
            <div className="space-y-4">
               <div className="flex justify-between items-end px-1">
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-widest">
                    Age
                  </label>
                  <span className="text-2xl font-black text-white tabular-nums leading-none text-stroke-sm">{age}</span>
               </div>
               
               <div className="relative h-12 flex items-center">
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    value={age} 
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full absolute z-20 opacity-0 cursor-pointer h-full"
                  />
                  {/* Custom Track */}
                  <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative z-10 pointer-events-none">
                     <div 
                       className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                       style={{ width: `${((age - 5) / 95) * 100}%` }}
                     ></div>
                  </div>
                  {/* Custom Thumb (Visual only, positioned by calculation) */}
                  <div 
                    className="absolute h-8 w-8 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] border-4 border-purple-600 z-10 pointer-events-none transition-all duration-100 flex items-center justify-center transform -translate-x-1/2"
                    style={{ left: `${((age - 5) / 95) * 100}%` }}
                  >
                     <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  </div>
               </div>
               <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">
                  <span>Youngling (5)</span>
                  <span>Ancient (100)</span>
               </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center font-bold animate-shake-intense bg-red-900/20 py-2 rounded-lg border border-red-500/20">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 rounded-xl font-black text-xl uppercase tracking-widest transition-all transform active:scale-95
                ${isSubmitting 
                  ? 'bg-slate-700 text-slate-500 cursor-wait' 
                  : 'bg-gradient-to-r from-[#FDCB2D] to-[#FFB016] text-[#78350F] shadow-[0_10px_20px_rgba(253,203,45,0.3)] hover:brightness-110 hover:shadow-[0_10px_30px_rgba(253,203,45,0.5)] border-b-4 border-[#CA9208]'
                }
              `}
            >
              {isSubmitting ? 'Initialising...' : 'Start Game'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
