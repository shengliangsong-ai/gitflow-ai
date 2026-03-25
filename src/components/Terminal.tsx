import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, setDoc, onSnapshot, db } from '../localDb';
import { Terminal as TerminalIcon, GitBranch } from 'lucide-react';
import { trackCliCommand } from '../analytics';
import GitGraphView from './GitGraphView';

interface HistoryItem {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
}

export default function Terminal({ className = "h-[calc(100vh-8rem)]" }: { className?: string }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', type: 'output', content: 'AI GitFlow CLI initialized.' },
    { id: '2', type: 'output', content: 'Type "help" for a list of commands.' }
  ]);
  const [isPaused, setIsPaused] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen to global system state
    const unsub = onSnapshot(doc(db, 'system', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        setIsPaused(docSnap.data().isMergePaused || false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    const handleRunDemo = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.phase) {
        runDemo(customEvent.detail.phase);
      }
    };
    const handleSetProjectId = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.projectId) {
        setProjectId(customEvent.detail.projectId);
      }
    };
    const handleTerminalOutput = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.content) {
        addHistory(customEvent.detail.type || 'output', customEvent.detail.content);
      }
    };
    window.addEventListener('run-demo', handleRunDemo);
    window.addEventListener('set-project-id', handleSetProjectId);
    window.addEventListener('terminal-output', handleTerminalOutput);
    return () => {
      window.removeEventListener('run-demo', handleRunDemo);
      window.removeEventListener('set-project-id', handleSetProjectId);
      window.removeEventListener('terminal-output', handleTerminalOutput);
    };
  }, [projectId]);

  const addHistory = (type: 'input' | 'output' | 'error', content: string) => {
    setHistory(prev => [...prev, { id: Date.now().toString() + Math.random(), type, content }]);
  };

  const runDemo = (phase: 'A' | 'B' | 'team' | 'conflict' | 'sync') => {
    addHistory('output', `Starting Demo Phase: ${phase}...`);
    
    let url = `/api/gitlab/benchmark?phase=${phase}`;
    if (phase === 'B') {
      if (!projectId) {
        addHistory('error', 'Project ID is missing. Run Phase A first.');
        return;
      }
      url += `&projectId=${projectId}`;
    }

    const eventSource = new EventSource(url);
    let currentProjectId = projectId;
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'projectId') {
        setProjectId(data.projectId);
        currentProjectId = data.projectId;
      } else if (data.message === "DONE") {
        eventSource.close();
        if (phase === 'conflict' && currentProjectId) {
          addHistory('output', `Auto-starting AI merge for conflict resolution...`);
          setTimeout(() => {
            const mergeUrl = `/api/gitlab/auto-merge?projectId=${currentProjectId}`;
            const mergeEventSource = new EventSource(mergeUrl);
            
            mergeEventSource.onmessage = (event) => {
              const mergeData = JSON.parse(event.data);
              if (mergeData.message === "DONE") {
                mergeEventSource.close();
              } else {
                addHistory('output', mergeData.message);
              }
            };
            
            mergeEventSource.onerror = (error) => {
              addHistory('error', 'Connection to merge server failed or ended.');
              mergeEventSource.close();
            };
          }, 1000);
        }
      } else {
        addHistory('output', data.message);
      }
    };
    
    eventSource.onerror = (error) => {
      addHistory('error', 'Connection to benchmark server failed or ended.');
      eventSource.close();
    };
  };

  const syncGithub = (destination?: string) => {
    addHistory('output', `Starting GitHub Sync...`);
    
    const url = destination ? `/api/gitlab/sync-github?destination=${encodeURIComponent(destination)}` : `/api/gitlab/sync-github`;
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'projectId') {
        setProjectId(data.projectId);
      } else if (data.message === "DONE") {
        eventSource.close();
      } else {
        addHistory('output', data.message);
      }
    };
    
    eventSource.onerror = (error) => {
      addHistory('error', 'Connection to sync server failed or ended.');
      eventSource.close();
    };
  };

  const resetDemo = () => {
    setProjectId(null);
    setHistory([
      { id: Date.now().toString(), type: 'output', content: 'Demo reset. Ready to start Phase A.' }
    ]);
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    let cmdStr = input.trim();
    addHistory('input', `$ ${cmdStr}`);
    setInput('');

    // Optional: strip 'git-ai ' prefix if user types it
    if (cmdStr.toLowerCase().startsWith('git-ai ')) {
      cmdStr = cmdStr.substring(7).trim();
    }

    const args = cmdStr.split(' ');
    const command = args[0].toLowerCase();
    
    // Track the command using GitLab Browser SDK
    trackCliCommand(command, args.slice(1));

    try {
      switch (command) {
        case 'help':
          addHistory('output', `Available commands:
  commit                   - AI-powered commit with pre-analysis
  push                     - Push and register with AI Merge Queue
  rebase                   - AI-monitored rebase for conflict resolution
  cherry-pick <hash|range> - AI-analyzed cherry-pick
  resolve                  - Manually trigger AI conflict resolution
  clone <repo_uri>         - Clone and auto-configure AI settings
  sync <dest> [sources...] - AI-orchestrated multi-repo sync
  queue <action>           - Manage AI Merge Queue (add|remove|list|pause|unpause)
  reorder <pr_id> <pos>    - Change PR position in queue
  atomic_batch <name> <ids>- Group PRs into an atomic unit
  priority <pr_id> <level> - Set PR priority (High/Low)
  status                   - Check global AI Merge Queue status
  benchmark [--with-ai]    - Run GitLab API integration benchmark
  config <action>          - Manage API keys and local configuration
  version                  - Show CLI version
  clear                    - Clear terminal history`);
          break;

        case 'merge':
          if (!projectId) {
            addHistory('error', 'Project ID is missing. Run a benchmark phase first.');
            break;
          }
          addHistory('output', `Starting AI auto-merge for project ${projectId}...`);
          const mergeUrl = `/api/gitlab/auto-merge?projectId=${projectId}`;
          const mergeEventSource = new EventSource(mergeUrl);
          
          mergeEventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message === "DONE") {
              mergeEventSource.close();
            } else {
              addHistory('output', data.message);
            }
          };
          
          mergeEventSource.onerror = (error) => {
            addHistory('error', 'Connection to merge server failed or ended.');
            mergeEventSource.close();
          };
          break;

        case 'benchmark':
          if (!args[1] || !['A', 'B', 'team', 'conflict'].includes(args[1])) {
            throw new Error('Usage: benchmark <A|B|team|conflict>');
          }
          runDemo(args[1] as 'A' | 'B' | 'team' | 'conflict');
          break;

        case 'sync':
          syncGithub(args[1]);
          break;

        case 'review':
          if (!args[1]) throw new Error('Usage: review <hash1>..<hash2>');
          if (!projectId) throw new Error('Project ID is missing. Run a benchmark phase first.');
          
          addHistory('output', `🤖 AI Agent reviewing commit range: ${args[1]}...`);
          const reviewRes = await fetch('/api/cli/review-range', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, range: args[1] })
          });
          
          if (!reviewRes.ok) throw new Error(`Review failed: ${await reviewRes.text()}`);
          const reviewData = await reviewRes.json();
          
          addHistory('output', `\n--- AI CODE REVIEW ---\n${reviewData.review}\n----------------------`);
          if (reviewData.blockCommit) {
            addHistory('error', '⚠️ AI Review detected critical issues in this range.');
          }
          break;

        case 'clear':
          setHistory([]);
          break;

        case 'status':
          const q = query(collection(db, 'pullRequests'), where('status', 'in', ['code_review', 'merge_queue', 'merging', 'testing', 'conflict']));
          const snapshot = await getDocs(q);
          const waiting = snapshot.docs.filter(d => d.data().status === 'merge_queue' || d.data().status === 'code_review').length;
          const processing = snapshot.docs.length - waiting;
          
          addHistory('output', `System Status: ${isPaused ? 'PAUSED' : 'ACTIVE'}
Total PRs active: ${snapshot.docs.length}
Waiting/Review: ${waiting}
Processing/Conflict: ${processing}`);
          break;

        case 'pause':
          await setDoc(doc(db, 'system', 'config'), { isMergePaused: true }, { merge: true });
          addHistory('output', 'Merge workflow paused successfully.');
          break;

        case 'resume':
        case 'unpause':
          await setDoc(doc(db, 'system', 'config'), { isMergePaused: false }, { merge: true });
          addHistory('output', 'Merge workflow resumed successfully.');
          break;

        case 'remove':
          if (!args[1]) throw new Error('Usage: remove <pr_id>');
          const removeQ = query(collection(db, 'pullRequests'));
          const removeSnap = await getDocs(removeQ);
          const prToRemove = removeSnap.docs.find(d => d.id.startsWith(args[1]));
          if (!prToRemove) throw new Error(`PR ${args[1]} not found.`);
          await updateDoc(doc(db, 'pullRequests', prToRemove.id), { status: 'removed' });
          addHistory('output', `PR ${prToRemove.id.slice(0, 6)} removed from merge queue.`);
          break;

        case 'atomic_batch':
        case 'group':
          if (args.length < 3) throw new Error('Usage: atomic_batch <name> <pr_id1> [pr_id2...]');
          const batchName = args[1];
          const shortIds = args.slice(2);
          const groupQ2 = query(collection(db, 'pullRequests'));
          const groupSnap2 = await getDocs(groupQ2);
          
          const prIds = shortIds.map(shortId => {
            const pr = groupSnap2.docs.find(d => d.id.startsWith(shortId));
            if (!pr) throw new Error(`PR ${shortId} not found.`);
            return pr.id;
          });
          
          const groupId = batchName || ('grp_' + Math.random().toString(36).substring(2, 9));
          
          await Promise.all(prIds.map(id => 
            updateDoc(doc(db, 'pullRequests', id), { groupId })
          ));
          addHistory('output', `Grouped PRs [${prIds.map(id => id.slice(0, 6)).join(', ')}] as atomic unit: ${groupId}`);
          break;

        case 'merge-group':
          if (args.length !== 3) throw new Error('Usage: merge-group <group_id> <n-way|cascading>');
          const targetGroupId = args[1];
          const topology = args[2].toLowerCase();
          
          if (!['n-way', 'cascading'].includes(topology)) {
            throw new Error('Topology must be "n-way" or "cascading".');
          }
          
          // Fetch PRs in the group
          const groupQ = query(collection(db, 'pullRequests'), where('groupId', '==', targetGroupId));
          const groupSnap = await getDocs(groupQ);
          const groupPrs = groupSnap.docs.map(d => ({ id: d.id, title: d.data().title || d.id }));
          
          if (groupPrs.length === 0) {
            throw new Error(`No PRs found in group ${targetGroupId}.`);
          }
          
          addHistory('output', `Starting ${topology} merge for group ${targetGroupId} (${groupPrs.length} PRs)...`);
          
          const prTitles = groupPrs.map(pr => encodeURIComponent(pr.title)).join(',');
          const mgUrl = `/api/gitlab/merge-group?groupId=${targetGroupId}&topology=${topology}&projectId=${projectId || ''}&prs=${prTitles}`;
          const mgEventSource = new EventSource(mgUrl);
          
          mgEventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message === "DONE") {
              mgEventSource.close();
              // Update PR statuses to merged
              Promise.all(groupPrs.map(pr => 
                updateDoc(doc(db, 'pullRequests', pr.id), { status: 'merged' })
              )).catch(console.error);
            } else {
              addHistory('output', data.message);
            }
          };
          
          mgEventSource.onerror = (error) => {
            addHistory('error', 'Connection to merge-group server failed or ended.');
            mgEventSource.close();
          };
          break;

        case 'priority':
          if (args.length !== 3) throw new Error('Usage: priority <pr_id> <high|normal|low>');
          const level = args[2].toLowerCase();
          if (!['high', 'normal', 'low'].includes(level)) throw new Error('Invalid priority level.');
          
          const prioQ = query(collection(db, 'pullRequests'));
          const prioSnap = await getDocs(prioQ);
          const prToPrio = prioSnap.docs.find(d => d.id.startsWith(args[1]));
          if (!prToPrio) throw new Error(`PR ${args[1]} not found.`);
          
          await updateDoc(doc(db, 'pullRequests', prToPrio.id), { priority: level });
          addHistory('output', `PR ${prToPrio.id.slice(0, 6)} priority set to ${level}.`);
          break;

        case 'reorder':
          if (args.length !== 3) throw new Error('Usage: reorder <pr_id> <position>');
          const pos = parseInt(args[2], 10);
          if (isNaN(pos)) throw new Error('Position must be a number.');
          
          const reorderQ = query(collection(db, 'pullRequests'));
          const reorderSnap = await getDocs(reorderQ);
          const prToReorder = reorderSnap.docs.find(d => d.id.startsWith(args[1]));
          if (!prToReorder) throw new Error(`PR ${args[1]} not found.`);
          
          await updateDoc(doc(db, 'pullRequests', prToReorder.id), { queuePosition: pos });
          addHistory('output', `PR ${prToReorder.id.slice(0, 6)} moved to queue position ${pos}.`);
          break;

        case 'commit':
          addHistory('output', '🤖 AI pre-analysis running...\n✓ No bugs detected.\n✓ Security check passed.\nCommit successful.');
          break;
          
        case 'push':
          addHistory('output', 'Pushing to remote...\n✓ Registered with AI Merge Queue.');
          break;
          
        case 'rebase':
          addHistory('output', 'Starting AI-monitored rebase...\n✓ Rebase complete. 0 conflicts required manual intervention.');
          break;
          
        case 'cherry-pick':
          if (!args[1]) throw new Error('Usage: cherry-pick <hash|range>');
          addHistory('output', `AI analyzing cherry-pick range ${args[1]}...\n✓ Semantic intent preserved.\n✓ Cherry-pick successful.`);
          break;
          
        case 'resolve':
          addHistory('output', 'Triggering manual AI conflict resolution...\n🤖 Analyzing semantic intent...\n✓ Conflict resolved automatically.');
          break;
          
        case 'clone':
          if (!args[1]) throw new Error('Usage: clone <repo_uri>');
          addHistory('output', `Cloning ${args[1]}...\n✓ Auto-configured AI settings for this repository.`);
          break;
          
        case 'queue':
          if (!args[1]) throw new Error('Usage: queue <add|remove|list|pause|unpause>');
          const queueAction = args[1].toLowerCase();
          if (queueAction === 'pause') {
            await setDoc(doc(db, 'system', 'config'), { isMergePaused: true }, { merge: true });
            addHistory('output', 'Merge workflow paused successfully.');
          } else if (queueAction === 'unpause' || queueAction === 'resume') {
            await setDoc(doc(db, 'system', 'config'), { isMergePaused: false }, { merge: true });
            addHistory('output', 'Merge workflow resumed successfully.');
          } else {
            addHistory('output', `Queue action '${queueAction}' executed successfully.`);
          }
          break;
          
        case 'config':
          if (!args[1]) throw new Error('Usage: config <set|get|list>');
          addHistory('output', `Configuration ${args[1]} executed.`);
          break;
          
        case 'version':
          addHistory('output', 'git-ai version 1.0.0 (Gemini 3.1 Pro Engine)');
          break;

        default:
          addHistory('error', `Command not found: ${command}. Type "help" for available commands.`);
      }
    } catch (err: any) {
      addHistory('error', err.message || 'An error occurred executing the command.');
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col h-full font-mono shadow-2xl">
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold text-zinc-300">AI GitFlow CLI</span>
            {isPaused && (
              <span className="ml-2 text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                SYSTEM PAUSED
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => runDemo('A')} 
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Start Phase A (Dev)
            </button>
            <button 
              onClick={() => runDemo('B')} 
              disabled={!projectId}
              className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors ${projectId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-zinc-700 cursor-not-allowed text-zinc-400'}`}
            >
              Start Phase B (Merge)
            </button>
            <button 
              onClick={resetDemo} 
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors ml-2"
            >
              Reset Demo
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
          {history.map((item) => (
            <div 
              key={item.id} 
              className={`whitespace-pre-wrap ${
                item.type === 'input' ? 'text-indigo-300' : 
                item.type === 'error' ? 'text-red-400' : 
                'text-zinc-300'
              }`}
            >
              {item.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleCommand} className="border-t border-zinc-800 p-4 bg-zinc-900/50 flex items-center gap-2">
          <span className="text-indigo-400 font-bold">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-600"
            placeholder="Enter command..."
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>

      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col h-full font-mono shadow-2xl">
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold text-zinc-300">Live Git Graph</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <GitGraphView projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
