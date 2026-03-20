import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Branch, PullRequest } from '../types';
import { GitBranch, GitPullRequest, GitMerge, Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, Play, Zap, Users } from 'lucide-react';
import CreatePRModal from './CreatePRModal';
import { createGitgraph, templateExtend, TemplateName } from '@gitgraph/js';

export default function Dashboard() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [commits, setCommits] = useState<any[]>([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);

  useEffect(() => {
    // Fetch projects
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/gitlab/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          const gitflowProject = data.find((p: any) => p.name === 'gitflow-ai');
          if (gitflowProject) {
            setSelectedProjectId(gitflowProject.id.toString());
          } else {
            // Auto create gitflow-ai if it doesn't exist
            try {
              const createRes = await fetch('/api/gitlab/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'gitflow-ai' })
              });
              if (createRes.ok) {
                const newProject = await createRes.json();
                setProjects([...data, newProject]);
                setSelectedProjectId(newProject.id.toString());
              } else if (data.length > 0) {
                setSelectedProjectId(data[0].id.toString());
              }
            } catch (createErr) {
              console.error("Failed to auto-create gitflow-ai", createErr);
              if (data.length > 0) {
                setSelectedProjectId(data[0].id.toString());
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };
    fetchProjects();

    const prsUnsub = onSnapshot(collection(db, 'pullRequests'), (snapshot) => {
      setPullRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PullRequest)));
    });

    return () => {
      prsUnsub();
    };
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    
    const fetchBranches = async () => {
      setIsLoadingBranches(true);
      try {
        const res = await fetch(`/api/gitlab/projects/${selectedProjectId}/branches`);
        if (res.ok) {
          const data = await res.json();
          const mappedBranches: Branch[] = data.map((b: any) => {
            let type: 'primary' | 'release' | 'project' = 'project';
            if (b.name === 'main' || b.name === 'master') type = 'primary';
            else if (b.name.startsWith('release')) type = 'release';
            
            return {
              id: b.name,
              name: b.name,
              type,
              status: 'active'
            };
          });
          setBranches(mappedBranches);
        }
      } catch (error) {
        console.error("Failed to fetch branches", error);
      } finally {
        setIsLoadingBranches(false);
      }
    };

    const fetchCommits = async () => {
      setIsLoadingCommits(true);
      try {
        const res = await fetch(`/api/gitlab/graph/${selectedProjectId}`);
        if (res.ok) {
          const data = await res.json();
          setCommits(data);
        }
      } catch (error) {
        console.error("Failed to fetch commits", error);
      } finally {
        setIsLoadingCommits(false);
      }
    };

    fetchBranches();
    fetchCommits();
  }, [selectedProjectId]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsCreatingProject(true);
    try {
      const res = await fetch('/api/gitlab/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName })
      });
      if (res.ok) {
        const newProject = await res.json();
        setProjects([...projects, newProject]);
        setSelectedProjectId(newProject.id.toString());
        setNewProjectName('');
      }
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleCreatePR = async (data: Partial<PullRequest>) => {
    try {
      await addDoc(collection(db, 'pullRequests'), {
        ...data,
        authorId: 'anonymous',
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

  const handleSimulateTeam = async () => {
    // Switch to terminal tab to see the output
    const terminalTab = document.querySelector('button[aria-label="Terminal"]') as HTMLButtonElement;
    if (terminalTab) terminalTab.click();

    // The terminal will handle the SSE connection
    // We can trigger it by dispatching a custom event or just let the user know
    // Actually, we can just navigate to the terminal and run the command
    window.dispatchEvent(new CustomEvent('run-demo', { detail: { phase: 'team' } }));
  };

  const handleSimulateConflict = async () => {
    // Switch to terminal tab
    const terminalTab = document.querySelector('button[aria-label="Terminal"]') as HTMLButtonElement;
    if (terminalTab) terminalTab.click();

    window.dispatchEvent(new CustomEvent('run-demo', { detail: { phase: 'conflict' } }));
  };

  const handleClearQueue = async () => {
    try {
      const q = query(collection(db, 'pullRequests'));
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => updateDoc(doc(db, 'pullRequests', d.id), { status: 'removed' })));
    } catch (error) {
      console.error("Error clearing queue:", error);
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
        logs: [...pr.logs, 'Starting Semantic Intent Analysis...', 'Semantic Intent Analysis complete. Checking for conflicts...']
      });

      const parsedFiles = JSON.parse(pr.files || '[]');
      const hasConflicts = parsedFiles.some((f: any) => f.content.includes('<<<<<<< HEAD'));

      if (hasConflicts) {
        await updateDoc(doc(db, 'pullRequests', pr.id), {
          status: 'conflict',
          logs: [...pr.logs, 'Starting Semantic Intent Analysis...', 'Semantic Intent Analysis complete. Checking for conflicts...', 'Conflict detected! Starting AI conflict resolution...']
        });

        // Call backend to resolve conflicts
        const resolveRes = await fetch('/api/ai/resolve-conflict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prTitle: pr.title, files: parsedFiles })
        });
        const resolveData = await resolveRes.json();

        await updateDoc(doc(db, 'pullRequests', pr.id), {
          status: 'merged',
          logs: [...pr.logs, 'Starting Semantic Intent Analysis...', 'Semantic Intent Analysis complete. Checking for conflicts...', 'Conflict detected! Starting AI conflict resolution...', ...resolveData.logs, 'AI successfully resolved conflicts and merged PR.'],
          files: JSON.stringify(resolveData.resolvedFiles || [])
        });
        return;
      }

      // 1. Call backend to run tests
      const testRes = await fetch('/api/ai/run-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prTitle: pr.title, files: parsedFiles })
      });
      const testData = await testRes.json();
      
      if (!testData.success) {
        await updateDoc(doc(db, 'pullRequests', pr.id), {
          status: 'failed',
          logs: [...pr.logs, 'Starting Semantic Intent Analysis...', 'Semantic Intent Analysis complete. Checking for conflicts...', 'No conflicts. Starting AI tests...', ...testData.logs, 'Tests failed.']
        });
        return;
      }

      // 3. Update status to merged
      await updateDoc(doc(db, 'pullRequests', pr.id), {
        status: 'merged',
        logs: [...pr.logs, 'Starting Semantic Intent Analysis...', 'Semantic Intent Analysis complete. Checking for conflicts...', 'No conflicts. Starting AI tests...', ...testData.logs, 'Tests passed. Merging PR...'],
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
      const primaryBranch = branches.find(b => b.type === 'primary')?.name || 'main';
      
      // 2. Create a "Sync PR" for each
      for (const branch of activeProjectBranches) {
        const prRef = await addDoc(collection(db, 'pullRequests'), {
          title: `Bi-Weekly Sync: ${branch.name} to ${primaryBranch}`,
          sourceBranch: branch.name,
          targetBranch: primaryBranch,
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
          logs: ['Initiated bi-weekly auto-sync.', 'AI resolved any conflicts.', 'Merged successfully.', `Rebased new project branch from ${primaryBranch}.`]
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-400" />
              Repository Branches
            </h2>
          </div>
          
          <div className="mb-6 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Select Repository</label>
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="New repo name..." 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleCreateProject}
                disabled={isCreatingProject || !newProjectName.trim()}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isCreatingProject ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {isLoadingBranches ? (
              <div className="text-center py-4 text-zinc-500 text-sm">Loading branches...</div>
            ) : (
              <>
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
              </>
            )}
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
              onClick={handleSimulateTeam}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              <Users className="w-5 h-5" />
              Simulate Team Activity
            </button>
            <button
              onClick={handleSimulateConflict}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
            >
              <AlertCircle className="w-5 h-5" />
              Simulate Conflict
            </button>
            <button
              onClick={handleBiWeeklySync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Trigger Bi-Weekly Sync'}
            </button>
            <button
              onClick={handleClearQueue}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-colors border border-red-600/30 mt-2"
            >
              Clear Queue
            </button>
            <p className="text-xs text-zinc-500 text-center mt-2">
              Auto-merges all project branches to primary and rebases.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: PR Queue */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            Git Tree View
          </h2>
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 overflow-x-auto">
            {isLoadingCommits ? (
              <div className="text-center py-4 text-zinc-500 text-sm">Loading commit history...</div>
            ) : (
              <GitgraphWrapper commits={commits} />
            )}
          </div>
        </div>

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

function GitgraphWrapper({ commits }: { commits: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous graph
    containerRef.current.innerHTML = '';

    const gitgraph = createGitgraph(containerRef.current, {
      template: templateExtend(TemplateName.Metro, {
        colors: ['#6366f1', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899'],
        commit: { message: { displayAuthor: false, displayHash: true } }
      })
    });

    if (commits && commits.length > 0) {
      try {
        gitgraph.import(commits);
      } catch (err) {
        console.error("Failed to import commits to gitgraph", err);
        const master = gitgraph.branch("main");
        master.commit("Error rendering git graph");
      }
    } else {
      const master = gitgraph.branch("main");
      master.commit("No commits found");
    }
  }, [commits]);

  return <div ref={containerRef} />;
}

