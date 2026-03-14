'use client';

import { Menu } from 'lucide-react';

export function AdminTopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 bg-brand-white border-b-3 border-brand-black flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 md:ml-64 w-full md:w-[calc(100%-16rem)] backdrop-blur-sm bg-brand-white/90 transition-all">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-brand-black/70 hover:text-brand-black">
          <Menu size={24} />
        </button>
        <div>
          <p className="text-sm font-bold text-brand-black">Admin Panel</p>
          <p className="text-xs text-brand-black/70">Internal (sample data)</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-2 py-1 text-xs font-bold rounded-[2px] uppercase bg-paper-white text-brand-black border-2 border-brand-black">Sample</span>
      </div>
    </header>
  );
}
