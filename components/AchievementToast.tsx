
import React from 'react';

interface AchievementToastProps {
  title: string;
  icon: string;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ title, icon }) => {
  return (
    <div className="fixed top-20 right-0 z-[100] animate-slide-in-right pointer-events-none pr-4">
      <div className="relative bg-[#F5F1E8] border-4 border-[#CA9208] rounded-lg shadow-[0_8px_0_rgba(0,0,0,0.2)] w-72 p-4 flex items-center gap-3 overflow-visible">
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine pointer-events-none rounded-lg"></div>

        {/* 3D Trophy Icon that pops out */}
        <div className="absolute -left-8 w-20 h-20 drop-shadow-lg transform -rotate-12">
            <svg viewBox="0 0 512 512" className="w-full h-full fill-[#FDCB2D] stroke-[#CA9208] stroke-[15]">
               <path d="M432,64H389.76a112.1,112.1,0,0,0-16.67-45.68C358.61,1.61,334.29,0,304,0H208c-30.29,0-54.61,1.61-69.09,18.32A112.1,112.1,0,0,0,122.24,64H80A80.09,80.09,0,0,0,0,144c0,38.32,26.72,70.64,62.43,78.14C70.69,272.74,112,310.88,167.27,329.66,182.89,390.34,226,439,288,458.46V480H192a16,16,0,0,0,0,32H320a16,16,0,0,0,0-32H224V458.46c62-19.44,105.11-68.12,120.73-128.8C400,310.88,441.31,272.74,449.57,222.14,485.28,214.64,512,182.32,512,144A80.09,80.09,0,0,0,432,64ZM80,192c-26.47,0-48-21.53-48-48s21.53-48,48-48h45c6.3,74.53,26.15,139.09,53.38,187.64C126.19,272.26,90.45,236.48,80,192Zm224-92.35V351.81c-5.31.42-10.63.81-16,.81a203.21,203.21,0,0,1-16.11-.83V32H304C329.3,32,345.89,48.51,349.55,99.65ZM162.45,99.65C166.11,48.51,182.7,32,208,32h32V283.19c-23.77,1.47-49,1.79-73.62-18.59C161.18,216.78,161.38,156.41,162.45,99.65ZM432,192c-10.45,44.48-46.19,80.26-98.38,91.64,27.23-48.55,47.08-113.11,53.38-187.64h45c26.47,0,48,21.53,48,48S458.47,192,432,192Z" />
            </svg>
        </div>

        <div className="flex flex-col flex-1 pl-12">
          <span className="text-[10px] uppercase font-black tracking-wider text-yellow-600">Quest Complete!</span>
          <span className="text-lg font-black text-slate-800 font-game leading-none">{title}</span>
          <span className="text-xs text-slate-600 font-semibold mt-1">{icon} Unlocked!</span>
        </div>
      </div>
    </div>
  );
};
