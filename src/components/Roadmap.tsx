import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function Roadmap() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
        <h1 className="text-3xl font-bold mb-4">Design Doc: AI Auto-Merge Queue</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-400 text-lg mb-6">
            A centralized Git workflow management system powered by AI to automate conflict resolution, testing, and merging across project and primary branches.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Architecture Overview</h2>
          <ul className="list-disc pl-6 space-y-2 text-zinc-300">
            <li><strong>Frontend:</strong> React, Tailwind CSS, Lucide Icons.</li>
            <li><strong>Backend:</strong> Node.js Express server handling AI API calls (Gemini 3.1 Pro).</li>
            <li><strong>Database:</strong> Firebase Firestore for real-time state synchronization.</li>
            <li><strong>Hosting:</strong> Firebase Hosting & Cloud Run.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">AI GitFlow (Scope: Steps 6-10)</h2>
          <ol className="list-decimal pl-6 space-y-2 text-zinc-300">
            <li><strong>Submit to Code Review Queue:</strong> PRs enter the system and await human or AI review.</li>
            <li><strong>Address Review Commit:</strong> Iterative updates to the PR based on feedback.</li>
            <li><strong>Move to Merge Queue:</strong> PR is approved and enters the automated merge queue.</li>
            <li><strong>Merge to Project Branch:</strong> AI resolves conflicts, runs tests, and merges into the team's project branch.</li>
            <li><strong>Merge to Master (Primary) Branch:</strong> Bi-weekly automated syncs merge project branches into the primary branch.</li>
          </ol>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Advanced Queue Features</h2>
          <ul className="list-disc pl-6 space-y-2 text-zinc-300">
            <li><strong>Priority Queues:</strong> High priority (e.g., hotfixes) bypass normal queue order.</li>
            <li><strong>Atomic Grouping:</strong> Batch PRs together to ensure they merge as an all-or-nothing unit.</li>
            <li><strong>CLI Interface:</strong> Command-line access for engineers and AI agents to manage queue state (pause, resume, reorder, remove).</li>
          </ul>
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
              <h3 className="font-semibold text-white">Day 2: AI Conflict Resolution & Testing</h3>
              <p className="text-sm text-zinc-400">Integrate Gemini 3.1 Pro to simulate resolving git conflicts and running CI/CD tests.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Day 3: CLI Interface & Design Doc</h3>
              <p className="text-sm text-zinc-400">Build the in-app terminal for queue management and document the architecture.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <Clock className="w-6 h-6 text-indigo-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Day 4: Atomic Batch Merging Logic</h3>
              <p className="text-sm text-zinc-400">Implement the backend logic to handle grouped PRs as a single atomic transaction.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <Circle className="w-6 h-6 text-zinc-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Day 5: Priority Queue Implementation</h3>
              <p className="text-sm text-zinc-400">Update the merge worker to respect high/normal/low priority flags during processing.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <Circle className="w-6 h-6 text-zinc-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Day 6: End-to-End Testing & Bug Fixes</h3>
              <p className="text-sm text-zinc-400">Simulate full team workflows and fix edge cases in the AI merge logic.</p>
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
