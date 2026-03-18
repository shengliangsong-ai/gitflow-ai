import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Branch, PullRequest } from '../types';
import { GitBranch, GitPullRequest, GitMerge, Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, Play, Zap } from 'lucide-react';
import CreatePRModal from './CreatePRModal';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const branchesUnsub = onSnapshot(collection(db, 'branches'), async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial branches
        const initialBranches = [
          { name: 'primary', type: 'primary', status: 'active' },
          { name: 'release-v1.0', type: 'release', status: 'active' },
          { name: 'feat/ai-merge', type: 'project', status: 'active', teamId: 'team-alpha' },
          { name: 'fix/auth-bug', type: 'project', status: 'active', teamId: 'team-beta' },
        ];
        for (const b of initialBranches) {
          await addDoc(collection(db, 'branches'), b);
        }
      } else {
        setBranches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch)));
      }
    });

    const prsUnsub = onSnapshot(collection(db, 'pullRequests'), (snapshot) => {
      setPullRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PullRequest)));
    });

    return () => {
      branchesUnsub();
      prsUnsub();
    };
  }, []);

  const handleCreatePR = async (data: Partial<PullRequest>) => {
    try {
      await addDoc(collection(db, 'pullRequests'), {
        ...data,
        authorId: user.uid,
        status: 'code_review',
        priority: 'normal',
        queuePosition: Date.now(),
        logs: ['PR created. Awaiting code review.'],
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating PR:", error);
    }
  };

  const processPR = async (pr: PullRequest) => {
    try {
      // 0. Update status to analyzing
      await updateDoc(doc(db, 'pullRequests', pr.id), {
        status: 'testing',
        logs: [...pr.logs, 'Starting Semantic Intent Analysis...']
      });

      const intentRes = await fetch('/api/ai/analyze-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prTitle: pr.title, files: JSON.parse(pr.files || '[]') })
      });
      const intentData = await intentRes.json();

      await updateDoc(doc(db, 'pullRequests', pr.id), {
        semanticAnalysis: intentData,
        logs: [...pr.logs, 'Starting Semantic Intent Analysis...', 'Semantic Intent Analysis complete. Starting AI tests...']
      });

      // 1. Call backend to run tests
      const testRes = await fetch('/api/ai/run-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prTitle: pr.title, files: JSON.parse(pr.files || '[]') })
      });
      const testData = await testRes.json();
      
      if (!testData.success) {
        await updateDoc(doc(db, 'pullRequests', pr.id), {
          status: 'failed',
          logs: [...pr.logs, 'Starting Semantic Intent Analysis...', 'Semantic Intent Analysis complete. Starting AI tests...', ...testData.logs, 'Tests failed.']
        });
        return;
      }

      await updateDoc(doc(db, 'pullRequests', pr.id), {
        status: 'conflict',
        logs: [...pr.logs, 'Starting Semantic Intent Analysis...', 'Semantic Intent Analysis complete. Starting AI tests...', ...testData.logs, 'Tests passed. Checking for conflicts...', 'Conflict detected!']
      });

      // 2. Call backend to resolve conflicts
      const resolveRes = await fetch('/api/ai/resolve-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prTitle: pr.title, files: JSON.parse(pr.files || '[]') })
      });
      const resolveData = await resolveRes.json();

      // 3. Update status to merged
      await updateDoc(doc(db, 'pullRequests', pr.id), {
        status: 'merged',
        logs: [...pr.logs, 'Starting Semantic Intent Analysis...', 'Semantic Intent Analysis complete. Starting AI tests...', ...testData.logs, 'Tests passed. Checking for conflicts...', 'Conflict detected!', ...resolveData.logs, 'AI successfully resolved conflicts and merged PR.'],
        files: JSON.stringify(resolveData.resolvedFiles || [])
      });

    } catch (error) {
      console.error("Error processing PR:", error);
      await updateDoc(doc(db, 'pullRequests', pr.id), {
        status: 'failed',
        logs: [...pr.logs, 'Error occurred during AI processing.']
      });
    }
  };

  const handleBiWeeklySync = async () => {
    setIsSyncing(true);
    try {
      // Simulate the 2-week sync
      // 1. Get all active project branches
      const activeProjectBranches = branches.filter(b => b.type === 'project' && b.status === 'active');
      
      // 2. Create a "Sync PR" for each
      for (const branch of activeProjectBranches) {
        const prRef = await addDoc(collection(db, 'pullRequests'), {
          title: `Bi-Weekly Sync: ${branch.name} to primary`,
          sourceBranch: branch.name,
          targetBranch: 'primary',
          authorId: 'ai-system',
          status: 'merge_queue',
          priority: 'high',
          queuePosition: Date.now(),
          logs: ['Initiated bi-weekly auto-sync. Added to merge queue.'],
          files: '[]'
        });
        
        // Simulate processing
        await updateDoc(doc(db, 'pullRequests', prRef.id), {
          status: 'merged',
          logs: ['Initiated bi-weekly auto-sync.', 'AI resolved any conflicts.', 'Merged successfully.', 'Rebased new project branch from primary.']
        });
      }
      
    } catch (error) {
      console.error("Error during sync:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
      case 'code_review':
      case 'addressing_comments': return <Clock className="w-5 h-5 text-zinc-400" />;
      case 'merge_queue': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'merging':
      case 'testing':
      case 'conflict': return <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />;
      case 'merged': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'failed':
      case 'removed': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'code_review':
      case 'addressing_comments': return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case 'merge_queue': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'merging':
      case 'testing':
      case 'conflict': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'merged': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'failed':
      case 'removed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'normal': return 'text-zinc-400 bg-zinc-800 border-zinc-700';
      case 'low': return 'text-zinc-500 bg-zinc-900 border-zinc-800';
      default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  const sortedPRs = [...pullRequests].sort((a, b) => {
    const priorityWeight = { high: 3, normal: 2, low: 1 };
    const weightA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
    const weightB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
    if (weightA !== weightB) return weightB - weightA;
    return (a.queuePosition || 0) - (b.queuePosition || 0);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Branches & Actions */}
      <div className="space-y-6">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-400" />
              Repository Branches
            </h2>
          </div>
          
          <div className="space-y-4">
            {['primary', 'release', 'project'].map(type => (
              <div key={type}>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{type} Branches</h3>
                <div className="space-y-2">
                  {branches.filter(b => b.type === type).length === 0 ? (
                    <p className="text-sm text-zinc-600 italic">No {type} branches</p>
                  ) : (
                    branches.filter(b => b.type === type).map(branch => (
                      <div key={branch.id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800/50">
                        <span className="font-mono text-sm">{branch.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${branch.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          {branch.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Workflow Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors border border-zinc-700"
            >
              <Plus className="w-5 h-5" />
              New Pull Request
            </button>
            <button
              onClick={handleBiWeeklySync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Trigger Bi-Weekly Sync'}
            </button>
            <p className="text-xs text-zinc-500 text-center mt-2">
              Auto-merges all project branches to primary and rebases.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: PR Queue */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 min-h-[600px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-indigo-400" />
              AI Merge Queue
            </h2>
            <div className="text-sm text-zinc-400">
              {pullRequests.filter(pr => ['code_review', 'addressing_comments', 'merge_queue', 'merging', 'testing', 'conflict'].includes(pr.status)).length} Active
            </div>
          </div>

          <div className="space-y-4">
            {pullRequests.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <GitPullRequest className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No pull requests in the queue.</p>
              </div>
            ) : (
              sortedPRs.map(pr => (
                <div key={pr.id} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-zinc-500">#{pr.id.slice(0, 6)}</span>
                        {pr.priority && (
                          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${getPriorityColor(pr.priority)}`}>
                            {pr.priority}
                          </span>
                        )}
                        {pr.groupId && (
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-purple-500/20 bg-purple-500/10 text-purple-400">
                            Group: {pr.groupId}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-zinc-100">{pr.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
                        <span className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-xs">{pr.sourceBranch}</span>
                        <span>&rarr;</span>
                        <span className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-xs">{pr.targetBranch}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {['code_review', 'addressing_comments', 'merge_queue'].includes(pr.status) && (
                        <button
                          onClick={() => processPR(pr)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Start AI Merge
                        </button>
                      )}
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(pr.status)}`}>
                        {getStatusIcon(pr.status)}
                        <span className="capitalize">{pr.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>
                  
                  {pr.semanticAnalysis && (
                    <div className="mt-4 bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          Semantic Intent Analysis
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          pr.semanticAnalysis.riskLevel === 'high' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                          pr.semanticAnalysis.riskLevel === 'medium' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                          'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                        }`}>
                          Risk: {pr.semanticAnalysis.riskLevel}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 mb-3">{pr.semanticAnalysis.intentSummary}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Affected Systems</div>
                          <div className="flex flex-wrap gap-1">
                            {pr.semanticAnalysis.affectedSystems.map((sys, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">{sys}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Logical Conflicts</div>
                          <ul className="list-disc pl-3 text-xs text-zinc-400 space-y-0.5">
                            {pr.semanticAnalysis.logicalConflicts.length > 0 ? (
                              pr.semanticAnalysis.logicalConflicts.map((conf, i) => <li key={i}>{conf}</li>)
                            ) : (
                              <li className="text-emerald-400/70 list-none">None detected</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {pr.logs && pr.logs.length > 0 && (
                    <div className="mt-4 bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                      <div className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">AI Agent Logs</div>
                      <div className="space-y-1 font-mono text-xs text-zinc-400 max-h-32 overflow-y-auto">
                        {pr.logs.map((log, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-zinc-600">❯</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreatePRModal 
          branches={branches} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={handleCreatePR} 
        />
      )}
    </div>
  );
}
