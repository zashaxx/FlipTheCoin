
import React, { useState } from 'react';
import { UserProfile, Friend } from '../types';

interface SocialMenuProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (tag: string) => void;
  onRemoveFriend: (id: string) => void;
  onLogout: () => void;
}

export const SocialMenu: React.FC<SocialMenuProps> = ({ user, isOpen, onClose, onAddFriend, onRemoveFriend, onLogout }) => {
  const [addInput, setAddInput] = useState('');
  const [activeTab, setActiveTab] = useState<'FRIENDS' | 'PROFILE'>('FRIENDS');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addInput.trim()) {
      onAddFriend(addInput.trim());
      setAddInput('');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm transition-opacity"></div>}
      
      {/* Menu Panel */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-[#1C2B4B] border-l-4 border-purple-500 shadow-2xl transform transition-transform duration-300 z-[100] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 bg-slate-900/50 border-b border-purple-500/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-br from-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
               <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full bg-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-white truncate">{user.name}</h3>
              <p className="text-xs text-purple-300 font-mono bg-purple-900/30 px-2 py-1 rounded inline-block border border-purple-500/30 truncate max-w-full">
                 {user.gamerTag}
              </p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2">
             <button 
                onClick={() => setActiveTab('FRIENDS')} 
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'FRIENDS' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
             >
                Friends ({user.friends.length})
             </button>
             <button 
                onClick={() => setActiveTab('PROFILE')} 
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'PROFILE' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
             >
                Profile
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
           
           {activeTab === 'FRIENDS' && (
             <div className="space-y-6">
                {/* Add Friend Form */}
                <form onSubmit={handleAddSubmit} className="relative">
                   <input 
                     type="text" 
                     value={addInput}
                     onChange={(e) => setAddInput(e.target.value)}
                     placeholder="Add Friend (e.g. Luna#1234)"
                     className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-10 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                   />
                   <button type="submit" className="absolute right-2 top-2 p-1 bg-purple-600 rounded-lg text-white hover:bg-purple-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                   </button>
                </form>

                {/* Friend List */}
                <div className="space-y-3">
                   {user.friends.length === 0 ? (
                     <div className="text-center text-slate-500 text-sm py-8">
                        <p className="mb-2">No friends yet.</p>
                        <p className="text-xs">Try adding <span className="text-purple-400 cursor-pointer select-all" onClick={() => setAddInput('Luna#1234')}>Luna#1234</span></p>
                     </div>
                   ) : (
                     user.friends.map(friend => (
                       <div key={friend.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 group">
                          <div className="flex items-center gap-3">
                             <div className="relative">
                               <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                  {friend.name[0]}
                               </div>
                               <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-800 ${friend.status === 'online' ? 'bg-green-500' : (friend.status === 'playing' ? 'bg-purple-500' : 'bg-slate-500')}`}></div>
                             </div>
                             <div>
                                <div className="text-sm font-bold text-white">{friend.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{friend.status === 'playing' ? 'Flipping Coins' : friend.status}</div>
                             </div>
                          </div>
                          <button 
                            onClick={() => onRemoveFriend(friend.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                             </svg>
                          </button>
                       </div>
                     ))
                   )}
                </div>
             </div>
           )}

           {activeTab === 'PROFILE' && (
             <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Identity</h4>
                   <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                         <span className="text-slate-400">Name</span>
                         <span className="text-white font-medium">{user.name}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-slate-400">Age</span>
                         <span className="text-white font-medium">{user.age}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-slate-400">Email</span>
                         <span className="text-white font-medium truncate max-w-[150px]">{user.email}</span>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={onLogout} 
                  className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors uppercase tracking-wider"
                >
                   Log Out
                </button>
             </div>
           )}

        </div>
      </div>
    </>
  );
};
