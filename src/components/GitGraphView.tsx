import React, { useEffect, useState } from 'react';
import GitTree from './GitTree';
import { X, FileCode } from 'lucide-react';

interface GitGraphViewProps {
  projectId: string | null;
}

export default function GitGraphView({ projectId }: GitGraphViewProps) {
  const [liveCommits, setLiveCommits] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [commitDetails, setCommitDetails] = useState<{ commit: any, diff: any[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setLiveCommits([]);
      setError(null);
      setSelectedCommit(null);
      return;
    }

    const fetchData = async () => {
      try {
        const graphRes = await fetch(`/api/gitlab/graph/${projectId}`);
        if (!graphRes.ok) throw new Error(`Failed to fetch live graph: ${await graphRes.text()}`);
        
        const graphData = await graphRes.json();
        setLiveCommits(graphData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    if (!selectedCommit || !projectId) {
      setCommitDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await fetch(`/api/gitlab/commits/${projectId}/${selectedCommit.hash}/diff`);
        if (!res.ok) throw new Error('Failed to fetch commit details');
        const data = await res.json();
        setCommitDetails(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedCommit, projectId]);

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-sm">
        Select a project to visualize the repository graph.
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 font-mono text-sm p-4 text-center">
        {error}
      </div>
    );
  }

  if (liveCommits.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-sm">
        Loading repository data...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-950">
      <div className={`transition-all duration-300 overflow-hidden ${selectedCommit ? 'h-1/2 border-b border-zinc-800' : 'h-full'}`}>
        <GitTree commits={liveCommits} onCommitClick={setSelectedCommit} />
      </div>

      {selectedCommit && (
        <div className="h-1/2 flex flex-col bg-zinc-900/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
            <div>
              <h3 className="text-zinc-100 font-mono text-sm font-semibold">Commit Details</h3>
              <p className="text-zinc-500 font-mono text-xs">{selectedCommit.hash.substring(0, 8)}</p>
            </div>
            <button 
              onClick={() => setSelectedCommit(null)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {loadingDetails ? (
              <div className="text-zinc-500 text-center mt-10">Loading commit details...</div>
            ) : commitDetails ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-zinc-100 font-bold text-base mb-2">{commitDetails.commit.title}</h4>
                  <p className="text-zinc-400 whitespace-pre-wrap">{commitDetails.commit.message}</p>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-zinc-500 border-y border-zinc-800/50 py-3">
                  <div>
                    <span className="text-zinc-400">Author:</span> {commitDetails.commit.author_name}
                  </div>
                  <div>
                    <span className="text-zinc-400">Date:</span> {new Date(commitDetails.commit.created_at).toLocaleString()}
                  </div>
                </div>

                <div>
                  <h5 className="text-zinc-300 font-semibold mb-3 flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Changed Files ({commitDetails.diff.length})
                  </h5>
                  <div className="space-y-4">
                    {commitDetails.diff.map((file: any, index: number) => (
                      <div key={index} className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/50">
                        <div className="bg-zinc-900 px-3 py-2 text-xs text-zinc-300 border-b border-zinc-800 flex justify-between">
                          <span>{file.new_path}</span>
                          {file.new_file ? <span className="text-emerald-400">Added</span> : 
                           file.deleted_file ? <span className="text-red-400">Deleted</span> : 
                           <span className="text-indigo-400">Modified</span>}
                        </div>
                        <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed">
                          {file.diff.split('\n').map((line: string, i: number) => {
                            let colorClass = "text-zinc-400";
                            if (line.startsWith('+')) colorClass = "text-emerald-400 bg-emerald-500/10";
                            else if (line.startsWith('-')) colorClass = "text-red-400 bg-red-500/10";
                            else if (line.startsWith('@@')) colorClass = "text-indigo-400";
                            
                            return (
                              <div key={i} className={`px-2 ${colorClass}`}>
                                {line || ' '}
                              </div>
                            );
                          })}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 text-center mt-10">Failed to load details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
