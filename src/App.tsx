import React, { useEffect, useState } from 'react';
import { auth, loginWithGoogle, logout } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LogOut, GitMerge, Terminal as TerminalIcon, Map, LayoutDashboard } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Terminal from './components/Terminal';
import Roadmap from './components/Roadmap';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'terminal' | 'roadmap'>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
        <div className="max-w-md w-full p-8 bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-500/20 rounded-full">
              <GitMerge className="w-12 h-12 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">AI Auto-Merge Queue</h1>
          <p className="text-zinc-400 mb-8">GitLab Hackathon Project</p>
          <button
            onClick={loginWithGoogle}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

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
                  onClick={() => setActiveTab('roadmap')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'roadmap' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                  <Map className="w-4 h-4" />
                  Roadmap
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-zinc-700" />
                <span className="hidden sm:inline-block">{user.displayName}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard user={user} />}
        {activeTab === 'terminal' && <Terminal />}
        {activeTab === 'roadmap' && <Roadmap />}
      </main>
    </div>
  );
}

