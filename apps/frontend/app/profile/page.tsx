"use client";
import React from 'react';
import { useAuthStore } from '../../store';

export default function ProfilePage() {
  const { user, credits } = useAuthStore();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-10">Account Settings</h1>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="glass-card p-8 rounded-2xl flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-4xl text-white font-bold shadow-[0_0_30px_rgba(99,102,241,0.4)]">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-400">{user?.email}</p>
            <div className="mt-3 inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300">
              {user?.role}
            </div>
          </div>
          <button className="px-5 py-2 glass rounded-lg hover:bg-white/10 text-sm font-medium">Edit Profile</button>
        </div>

        {/* Billing / Credits */}
        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>💳</span> Billing & Credits
          </h3>
          
          <div className="flex items-center justify-between p-6 bg-black/40 rounded-xl border border-white/5">
            <div>
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                {credits.toLocaleString()} <span className="text-lg text-gray-500 font-medium">CR</span>
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform">
              Buy Credits
            </button>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Subscription Tier</h4>
            <div className="flex items-center justify-between p-4 border border-indigo-500/30 bg-indigo-500/5 rounded-xl">
              <div>
                <p className="font-bold text-lg text-white">Pro Plan</p>
                <p className="text-sm text-gray-400">Next billing date: 24 July 2026</p>
              </div>
              <button className="text-indigo-400 text-sm font-bold hover:text-white">Manage</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
