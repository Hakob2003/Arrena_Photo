"use client";
import React from 'react';

export default function CloudConnectionsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Cloud Storage</h1>
      <p className="text-gray-400 mb-10">Connect custom S3 buckets to host your own generated images and templates.</p>

      <div className="glass-card p-8 rounded-2xl border-t-2 border-t-blue-500">
        <h3 className="text-xl font-bold mb-6">AWS S3 / Cloudflare R2 / MinIO</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Endpoint URL</label>
            <input 
              type="text" 
              placeholder="https://s3.amazonaws.com or https://<id>.r2.cloudflarestorage.com"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Bucket Name</label>
            <input 
              type="text" 
              placeholder="my-ai-studio-bucket"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Access Key ID</label>
            <input 
              type="text" 
              placeholder="AKIAIOSFODNN7EXAMPLE"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Secret Access Key</label>
            <input 
              type="password" 
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button className="px-6 py-2 glass rounded-lg text-white font-medium hover:bg-white/10">Test Connection</button>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)]">Save Configuration</button>
        </div>
      </div>
    </div>
  );
}
