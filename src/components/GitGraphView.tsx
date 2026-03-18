import React, { useEffect, useState } from 'react';
import { Gitgraph, templateExtend, TemplateName } from '@gitgraph/react';

interface GitGraphViewProps {
  projectId: string | null;
}

export default function GitGraphView({ projectId }: GitGraphViewProps) {
  const [snapshots, setSnapshots] = useState<{title: string, commits: any[]}[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchSnapshots = async () => {
      try {
        const res = await fetch(`/api/gitlab/snapshots/${projectId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch snapshots: ${await res.text()}`);
        }
        const data = await res.json();
        setSnapshots(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchSnapshots();
    const interval = setInterval(fetchSnapshots, 1000); // Poll every 1 second

    return () => clearInterval(interval);
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-sm">
        Run 'git-ai benchmark' to visualize the repository graph.
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

  if (snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-sm">
        Loading repository snapshots...
      </div>
    );
  }

  const customTemplate = templateExtend(TemplateName.Metro, {
    colors: ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#60a5fa"],
    commit: {
      message: {
        displayAuthor: false,
        displayHash: false,
        font: "normal 12px 'JetBrains Mono', monospace",
        color: "#d4d4d8",
      },
      dot: {
        size: 8,
      },
    },
    branch: {
      lineWidth: 3,
      spacing: 30,
      label: {
        display: true,
        font: "normal 10px 'JetBrains Mono', monospace",
      },
    },
  });

  return (
    <div className="h-full overflow-y-auto p-4 bg-zinc-950/50 space-y-12">
      {snapshots.map((snapshot, index) => (
        <div key={index} className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
          <h3 className="text-zinc-100 font-mono text-lg mb-6 border-b border-zinc-800 pb-2">
            Snapshot {index + 1}: {snapshot.title}
          </h3>
          <div className="overflow-x-auto">
            <Gitgraph key={`${index}-${snapshot.commits.length}`} options={{ template: customTemplate }}>
              {(gitgraph) => {
                try {
                  // Gitgraph expects commits in chronological order (oldest first)
                  const reversedCommits = [...snapshot.commits].reverse();
                  gitgraph.import(reversedCommits);
                } catch (e) {
                  console.error("Failed to import gitgraph data", e);
                }
              }}
            </Gitgraph>
          </div>
        </div>
      ))}
    </div>
  );
}
