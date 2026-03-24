import React, { useEffect, useRef, useState } from 'react';
import { FileText, GitMerge, Database, Layout, Terminal, Download, Zap, Network, GitBranch, Maximize2, X } from 'lucide-react';
import Mermaid from './Mermaid';
import { useReactToPrint } from 'react-to-print';

const MERMAID_CHART = `graph TD
    subgraph Local Environment
        Dev[Developer]
        CLI[GitFlow AI CLI]
        LocalRepo[(Local Git Repository)]
        LocalCache[(Local SQLite Cache)]
    end

    subgraph Remote Infrastructure
        MainRepo[(Main Repository)]
        StateBranch([Branch: gitflow-ai-state])
        AuditRepo[(gitflow-audit Repository)]
        Gemini[Google Gemini 3.1 Pro]
        Dashboard[Web Dashboard]
    end

    Dev -->|Runs git-ai commands| CLI
    CLI <-->|Reads/Commits Code| LocalRepo
    CLI -->|Fetches queue.json| StateBranch
    CLI -->|Commits updated queue.json| StateBranch
    LocalRepo -->|Pushes Code/PRs| MainRepo
    CLI -->|Syncs Context & Logs| AuditRepo
    CLI <-->|Reads/Writes Fast Cache| LocalCache
    LocalCache -.->|Mirrors| AuditRepo
    CLI <-->|Sends Diffs / Gets Resolutions| Gemini
    Dashboard <-->|Visualizes Queue| StateBranch
    Dashboard <-->|Reads Audit Logs| AuditRepo
    Dashboard <-->|Analyzes Intent| Gemini

    classDef repo fill:#18181b,stroke:#e24329,stroke-width:2px,color:#fff;
    classDef ai fill:#18181b,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef cli fill:#18181b,stroke:#10b981,stroke-width:2px,color:#fff;
    
    class MainRepo,AuditRepo,LocalRepo,StateBranch repo;
    class Gemini ai;
    class CLI,LocalCache cli;`;

export const SvgDiagram = () => (
  <svg viewBox="0 0 800 400" className="w-full h-auto max-w-3xl mx-auto" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#34d399', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#f87171', stopOpacity: 1 }} />
      </linearGradient>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#a1a1aa" />
      </marker>
    </defs>
    
    {/* Background */}
    <rect width="100%" height="100%" fill="#18181b" rx="12" />
    
    {/* Nodes */}
    {/* Git Provider */}
    <rect x="50" y="160" width="150" height="80" rx="8" fill="url(#grad4)" />
    <text x="125" y="195" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">Git Provider</text>
    <text x="125" y="215" fill="white" fontSize="10" textAnchor="middle" dominantBaseline="middle">GitHub (Source) / GitLab (Final)</text>

    {/* Orchestrator */}
    <rect x="325" y="60" width="150" height="80" rx="8" fill="url(#grad1)" />
    <text x="400" y="95" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">GitFlow CLI</text>
    <text x="400" y="115" fill="white" fontSize="12" textAnchor="middle" dominantBaseline="middle">(State Branch Sync)</text>

    {/* Gemini Engine */}
    <rect x="325" y="260" width="150" height="80" rx="8" fill="url(#grad1)" />
    <text x="400" y="295" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">Gemini 3.1 Pro</text>
    <text x="400" y="315" fill="white" fontSize="12" textAnchor="middle" dominantBaseline="middle">Semantic Engine</text>

    {/* Database */}
    <rect x="600" y="60" width="150" height="80" rx="8" fill="url(#grad3)" />
    <text x="675" y="95" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">gitflow-audit Repo</text>
    <text x="675" y="115" fill="white" fontSize="12" textAnchor="middle" dominantBaseline="middle">(Audit & Context)</text>

    {/* UI */}
    <rect x="600" y="260" width="150" height="80" rx="8" fill="url(#grad2)" />
    <text x="675" y="295" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">Dashboard UI</text>
    <text x="675" y="315" fill="white" fontSize="12" textAnchor="middle" dominantBaseline="middle">(React/Vite)</text>

    {/* Edges */}
    <path d="M 200 200 L 325 100" stroke="#a1a1aa" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
    <text x="240" y="140" fill="#a1a1aa" fontSize="12" transform="rotate(-35, 240, 140)">Git Hooks</text>

    <path d="M 380 140 L 380 260" stroke="#a1a1aa" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
    <text x="370" y="200" fill="#a1a1aa" fontSize="12" transform="rotate(-90, 370, 200)">Analyzes Intent</text>
    
    <path d="M 420 260 L 420 140" stroke="#a1a1aa" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />

    <path d="M 475 100 L 600 100" stroke="#a1a1aa" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
    <text x="537" y="90" fill="#a1a1aa" fontSize="12" textAnchor="middle">Audit Sync</text>

    <path d="M 675 140 L 675 260" stroke="#a1a1aa" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
    <text x="685" y="200" fill="#a1a1aa" fontSize="12">Reads Audit</text>

    <path d="M 600 300 L 475 300" stroke="#a1a1aa" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
    <text x="537" y="290" fill="#a1a1aa" fontSize="12" textAnchor="middle">Manual Overrides</text>
  </svg>
);

