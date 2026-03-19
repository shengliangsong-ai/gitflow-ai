import React, { useState } from 'react';

interface Commit {
  hash: string;
  parents: string[];
  subject: string;
  body?: string;
  author: { name: string; email: string; timestamp: number };
  refs?: string[];
}

interface GitTreeProps {
  commits: Commit[];
  onCommitClick?: (commit: Commit) => void;
}

const COLORS = ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#60a5fa", "#a78bfa", "#38bdf8"];

export default function GitTree({ commits, onCommitClick }: GitTreeProps) {
  const [hoveredCommit, setHoveredCommit] = useState<string | null>(null);

  const primaryCommits = new Set<string>();
  let curr = commits.find(c => c.refs?.includes('primary') || c.refs?.includes('refs/heads/primary'));
  if (!curr && commits.length > 0) {
    curr = commits[0];
  }
  while (curr) {
    primaryCommits.add(curr.hash);
    if (curr.parents.length > 0) {
      curr = commits.find(c => c.hash === curr!.parents[0]);
    } else {
      curr = undefined;
    }
  }

  const activeLanes: (string | null)[] = [];
  
  const rows = commits.map(commit => {
    const lanesBefore = [...activeLanes];
    
    let lane = -1;
    if (primaryCommits.has(commit.hash)) {
      lane = 0;
    } else {
      lane = activeLanes.indexOf(commit.hash);
      if (lane === -1 || lane === 0) {
        lane = 1;
        while (activeLanes[lane] !== undefined && activeLanes[lane] !== null) {
          lane++;
        }
      }
    }

    for (let i = 0; i < activeLanes.length; i++) {
      if (activeLanes[i] === commit.hash) {
        activeLanes[i] = null;
      }
    }

    if (commit.parents.length > 0) {
      const p0 = commit.parents[0];
      if (lane === 0 && primaryCommits.has(p0)) {
        const existingIdx = activeLanes.indexOf(p0);
        if (existingIdx !== -1 && existingIdx !== 0) {
          activeLanes[existingIdx] = null;
        }
        activeLanes[0] = p0;
      } else {
        if (!activeLanes.includes(p0)) {
          activeLanes[lane] = p0;
        }
      }
      
      for (let i = 1; i < commit.parents.length; i++) {
        const p = commit.parents[i];
        if (!activeLanes.includes(p)) {
          let emptyLane = 1;
          while (activeLanes[emptyLane] !== undefined && activeLanes[emptyLane] !== null) {
            emptyLane++;
          }
          activeLanes[emptyLane] = p;
        }
      }
    }

    return { commit, lane, activeLanes: lanesBefore, nextLanes: [...activeLanes] };
  });

  const ROW_HEIGHT = 32;
  const LANE_WIDTH = 20;

  return (
    <div className="flex flex-col w-full h-full overflow-auto bg-zinc-950 text-zinc-300 font-mono text-xs">
      {rows.map((row) => {
        const { commit, lane, activeLanes, nextLanes } = row;
        const maxLanes = Math.max(activeLanes.length, nextLanes.length);
        const svgWidth = Math.max(maxLanes * LANE_WIDTH + 20, 40);

        return (
          <div 
            key={commit.hash}
            className={`flex items-center border-b border-zinc-900/50 cursor-pointer transition-colors ${hoveredCommit === commit.hash ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'}`}
            onMouseEnter={() => setHoveredCommit(commit.hash)}
            onMouseLeave={() => setHoveredCommit(null)}
            onClick={() => onCommitClick?.(commit)}
            style={{ height: ROW_HEIGHT }}
          >
            <div style={{ width: svgWidth, height: ROW_HEIGHT, flexShrink: 0, position: 'relative' }}>
              <svg width={svgWidth} height={ROW_HEIGHT} className="absolute inset-0">
                {/* Draw lines from top (children) */}
                {activeLanes.map((l, i) => {
                  if (!l) return null;
                  const color = COLORS[i % COLORS.length];
                  const startX = i * LANE_WIDTH + 15;
                  
                  if (l === commit.hash) {
                    const endX = lane * LANE_WIDTH + 15;
                    return (
                      <path 
                        key={`top-${i}`}
                        d={`M ${startX} 0 C ${startX} ${ROW_HEIGHT/4}, ${endX} ${ROW_HEIGHT/4}, ${endX} ${ROW_HEIGHT/2}`}
                        stroke={color} strokeWidth="2" fill="none"
                      />
                    );
                  } else {
                    return (
                      <line 
                        key={`top-pass-${i}`}
                        x1={startX} y1={0} x2={startX} y2={ROW_HEIGHT}
                        stroke={color} strokeWidth="2"
                      />
                    );
                  }
                })}

                {/* Draw lines to bottom (parents) */}
                {commit.parents.map((p, i) => {
                  const parentIndex = nextLanes.indexOf(p);
                  if (parentIndex === -1) return null;
                  
                  const color = i === 0 ? COLORS[lane % COLORS.length] : COLORS[parentIndex % COLORS.length];
                  const startX = lane * LANE_WIDTH + 15;
                  const endX = parentIndex * LANE_WIDTH + 15;
                  
                  return (
                    <path 
                      key={`bottom-${i}`}
                      d={`M ${startX} ${ROW_HEIGHT/2} C ${startX} ${ROW_HEIGHT*3/4}, ${endX} ${ROW_HEIGHT*3/4}, ${endX} ${ROW_HEIGHT}`}
                      stroke={color} strokeWidth="2" fill="none"
                    />
                  );
                })}

                {/* Draw commit dot */}
                <circle 
                  cx={lane * LANE_WIDTH + 15} 
                  cy={ROW_HEIGHT / 2} 
                  r="4" 
                  fill={COLORS[lane % COLORS.length]} 
                  stroke="#18181b" 
                  strokeWidth="2" 
                />
              </svg>
            </div>
            
            <div className="flex-1 flex items-center gap-3 px-2 truncate">
              <span className="text-zinc-500 w-16 flex-shrink-0">{commit.hash.substring(0, 7)}</span>
              <span className="text-zinc-100 truncate flex-1" title={commit.body || commit.subject}>{commit.subject}</span>
              {commit.refs && commit.refs.length > 0 && (
                <div className="flex gap-1 flex-shrink-0">
                  {commit.refs.map(ref => {
                    const isTag = ref.includes('tags/');
                    const name = ref.replace('refs/heads/', '').replace('refs/tags/', '');
                    return (
                      <span key={ref} className={`px-1.5 py-0.5 rounded text-[10px] border ${isTag ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
                        {name}
                      </span>
                    );
                  })}
                </div>
              )}
              <span className="text-zinc-500 w-24 flex-shrink-0 truncate text-right">{commit.author.name}</span>
              <span className="text-zinc-600 w-24 flex-shrink-0 text-right">
                {new Date(commit.author.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
