
import React, { useRef } from 'react';
import { SHOP_ITEMS } from '../utils/shopItems';
import { Trophy } from '../types';

interface ShopModalProps {
  cash: number;
  inventory: string[];
  onBuy: (item: Trophy) => void;
  onClose: () => void;
  onEasterEgg: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ cash, inventory, onBuy, onClose, onEasterEgg }) => {
  const voidCrystalClicks = useRef(0);

  const handleItemClick = (item: Trophy) => {
      if (item.id === 't_amethyst') {
          voidCrystalClicks.current += 1;
          if (voidCrystalClicks.current === 7) {
              onEasterEgg();
              voidCrystalClicks.current = 0;
          }
      }
      
      const isOwned = inventory.includes(item.id);
      const canAfford = cash >= item.price;
      
      if (!isOwned && canAfford) {
          onBuy(item);
      }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-pop-in">
      {/* Close Overlay */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-[#1C2B4B] w-full max-w-2xl max-h-[85vh] rounded-3xl border-4 border-[#FFD700] shadow-[0_0_100px_rgba(255,215,0,0.2)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-b from-[#FDCB2D] to-[#CA9208] p-6 flex items-center justify-between shrink-0 relative z-10">
           <div className="flex items-center gap-4">
              <div className="text-5xl drop-shadow-md">🏪</div>
              <div>
                 <h2 className="text-3xl font-black text-[#78350F] uppercase tracking-wide leading-none">Flex Shop</h2>
                 <p className="text-[#78350F]/70 text-sm font-bold uppercase tracking-wider mt-1">Spend your winnings</p>
              </div>
           </div>
           
           <div className="flex flex-col items-end">
              <div className="bg-[#78350F]/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                 <span className="text-[#78350F] font-black text-xl">Balance: ${cash.toLocaleString()}</span>
              </div>
              <button onClick={onClose} className="mt-2 text-[#78350F] font-bold hover:underline">Close</button>
           </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0F172A]">
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
             {SHOP_ITEMS.map((item) => {
                const isOwned = inventory.includes(item.id);
                const canAfford = cash >= item.price;

                return (
                  <div 
                    key={item.id}
                    className={`
                       relative p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all duration-300 group select-none
                       ${isOwned 
                         ? 'bg-green-900/30 border-green-500/50 opacity-80' 
                         : (canAfford ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-[#FFD700] hover:scale-105 hover:shadow-xl cursor-pointer' : 'bg-slate-900 border-slate-800 opacity-60')
                       }
                    `}
                    style={{
                       boxShadow: isOwned ? 'none' : undefined
                    }}
                    onClick={() => handleItemClick(item)}
                  >
                     {/* Glow Effect */}
                     <div 
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
                        style={{ backgroundColor: item.glowColor, boxShadow: `0 0 20px ${item.glowColor}` }}
                     ></div>

                     <div 
                       className="text-5xl mb-3 filter drop-shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300"
                       style={{ filter: `drop-shadow(0 0 10px ${item.glowColor})` }}
                     >
                        {item.icon}
                     </div>
                     
                     <div className="font-bold text-white text-sm uppercase tracking-wider mb-1">{item.name}</div>
                     
                     {isOwned ? (
                        <div className="mt-auto bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">Owned</div>
                     ) : (
                        <div className={`mt-auto font-black text-lg ${canAfford ? 'text-[#FFD700]' : 'text-red-400'}`}>
                           ${item.price.toLocaleString()}
                        </div>
                     )}
                  </div>
                );
             })}
           </div>
        </div>
      </div>
    </div>
  );
};