export default function Architecture() {
  const [isMermaidFullScreen, setIsMermaidFullScreen] = useState(false);
  const [isSvgFullScreen, setIsSvgFullScreen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = useReactToPrint({
    contentRef,
    documentTitle: 'GitFlow_AI_Architecture',
  });

  return (
    <div ref={contentRef} className="max-w-5xl mx-auto space-y-12 pb-12 print:max-w-none print:p-0 print:m-0 print:bg-white print:text-black">
      {/* Full Screen SVG Modal */}
      {isSvgFullScreen && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-md flex flex-col p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">SVG Architecture Flow</h2>
            <button 
              onClick={() => setIsSvgFullScreen(false)}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-auto">
            <div className="w-full max-w-6xl">
              <SvgDiagram />
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Mermaid Modal */}
      {isMermaidFullScreen && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-md flex flex-col p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Mermaid Component Diagram</h2>
            <button 
              onClick={() => setIsMermaidFullScreen(false)}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
            <div className="w-full max-w-6xl">
              <Mermaid chart={MERMAID_CHART} />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-indigo-400" />
            GitFlow AI: Semantic Orchestration Layer
          </h1>
          <p className="text-zinc-400 text-lg">
            Doc ID: GF-AI-2026-001 • Status: Final
          </p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-black mb-2">GitFlow AI: Semantic Orchestration Layer Specification</h1>
        <p className="text-gray-600">Doc ID: GF-AI-2026-001 • Status: Final</p>
      </div>

      {/* 1. Executive Summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl space-y-6 print:bg-white print:border-gray-200 print:shadow-none print:p-0 print:mb-8">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 print:text-black print:border-gray-300">1. Executive Summary</h2>
        <div className="text-zinc-300 space-y-4 leading-relaxed print:text-gray-800">
          <p>
            <strong>GitFlow AI</strong> is a next-generation orchestration layer designed to eliminate "Merge Hell" in large-scale engineering organizations. By leveraging the <strong>Gemini 3.1 Pro</strong> multimodal model, the system semantically understands code changes, automates complex sync topologies, and provides real-time conflict resolution strategies that go beyond simple line-diffing. Our core design principle is to keep the primary branch clean as a straight line by enforcing a strict linear history on the primary branch while seamlessly merging feature branches.
          </p>
        </div>
      </div>

      {/* 2. System Architecture */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl space-y-6 print:bg-white print:border-gray-200 print:shadow-none print:p-0 print:mb-8">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 print:text-black print:border-gray-300">2. System Architecture</h2>
        <div className="text-zinc-300 space-y-4 leading-relaxed print:text-gray-800">
          <p>
            The architecture is built on a reactive, event-driven model. It bridges the gap between traditional Git providers and advanced AI reasoning.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Git Providers:</strong> GitHub / GitLab integration via Webhooks and CLI.</li>
            <li><strong>GitFlow CLI:</strong> Local engine handling analysis and GitOps state branch sync.</li>
            <li><strong>AI Reasoning Engine:</strong> Powered by Gemini 3.1 Pro. Analyzes the intent of changes to resolve logical conflicts.</li>
            <li><strong>State Branch:</strong> The <code>gitflow-ai-state</code> branch acts as the global queue coordinator, storing the merge queue state.</li>
            <li><strong>Audit Repository:</strong> The <code>gitflow-audit</code> repo stores the immutable logs, conflict artifacts, and semantic reasoning context.</li>
            <li><strong>UI:</strong> React / Vite Dashboard for Live Updates.</li>
          </ul>
        </div>
      </div>

      {/* 3. Conflict Resolution Strategies */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl space-y-6 print:bg-white print:border-gray-200 print:shadow-none print:p-0 print:mb-8">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 print:text-black print:border-gray-300">3. Conflict Resolution Strategies</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 print:border-gray-300 print:text-gray-600">
                <th className="py-3 px-4">Strategy</th>
                <th className="py-3 px-4">Logic</th>
                <th className="py-3 px-4">Use Case</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300 print:text-gray-800">
              <tr className="border-b border-zinc-800/50 print:border-gray-200">
                <td className="py-3 px-4 font-medium text-indigo-400 print:text-indigo-600">Prefer A</td>
                <td className="py-3 px-4">Discard Target, Keep Source</td>
                <td className="py-3 px-4">Feature overrides or major refactors.</td>
              </tr>
              <tr className="border-b border-zinc-800/50 print:border-gray-200">
                <td className="py-3 px-4 font-medium text-indigo-400 print:text-indigo-600">Prefer B</td>
                <td className="py-3 px-4">Discard Source, Keep Target</td>
                <td className="py-3 px-4">Hotfixes or Master-priority changes.</td>
              </tr>
              <tr className="border-b border-zinc-800/50 print:border-gray-200">
                <td className="py-3 px-4 font-medium text-indigo-400 print:text-indigo-600">Keep Both</td>
                <td className="py-3 px-4">Semantic Interleaving</td>
                <td className="py-3 px-4">Independent additions to the same file.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-indigo-400 print:text-indigo-600">User Override</td>
                <td className="py-3 px-4">Pause & Notify</td>
                <td className="py-3 px-4">High-risk logic changes (Security/Auth).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Implementation Details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl space-y-6 print:bg-white print:border-gray-200 print:shadow-none print:p-0 print:mb-8">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 print:text-black print:border-gray-300">4. Implementation Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-lg font-bold text-cyan-400 mb-2 flex items-center gap-2 print:text-cyan-600"><Layout className="w-5 h-5"/> GitLab API Integration Architecture</h3>
            <p className="text-zinc-400 text-sm leading-relaxed print:text-gray-700">The platform implements a secure proxy layer for GitLab API v4. This enables the frontend to fetch project metadata, commit history, and merge request status without exposing the GITLAB_TOKEN to the client.</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-lg font-bold text-fuchsia-400 mb-2 flex items-center gap-2 print:text-fuchsia-600"><GitBranch className="w-5 h-5"/> Live Topology Visualization</h3>
            <p className="text-zinc-400 text-sm leading-relaxed print:text-gray-700">The Repository Graph uses a dynamic coordinate mapping algorithm that translates GitLab commit parent-child relationships into a visual SVG/Canvas topology in real-time.</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2 print:text-emerald-600"><Network className="w-5 h-5"/> "Binary Search" Failure Isolation</h3>
            <p className="text-zinc-400 text-sm leading-relaxed print:text-gray-700">When a batch of PRs fails CI, the orchestrator automatically splits the batch into two halves and merges them into separate staging branches. By recursively testing these halves, the AI isolates the specific breaking PR in O(log N) time.</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-lg font-bold text-indigo-400 mb-2 flex items-center gap-2 print:text-indigo-600"><Database className="w-5 h-5"/> Atomic Union Groups</h3>
            <p className="text-zinc-400 text-sm leading-relaxed print:text-gray-700">Gemini analyzes the dependency graph. If PR-A modifies a function signature used by PR-B, they are grouped into a Union Group. These are merged atomically—if one fails, the entire group is rolled back.</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2 print:text-amber-600"><Zap className="w-5 h-5"/> Semantic Intent Analysis</h3>
            <p className="text-zinc-400 text-sm leading-relaxed print:text-gray-700">The orchestrator builds a "Semantic AST". If PR-A renames a variable and PR-B uses the old name, GitFlow AI detects the logical conflict and automatically updates PR-B's code.</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-lg font-bold text-pink-400 mb-2 flex items-center gap-2 print:text-pink-600"><GitMerge className="w-5 h-5"/> Cross-Platform Semantic Translation</h3>
            <p className="text-zinc-400 text-sm leading-relaxed print:text-gray-700">When merging between GitHub and GitLab, the AI translates platform-specific metadata, converting GitHub Action YAML logic into GitLab CI/CD syntax on-the-fly.</p>
          </div>
        </div>
      </div>

      {/* 5. Engineer Workflow & CLI */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl space-y-6 print:bg-white print:border-gray-200 print:shadow-none print:p-0 print:mb-8">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 print:text-black print:border-gray-300">5. Engineer Workflow & CLI</h2>
        <div className="text-zinc-300 space-y-4 leading-relaxed print:text-gray-800">
          <h3 className="text-xl font-semibold text-white print:text-black">CLI Command Specification</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 print:border-gray-300 print:text-gray-600">
                  <th className="py-3 px-4">Command</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Parameters</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300 print:text-gray-800 text-sm">
                <tr className="border-b border-zinc-800/50 print:border-gray-200">
                  <td className="py-2 px-4 font-mono text-indigo-400 print:text-indigo-600">status</td>
                  <td className="py-2 px-4">Check merge queue status and PR counts.</td>
                  <td className="py-2 px-4 text-zinc-500">None</td>
                </tr>
                <tr className="border-b border-zinc-800/50 print:border-gray-200">
                  <td className="py-2 px-4 font-mono text-indigo-400 print:text-indigo-600">pause / unpause</td>
                  <td className="py-2 px-4">Suspend or resume the automated merge workflow.</td>
                  <td className="py-2 px-4 text-zinc-500">None</td>
                </tr>
                <tr className="border-b border-zinc-800/50 print:border-gray-200">
                  <td className="py-2 px-4 font-mono text-indigo-400 print:text-indigo-600">reorder</td>
                  <td className="py-2 px-4">Change the priority/order of PRs in queue.</td>
                  <td className="py-2 px-4 text-zinc-500">pr_id, position</td>
                </tr>
                <tr className="border-b border-zinc-800/50 print:border-gray-200">
                  <td className="py-2 px-4 font-mono text-indigo-400 print:text-indigo-600">batch</td>
                  <td className="py-2 px-4">Group PRs into an atomic unit.</td>
                  <td className="py-2 px-4 text-zinc-500">pr_ids[]</td>
                </tr>
                <tr className="border-b border-zinc-800/50 print:border-gray-200">
                  <td className="py-2 px-4 font-mono text-indigo-400 print:text-indigo-600">benchmark</td>
                  <td className="py-2 px-4">Trigger automated self-tests showing various conflict resolution examples to prove workflow accuracy.</td>
                  <td className="py-2 px-4 text-zinc-500">none</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. Advanced Merge Topologies */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl space-y-6 print:bg-white print:border-gray-200 print:shadow-none print:p-0 print:mb-8">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 print:text-black print:border-gray-300">6. Advanced Merge Topologies</h2>
        <ul className="list-disc pl-6 space-y-4 text-zinc-300 print:text-gray-800">
          <li><strong>N-Way Star Merge:</strong> Merging multiple feature branches into a single integration branch simultaneously using AI to resolve multi-way conflicts.</li>
          <li><strong>Cascading Rebase:</strong> Automatically rebasing a chain of dependent PRs (PR-C on PR-B on PR-A) when the root (PR-A) is updated.</li>
          <li><strong>Shadow Integration:</strong> Running background merges into a "shadow" branch to detect conflicts days before the actual merge deadline.</li>
        </ul>
      </div>

      {/* Architecture Diagrams */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl print:hidden">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 mb-6">7. Architecture Diagrams</h2>
        
        <div className="space-y-12">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-zinc-200">SVG Architecture Flow</h3>
              <button 
                onClick={() => setIsSvgFullScreen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors border border-zinc-700"
              >
                <Maximize2 className="w-4 h-4" />
                Full Screen
              </button>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
              <SvgDiagram />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-zinc-200">Mermaid Component Diagram</h3>
              <button 
                onClick={() => setIsMermaidFullScreen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors border border-zinc-700"
              >
                <Maximize2 className="w-4 h-4" />
                Full Screen
              </button>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 overflow-x-auto">
              <Mermaid chart={MERMAID_CHART} />
            </div>
          </div>
        </div>
      </div>

      {/* 8. Local CLI & API Implementation Details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl space-y-6 print:bg-white print:border-gray-200 print:shadow-none print:p-0 print:mb-8">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 print:text-black print:border-gray-300">8. Local CLI & API Implementation Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-lg font-bold text-blue-400 mb-2 flex items-center gap-2 print:text-blue-600"><Terminal className="w-5 h-5"/> CLI Commit Analysis</h3>
            <p className="text-zinc-400 text-sm leading-relaxed print:text-gray-700">The local CLI intercepts commits via <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">/api/cli/analyze-commit</code>. It sends the diff to Gemini, which returns a JSON payload with a review and a <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">blockCommit</code> flag. If true, the CLI halts the git operation, preventing bad code from entering the local repository.</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2 print:text-purple-600"><Network className="w-5 h-5"/> Cross-Platform Sync Orchestrator</h3>
            <p className="text-zinc-400 text-sm leading-relaxed print:text-gray-700">The <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">/api/gitlab/sync-github</code> endpoint creates an isolated workspace, clones GitLab, fetches GitHub, and cherry-picks missing commits. If standard git fails, it invokes Gemini to semantically resolve conflicts and applies the AI's strategy.</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-lg font-bold text-orange-400 mb-2 flex items-center gap-2 print:text-orange-600"><GitMerge className="w-5 h-5"/> Advanced Merge Topologies</h3>
            <p className="text-zinc-400 text-sm leading-relaxed print:text-gray-700">The <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">/api/gitlab/merge-group</code> endpoint handles N-Way Star Merges (resolving multi-way conflicts simultaneously) and Cascading Rebases (sequentially rebasing dependent PRs, invoking AI only on specific rebase step conflicts).</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 print:bg-gray-50 print:border-gray-200">
            <h3 className="text-lg font-bold text-green-400 mb-2 flex items-center gap-2 print:text-green-600"><Zap className="w-5 h-5"/> Auto-Merge Engine</h3>
            <p className="text-zinc-400 text-sm leading-relaxed print:text-gray-700">When standard git fails with <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">CONFLICT (content)</code>, <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">/api/gitlab/auto-merge</code> parses conflict markers and feeds the blocks to Gemini. The AI combines the configurations logically, returning clean content that is automatically committed.</p>
          </div>
        </div>
      </div>

      {/* 9. Future Work */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl space-y-6 print:bg-white print:border-gray-200 print:shadow-none print:p-0 print:mb-8">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 print:text-black print:border-gray-300">9. Future Work</h2>
        <div className="text-zinc-300 space-y-4 leading-relaxed print:text-gray-800">
          <p>
            While the core orchestration engine is complete, we envision the following enhancements for enterprise-scale deployments:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Predictive CI/CD Scaling:</strong> Using historical pipeline data to predict which PRs will take the longest to build, and automatically prioritizing them in the merge queue to optimize overall throughput.</li>
            <li><strong>Deep Security Context:</strong> Integrating Gemini with SAST/DAST tools to not only resolve semantic conflicts but to actively rewrite vulnerable code patterns during the merge process.</li>
            <li><strong>IDE Integration:</strong> Bringing the GitFlow AI orchestration layer directly into VS Code and IntelliJ via dedicated extensions, allowing developers to interact with the AI queue without leaving their editor.</li>
            <li><strong>Jenkins & GitLab CI Integration:</strong> Deeply integrating with Jenkins and GitLab CI pipelines to trigger, monitor, and manage complex build jobs directly from the AI orchestrator, creating a unified CI/CD control plane.</li>
          </ul>
        </div>
      </div>

      {/* Thank You Note */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl text-center print:bg-white print:border-gray-200 print:shadow-none print:p-0 print:mb-8">
        <h2 className="text-3xl font-bold text-indigo-400 mb-4 print:text-indigo-600">Thank You!</h2>
        <p className="text-zinc-300 text-lg max-w-2xl mx-auto print:text-gray-800">
          Thank you to the judges for reviewing <strong>GitFlow AI v2</strong>. We built this platform to solve the very real pain of "Merge Hell" that engineering teams face every day. We hope you enjoyed exploring the architecture as much as we enjoyed building it!
        </p>
      </div>
    </div>
  );
}
