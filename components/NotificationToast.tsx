
import React from 'react';

interface NotificationToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, type = 'info' }) => {
  let bg = 'bg-slate-800';
  let border = 'border-slate-600';
  let text = 'text-white';

  if (type === 'error') { bg = 'bg-red-900'; border = 'border-red-500'; text = 'text-red-100'; }
  if (type === 'success') { bg = 'bg-green-900'; border = 'border-green-500'; text = 'text-green-100'; }

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] animate-pop-in pointer-events-none">
       <div className={`${bg} ${border} ${text} border-2 px-6 py-3 rounded-full shadow-xl font-bold text-sm flex items-center gap-2`}>
          {type === 'error' && <span>⚠️</span>}
          {type === 'success' && <span>🎉</span>}
          {message}
       </div>
    </div>
  );
};
