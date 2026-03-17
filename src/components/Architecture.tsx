import React from 'react';
import { FileText, GitMerge, Database, Layout, Terminal } from 'lucide-react';

export default function Architecture() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-4">
          <FileText className="w-8 h-8 text-indigo-400" />
          Design Document & Architecture
        </h1>
        <p className="text-zinc-400 text-lg">
          Technical specifications, system architecture, and data flow for AI GitFlow.
        </p>
      </div>

      {/* Design Document */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4">1. System Overview</h2>
        <div className="text-zinc-300 space-y-4 leading-relaxed">
          <p>
            <strong>AI GitFlow</strong> is a hybrid local-cloud developer tool designed to eliminate merge conflicts, automate code reviews, and streamline the deployment pipeline. It consists of a local CLI tool (<code className="text-indigo-300">git-ai</code>) and a cloud-based React dashboard.
          </p>
          <h3 className="text-xl font-semibold text-white mt-6">Core Components</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Local CLI (Node.js/Bash):</strong> Intercepts standard git commands to inject AI analysis before commits, pushes, and rebases.</li>
            <li><strong>Web Dashboard (React/Vite):</strong> Provides a real-time view of the global merge queue, PR statuses, and system controls.</li>
            <li><strong>Backend/Database (Firebase Firestore):</strong> Acts as the source of truth for the merge queue, PR metadata, and global system state (e.g., pause/resume).</li>
            <li><strong>Analytics (GitLab Browser SDK):</strong> Tracks CLI usage, page views, and user interactions to provide insights into developer workflows.</li>
          </ul>
        </div>
      </div>

      {/* SVG Architecture Diagram */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 mb-8">2. Architecture Diagram (SVG)</h2>
        <div className="flex justify-center bg-zinc-950 p-8 rounded-xl border border-zinc-800 overflow-x-auto">
          <svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" className="max-w-full h-auto font-sans">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
              </marker>
            </defs>

            {/* Backgrounds */}
            <rect x="50" y="50" width="250" height="400" rx="15" fill="url(#grad1)" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5,5" />
            <text x="175" y="80" fill="#a5b4fc" fontSize="16" fontWeight="bold" textAnchor="middle">Local Environment</text>

            <rect x="450" y="50" width="300" height="400" rx="15" fill="url(#grad2)" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
            <text x="600" y="80" fill="#6ee7b7" fontSize="16" fontWeight="bold" textAnchor="middle">Cloud Infrastructure</text>

            {/* Local Nodes */}
            <rect x="100" y="120" width="150" height="60" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
            <text x="175" y="155" fill="#e4e4e7" fontSize="14" fontWeight="bold" textAnchor="middle">Developer (CLI)</text>

            <rect x="100" y="240" width="150" height="60" rx="8" fill="#18181b" stroke="#6366f1" strokeWidth="2" />
            <text x="175" y="275" fill="#e4e4e7" fontSize="14" fontWeight="bold" textAnchor="middle">git-ai wrapper</text>

            <rect x="100" y="360" width="150" height="60" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
            <text x="175" y="395" fill="#e4e4e7" fontSize="14" fontWeight="bold" textAnchor="middle">Local Git Repo</text>

            {/* Cloud Nodes */}
            <rect x="525" y="120" width="150" height="60" rx="8" fill="#18181b" stroke="#10b981" strokeWidth="2" />
            <text x="600" y="155" fill="#e4e4e7" fontSize="14" fontWeight="bold" textAnchor="middle">AI Merge Queue</text>

            <rect x="525" y="240" width="150" height="60" rx="8" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
            <text x="600" y="275" fill="#e4e4e7" fontSize="14" fontWeight="bold" textAnchor="middle">Firebase Firestore</text>

            <rect x="525" y="360" width="150" height="60" rx="8" fill="#18181b" stroke="#ec4899" strokeWidth="2" />
            <text x="600" y="395" fill="#e4e4e7" fontSize="14" fontWeight="bold" textAnchor="middle">React Dashboard</text>

            {/* GitLab Node */}
            <rect x="325" y="420" width="150" height="50" rx="8" fill="#18181b" stroke="#e24329" strokeWidth="2" />
            <text x="400" y="450" fill="#e4e4e7" fontSize="12" fontWeight="bold" textAnchor="middle">GitLab Analytics SDK</text>

            {/* Edges */}
            <path d="M 175 180 L 175 230" stroke="#71717a" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M 175 300 L 175 350" stroke="#71717a" strokeWidth="2" markerEnd="url(#arrow)" />
            
            <path d="M 250 270 L 515 150" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrow)" fill="none" />
            <text x="380" y="200" fill="#a5b4fc" fontSize="12" transform="rotate(-18, 380, 200)">git-ai push</text>

            <path d="M 600 180 L 600 230" stroke="#71717a" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M 600 300 L 600 350" stroke="#71717a" strokeWidth="2" markerEnd="url(#arrow)" />

            <path d="M 525 390 L 485 435" stroke="#71717a" strokeWidth="2" markerEnd="url(#arrow)" fill="none" />
            <path d="M 250 280 L 315 435" stroke="#71717a" strokeWidth="2" markerEnd="url(#arrow)" fill="none" />
          </svg>
        </div>
      </div>

      {/* Mermaid Diagram */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 mb-6">3. Architecture Diagram (Mermaid)</h2>
        <p className="text-zinc-400 mb-4 text-sm">
          Copy and paste this code into <a href="https://mermaid.live" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Mermaid Live Editor</a> or GitHub to render the diagram natively.
        </p>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 overflow-x-auto">
          <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
{`graph TD
    subgraph Local Environment
        A[Developer] -->|Runs commands| B(git-ai CLI Wrapper)
        B -->|git-ai commit| C{AI Code Review}
        C -->|Pass| D[Local Git Repo]
        C -->|Fail| A
    end

    subgraph Cloud Infrastructure
        B -->|git-ai push| E[AI Merge Queue]
        E -->|Writes state| F[(Firebase Firestore)]
        F -->|Real-time sync| G[React Web Dashboard]
        G -->|Manual overrides| F
    end

    subgraph Analytics
        B -.->|Tracks CLI usage| H[GitLab Browser SDK]
        G -.->|Tracks Page Views| H
    end

    classDef local fill:#18181b,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef cloud fill:#18181b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef db fill:#18181b,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef analytics fill:#18181b,stroke:#e24329,stroke-width:2px,color:#fff;

    class B,C,D local;
    class E,G cloud;
    class F db;
    class H analytics;`}
          </pre>
        </div>
      </div>
    </div>
  );
}
