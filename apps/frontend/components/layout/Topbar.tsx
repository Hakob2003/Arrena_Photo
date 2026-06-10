"use client";
import { useAuthStore } from '../../store';

export function Topbar() {
  const { user, credits } = useAuthStore();

  return (
    <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search prompts, templates, creators..." 
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      <div className="flex items-center gap-6 ml-4">
        {/* Credits Pill */}
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
          <span className="text-indigo-400 text-sm font-bold">⚡ {credits.toLocaleString()}</span>
          <span className="text-xs text-indigo-300/70 uppercase">Credits</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 ring-white/20 transition-all">
            {user?.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
