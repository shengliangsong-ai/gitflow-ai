import React from 'react';
import { FileText, GitMerge, Database, Layout, Terminal, Download, Zap, Network, GitBranch } from 'lucide-react';

export default function Architecture() {
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12 print:max-w-none print:p-0 print:m-0 print:bg-white print:text-black">
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
            <li><strong>Git Providers:</strong> GitHub / GitLab integration via Webhooks.</li>
            <li><strong>AI Orchestrator:</strong> Node.js / Express backend handling analysis and state sync.</li>
            <li><strong>AI Reasoning Engine:</strong> Powered by Gemini 3.1 Pro. Analyzes the intent of changes to resolve logical conflicts.</li>
            <li><strong>Persistence Layer:</strong> Firebase Firestore acts as the global state coordinator, storing the merge queue, branch health, and semantic reasoning logs.</li>
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

      {/* Mermaid Diagram */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl print:hidden">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-4 mb-6">7. Architecture Diagram (Mermaid)</h2>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 overflow-x-auto">
          <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
{`graph TD
    subgraph Git Providers
        A[GitHub / GitLab]
    end

    subgraph AI Orchestrator
        B[Node.js / Express]
        C{Gemini 3.1 Pro Semantic Engine}
        B <-->|Analyzes Intent| C
    end

    subgraph Persistence Layer
        D[(Firebase Firestore)]
    end

    subgraph UI
        E[React / Vite Dashboard]
    end

    A -->|Webhooks| B
    B -->|State Sync| D
    D -->|Live Updates| E
    E -->|Manual Overrides| D

    classDef provider fill:#18181b,stroke:#e24329,stroke-width:2px,color:#fff;
    classDef orchestrator fill:#18181b,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef db fill:#18181b,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef ui fill:#18181b,stroke:#10b981,stroke-width:2px,color:#fff;

    class A provider;
    class B,C orchestrator;
    class D db;
    class E ui;`}
          </pre>
        </div>
      </div>
    </div>
  );
}
