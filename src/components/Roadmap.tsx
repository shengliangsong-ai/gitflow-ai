import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function Roadmap() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
        <h1 className="text-3xl font-bold mb-4">Roadmap: Semantic Orchestration Layer</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-400 text-lg mb-6">
            A next-generation orchestration layer powered by Gemini 3.1 Pro to eliminate "Merge Hell" using Semantic Intent Analysis and Advanced Merge Topologies.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Architecture Overview</h2>
          <ul className="list-disc pl-6 space-y-2 text-zinc-300">
            <li><strong>Frontend:</strong> React, Tailwind CSS, Lucide Icons.</li>
            <li><strong>Backend:</strong> Node.js Express server handling AI API calls (Gemini 3.1 Pro).</li>
            <li><strong>Database:</strong> Firebase Firestore for real-time state synchronization.</li>
            <li><strong>Hosting:</strong> Firebase Hosting & Cloud Run.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Core Capabilities</h2>
          <ol className="list-decimal pl-6 space-y-2 text-zinc-300">
            <li><strong>Semantic Intent Analysis:</strong> AI understands the purpose of changes, calculating risk and identifying affected systems.</li>
            <li><strong>AST-Aware Conflict Resolution:</strong> Resolves deep logical conflicts beyond simple line-diffing.</li>
            <li><strong>Advanced Merge Topologies:</strong> Supports N-Way Star Merge, Cascading Rebase, and Shadow Integration.</li>
            <li><strong>CLI Orchestration:</strong> Command-line access for engineers to manage queue state (pause, resume, reorder, group).</li>
            <li><strong>Built-in Benchmarks:</strong> Run <code className="text-indigo-300">git-ai benchmark</code> locally to trigger automated self-tests showing various conflict resolution examples.</li>
          </ol>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
        <h2 className="text-2xl font-bold mb-6">7-Day Submission Checklist</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Day 1: Core UI & Firebase Setup</h3>
              <p className="text-sm text-zinc-400">Initialize project, setup Firestore schema, and build the main dashboard.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Day 2: Semantic Intent Analysis</h3>
              <p className="text-sm text-zinc-400">Integrate Gemini 3.1 Pro to analyze PR intent, calculate risk levels, and detect logical conflicts.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Day 3: AST-Aware Conflict Resolution</h3>
              <p className="text-sm text-zinc-400">Implement AI-driven resolution strategies that understand code structure and dependencies.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <Clock className="w-6 h-6 text-indigo-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Day 4: CLI Orchestration & Benchmarks</h3>
              <p className="text-sm text-zinc-400">Build the in-app terminal for queue management and implement the <code className="text-indigo-300">git-ai benchmark</code> self-test suite.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <Circle className="w-6 h-6 text-zinc-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Day 5: Advanced Merge Topologies</h3>
              <p className="text-sm text-zinc-400">Implement backend logic for N-Way Star Merge and Cascading Rebase scenarios.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <Circle className="w-6 h-6 text-zinc-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Day 6: End-to-End Testing & Polish</h3>
              <p className="text-sm text-zinc-400">Simulate full team workflows, fix edge cases in the AI merge logic, and refine the UI.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <Circle className="w-6 h-6 text-zinc-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Day 7: Final Polish & Video Recording</h3>
              <p className="text-sm text-zinc-400">Record the Devpost submission video demonstrating the AI GitFlow.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
