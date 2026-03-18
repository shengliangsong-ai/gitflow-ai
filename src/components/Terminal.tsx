import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Terminal as TerminalIcon, GitBranch } from 'lucide-react';
import { trackCliCommand } from '../analytics';
import GitGraphView from './GitGraphView';

interface HistoryItem {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
}

export default function Terminal() {
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

  const addHistory = (type: 'input' | 'output' | 'error', content: string) => {
    setHistory(prev => [...prev, { id: Date.now().toString() + Math.random(), type, content }]);
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
  status                   - Check merge queue status
  pause                    - Pause the global merge workflow
  resume                   - Un-pause the global merge workflow
  remove <pr_id>           - Remove a PR from the merge queue
  group <pr_id1> <pr_id2>  - Group a batch of PRs as an atomic unit
  priority <pr_id> <level> - Set PR priority (high, normal, low)
  reorder <pr_id> <pos>    - Reorder a PR in the queue (set queuePosition)
  benchmark                - Run automated self-tests for conflict resolution
  clear                    - Clear terminal history`);
          break;

        case 'clear':
          setHistory([]);
          break;

        case 'status':
          const q = query(collection(db, 'pullRequests'), where('status', 'in', ['merge_queue', 'merging', 'testing', 'conflict']));
          const snapshot = await getDocs(q);
          const waiting = snapshot.docs.filter(d => d.data().status === 'merge_queue').length;
          const processing = snapshot.docs.length - waiting;
          
          addHistory('output', `System Status: ${isPaused ? 'PAUSED' : 'ACTIVE'}
Total PRs in queue: ${snapshot.docs.length}
Waiting: ${waiting}
Processing: ${processing}`);
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
          await updateDoc(doc(db, 'pullRequests', args[1]), { status: 'removed' });
          addHistory('output', `PR ${args[1]} removed from merge queue.`);
          break;

        case 'group':
          if (args.length < 3) throw new Error('Usage: group <pr_id1> <pr_id2> [pr_id3...]');
          const prIds = args.slice(1);
          const groupId = 'grp_' + Math.random().toString(36).substring(2, 9);
          
          await Promise.all(prIds.map(id => 
            updateDoc(doc(db, 'pullRequests', id), { groupId })
          ));
          addHistory('output', `Grouped PRs [${prIds.join(', ')}] as atomic unit: ${groupId}`);
          break;

        case 'priority':
          if (args.length !== 3) throw new Error('Usage: priority <pr_id> <high|normal|low>');
          const level = args[2].toLowerCase();
          if (!['high', 'normal', 'low'].includes(level)) throw new Error('Invalid priority level.');
          
          await updateDoc(doc(db, 'pullRequests', args[1]), { priority: level });
          addHistory('output', `PR ${args[1]} priority set to ${level}.`);
          break;

        case 'reorder':
          if (args.length !== 3) throw new Error('Usage: reorder <pr_id> <position>');
          const pos = parseInt(args[2], 10);
          if (isNaN(pos)) throw new Error('Position must be a number.');
          
          await updateDoc(doc(db, 'pullRequests', args[1]), { queuePosition: pos });
          addHistory('output', `PR ${args[1]} moved to queue position ${pos}.`);
          break;

        case 'benchmark':
        case 'benchmarks':
          addHistory('output', 'Connecting to GitLab API for real benchmark...');
          
          const eventSource = new EventSource('/api/gitlab/benchmark');
          
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
            addHistory('error', 'Connection to benchmark server failed or ended.');
            eventSource.close();
          };
          break;

        default:
          addHistory('error', `Command not found: ${command}. Type "help" for available commands.`);
      }
    } catch (err: any) {
      addHistory('error', err.message || 'An error occurred executing the command.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px] lg:h-[600px]">
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col h-[600px] lg:h-auto font-mono shadow-2xl">
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-2">
          <TerminalIcon className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-semibold text-zinc-300">AI GitFlow CLI</span>
          {isPaused && (
            <span className="ml-auto text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
              SYSTEM PAUSED
            </span>
          )}
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

      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col h-[600px] lg:h-auto font-mono shadow-2xl">
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
