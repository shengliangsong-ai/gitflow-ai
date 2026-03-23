import React, { useEffect, useState, useRef } from 'react';
import { LogOut, GitMerge, Terminal as TerminalIcon, Map, LayoutDashboard, Command, FileText, Presentation as PresentationIcon, RefreshCw, ChevronDown, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Terminal from './components/Terminal';
import Roadmap from './components/Roadmap';
import LocalCLI from './components/LocalCLI';
import Architecture from './components/Architecture';
import Presentation from './components/Presentation';
import BenchmarkDoc from './components/BenchmarkDoc';
import TestingInstructions from './components/TestingInstructions';
import { trackPageView } from './analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'terminal' | 'roadmap' | 'cli' | 'architecture' | 'presentation' | 'benchmark' | 'testing'>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const docsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (docsRef.current && !docsRef.current.contains(event.target as Node)) {
        setIsDocsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSyncGithub = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    window.dispatchEvent(new CustomEvent('terminal-output', { detail: { type: 'output', content: 'Starting GitHub Sync...' } }));
    
    const url = `/api/gitlab/sync-github`;
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'projectId') {
        window.dispatchEvent(new CustomEvent('set-project-id', { detail: { projectId: data.projectId } }));
      } else if (data.message === "DONE") {
        eventSource.close();
        setIsSyncing(false);
      } else {
        window.dispatchEvent(new CustomEvent('terminal-output', { detail: { type: 'output', content: data.message } }));
      }
    };
    
    eventSource.onerror = (error) => {
      eventSource.close();
      setIsSyncing(false);
      window.dispatchEvent(new CustomEvent('terminal-output', { detail: { type: 'error', content: 'GitHub Sync Failed or Ended.' } }));
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
                <span className="text-xl font-bold tracking-tight hidden sm:block">GitFlow AI</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-1">
                <button
                  onClick={handleSyncGithub}
                  disabled={isSyncing}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSyncing ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 hover:text-purple-300'}`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Git'}
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

                <div className="relative" ref={docsRef}>
                  <button
                    onClick={() => setIsDocsOpen(!isDocsOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${['roadmap', 'architecture', 'benchmark', 'presentation', 'testing'].includes(activeTab) ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                  >
                    <FileText className="w-4 h-4" />
                    Docs
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDocsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDocsOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-50">
                      <button
                        onClick={() => { setActiveTab('testing'); setIsDocsOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors ${activeTab === 'testing' ? 'text-white bg-zinc-800/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                      >
                        <FileText className="w-4 h-4" />
                        Testing Guide
                      </button>
                      <button
                        onClick={() => { setActiveTab('architecture'); setIsDocsOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors ${activeTab === 'architecture' ? 'text-white bg-zinc-800/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                      >
                        <FileText className="w-4 h-4" />
                        Architecture
                      </button>
                      <button
                        onClick={() => { setActiveTab('benchmark'); setIsDocsOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors ${activeTab === 'benchmark' ? 'text-white bg-zinc-800/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                      >
                        <FileText className="w-4 h-4" />
                        Benchmark
                      </button>
                      <button
                        onClick={() => { setActiveTab('roadmap'); setIsDocsOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors ${activeTab === 'roadmap' ? 'text-white bg-zinc-800/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                      >
                        <Map className="w-4 h-4" />
                        Roadmap
                      </button>
                      <button
                        onClick={() => { setActiveTab('presentation'); setIsDocsOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors ${activeTab === 'presentation' ? 'text-white bg-zinc-800/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                      >
                        <PresentationIcon className="w-4 h-4" />
                        Pitch
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                title="Refresh Application"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-900 px-4 py-4 space-y-2">
            <button
              onClick={() => { handleSyncGithub(); setIsMobileMenuOpen(false); }}
              disabled={isSyncing}
              className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isSyncing ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'}`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Git'}
            </button>
            <button
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('terminal'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'terminal' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              <TerminalIcon className="w-4 h-4" />
              CLI Terminal
            </button>
            <button
              onClick={() => { setActiveTab('cli'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'cli' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              <Command className="w-4 h-4" />
              Local CLI
            </button>
            
            <div className="pt-2 pb-1 border-t border-zinc-800 mt-2">
              <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Documentation
              </div>
              <button
                onClick={() => { setActiveTab('testing'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'testing' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
              >
                <FileText className="w-4 h-4" />
                Testing Guide
              </button>
              <button
                onClick={() => { setActiveTab('architecture'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'architecture' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
              >
                <FileText className="w-4 h-4" />
                Architecture
              </button>
              <button
                onClick={() => { setActiveTab('benchmark'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'benchmark' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
              >
                <FileText className="w-4 h-4" />
                Benchmark
              </button>
              <button
                onClick={() => { setActiveTab('roadmap'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'roadmap' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
              >
                <Map className="w-4 h-4" />
                Roadmap
              </button>
              <button
                onClick={() => { setActiveTab('presentation'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'presentation' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
              >
                <PresentationIcon className="w-4 h-4" />
                Pitch
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        <div style={{ display: activeTab === 'terminal' ? 'block' : 'none' }}>
          <Terminal />
        </div>
        {activeTab === 'roadmap' && <Roadmap />}
        {activeTab === 'cli' && <LocalCLI />}
        {activeTab === 'architecture' && <Architecture />}
        {activeTab === 'benchmark' && <BenchmarkDoc />}
        {activeTab === 'presentation' && <Presentation />}
        {activeTab === 'testing' && <TestingInstructions />}
      </main>
    </div>
  );
}

