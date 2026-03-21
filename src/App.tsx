import React, { useEffect, useState } from 'react';
import { LogOut, GitMerge, Terminal as TerminalIcon, Map, LayoutDashboard, Command, FileText, Presentation as PresentationIcon, RefreshCw } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Terminal from './components/Terminal';
import Roadmap from './components/Roadmap';
import LocalCLI from './components/LocalCLI';
import Architecture from './components/Architecture';
import Presentation from './components/Presentation';
import BenchmarkDoc from './components/BenchmarkDoc';
import { trackPageView } from './analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'terminal' | 'roadmap' | 'cli' | 'architecture' | 'presentation' | 'benchmark'>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    trackPageView(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab) {
        setActiveTab(customEvent.detail.tab);
      }
    };
    window.addEventListener('switch-tab', handleSwitchTab);
    return () => window.removeEventListener('switch-tab', handleSwitchTab);
  }, []);

  const handleSyncGithub = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    const url = `/api/gitlab/sync-github`;
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'projectId') {
        window.dispatchEvent(new CustomEvent('set-project-id', { detail: { projectId: data.projectId } }));
      } else if (data.message === "DONE") {
        eventSource.close();
        setIsSyncing(false);
        setActiveTab('terminal');
      }
    };
    
    eventSource.onerror = (error) => {
      eventSource.close();
      setIsSyncing(false);
      alert("GitHub Sync Failed or Ended.");
    };
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 mr-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <GitMerge className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-xl font-bold tracking-tight hidden sm:block">AI Merge Queue</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleSyncGithub}
                  disabled={isSyncing}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSyncing ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 hover:text-purple-300'}`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync GitHub'}
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'terminal' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                  <TerminalIcon className="w-4 h-4" />
                  CLI Terminal
                </button>
                <button
                  onClick={() => setActiveTab('cli')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'cli' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                  <Command className="w-4 h-4" />
                  Local CLI
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'roadmap' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                  <Map className="w-4 h-4" />
                  Roadmap
                </button>
                <button
                  onClick={() => setActiveTab('architecture')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'architecture' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                  <FileText className="w-4 h-4" />
                  Architecture
                </button>
                <button
                  onClick={() => setActiveTab('benchmark')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'benchmark' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                  <FileText className="w-4 h-4" />
                  Benchmark
                </button>
                <button
                  onClick={() => setActiveTab('presentation')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'presentation' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                  <PresentationIcon className="w-4 h-4" />
                  Pitch
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="hidden sm:inline-block">Guest User</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'terminal' && <Terminal />}
        {activeTab === 'roadmap' && <Roadmap />}
        {activeTab === 'cli' && <LocalCLI />}
        {activeTab === 'architecture' && <Architecture />}
        {activeTab === 'benchmark' && <BenchmarkDoc />}
        {activeTab === 'presentation' && <Presentation />}
      </main>
    </div>
  );
}

