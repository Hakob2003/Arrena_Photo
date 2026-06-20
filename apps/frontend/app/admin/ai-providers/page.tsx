"use client";
import React, { useState } from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { Badge } from '../../../components/admin/Badge';
import { ChatTest } from '../../../components/ai/ChatTest';

export default function AdminAiProviders() {
  const [activeTab, setActiveTab] = useState<'settings' | 'test'>('settings');

  return (
    <>
      <PageHeader 
        title="AI Providers" 
        description="Unified OpenRouter integration settings and tests."
      />

      <div className="mb-6 flex space-x-4 border-b border-border pb-2">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'settings' ? 'text-foreground border-b-2 border-primary-500' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Settings
        </button>
        <button 
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'test' ? 'text-foreground border-b-2 border-primary-500' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Test Connection
        </button>
      </div>

      {activeTab === 'settings' ? (
        <div className="grid gap-6">
          <div className="bg-muted border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">OpenRouter Configuration</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="success">ACTIVE</Badge>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Default Model</span>
                <span className="font-mono text-foreground bg-background/50 px-2 py-1 rounded text-sm">openrouter/free</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground">Fallback Logic</span>
                <span className="text-muted-foreground text-sm">Active (returns to openrouter/free on fail)</span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Usage Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background/30 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Total Tokens Used</p>
                <p className="text-2xl font-bold text-foreground">1,492,050</p>
              </div>
              <div className="bg-background/30 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Input Tokens</p>
                <p className="text-xl font-semibold text-muted-foreground">840,100</p>
              </div>
              <div className="bg-background/30 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Output Tokens</p>
                <p className="text-xl font-semibold text-muted-foreground">651,950</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl">
          <h3 className="text-lg font-semibold text-foreground mb-4">Live Test</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Test your OpenRouter connection. Tokens are streamed directly from the backend via Server-Sent Events (SSE).
          </p>
          <ChatTest />
        </div>
      )}
    </>
  );
}
