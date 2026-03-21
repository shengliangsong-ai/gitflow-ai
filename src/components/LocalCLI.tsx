import React, { useState } from 'react';
import { Terminal, Download, Command, GitCommit, GitPullRequest, GitMerge, Copy, Check, Github, Gitlab } from 'lucide-react';

export default function LocalCLI() {
  const [copied, setCopied] = useState(false);
  
  const installCommand = `curl -sL https://ais-pre-fpfgw42bursqbxaxpex54x-21086313823.us-west1.run.app/install.sh | bash`;

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-indigo-400" />
            Local CLI Integration
          </h1>
          <p className="text-zinc-400 mt-1">Integrate AI GitFlow directly into your daily terminal workflow on Mac or Linux.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-indigo-400" />
          Installation & Setup
        </h2>
        <p className="text-zinc-400 mb-4 text-sm">
          Run the following command in your terminal to install the <code className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded">git-ai</code> CLI tool globally.
        </p>
        <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3 mb-6">
          <code className="text-emerald-400 flex-1 font-mono text-sm overflow-x-auto whitespace-nowrap">
            {installCommand}
          </code>
          <button 
            onClick={handleCopy}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-300 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        
        <h3 className="text-md font-semibold text-white mb-2 mt-8">Alternative: Install from Source</h3>
        <p className="text-zinc-400 mb-4 text-sm">
          You can also download the standalone script directly from our open-source repositories.
        </p>
        
        <div className="space-y-4 mb-8">
          <div>
            <p className="text-zinc-300 text-sm mb-2 flex items-center gap-2">
              <Github className="w-4 h-4" /> From GitHub
            </p>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
              <code className="text-emerald-400 font-mono text-sm block overflow-x-auto whitespace-nowrap">
                curl -sL https://raw.githubusercontent.com/shengliangsong-ai/gitflow-ai/main/public/git-ai.js -o ~/.local/bin/git-ai && chmod +x ~/.local/bin/git-ai
              </code>
            </div>
          </div>
          
          <div>
            <p className="text-zinc-300 text-sm mb-2 flex items-center gap-2">
              <Gitlab className="w-4 h-4" /> From GitLab
            </p>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
              <code className="text-emerald-400 font-mono text-sm block overflow-x-auto whitespace-nowrap">
                curl -sL https://gitlab.com/shengliang.song.ai/gitflow-ai/-/raw/main/public/git-ai.js -o ~/.local/bin/git-ai && chmod +x ~/.local/bin/git-ai
              </code>
            </div>
          </div>
        </div>
        
        <h3 className="text-md font-semibold text-white mb-2">Configure API Keys</h3>
        <p className="text-zinc-400 mb-4 text-sm">
          Because this is a real, standalone tool, you must provide your own API keys. The keys are stored locally on your machine in <code className="text-zinc-300">~/.git-ai.json</code>.
        </p>
        <div className="space-y-3">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
            <code className="text-zinc-300 font-mono text-sm">
              <span className="text-indigo-400">git-ai</span> config set GEMINI_API_KEY <span className="text-zinc-500">&lt;your_gemini_key&gt;</span>
            </code>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
            <code className="text-zinc-300 font-mono text-sm">
              <span className="text-indigo-400">git-ai</span> config set GIT_TOKEN <span className="text-zinc-500">&lt;your_github_or_gitlab_token&gt;</span>
            </code>
          </div>
        </div>
        
        <p className="text-xs text-zinc-500 mt-4">
          Requires Node.js and Git to be installed on your system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-indigo-400" />
            AI-Assisted Commits
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Instead of <code className="text-zinc-300">git commit</code>, use <code className="text-indigo-300">git-ai commit</code>. The CLI will analyze your staged files for potential issues before finalizing the commit.
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
            <div className="text-zinc-500">$ git-ai commit -m "Fix login bug"</div>
            <div className="text-fuchsia-400 mt-2">[AI GitFlow] Intercepting git commit...</div>
            <div className="text-cyan-400">🤖 Analyzing staged files for potential issues...</div>
            <div className="text-emerald-400">✅ Code looks solid. Proceeding with commit.</div>
            <div className="text-zinc-300 mt-1">[main 1a2b3c4] Fix login bug</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-indigo-400" />
            Automated Merge Queue
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Push your code with <code className="text-indigo-300">git-ai push</code> to automatically register your branch with the global AI merge queue.
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
            <div className="text-zinc-500">$ git-ai push origin feature/login</div>
            <div className="text-fuchsia-400 mt-2">[AI GitFlow] Intercepting git push...</div>
            <div className="text-zinc-300">Counting objects: 3, done.</div>
            <div className="text-cyan-400 mt-1">🚀 Push detected. Registering with AI Merge Queue...</div>
            <div className="text-emerald-400">✅ PR added to queue. Run 'git-ai status' to monitor.</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-indigo-400" />
            Smart Rebasing
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Run <code className="text-indigo-300">git-ai rebase main</code> to have the AI monitor your rebase and assist with complex conflict resolutions.
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
            <div className="text-zinc-500">$ git-ai rebase main</div>
            <div className="text-fuchsia-400 mt-2">[AI GitFlow] Intercepting git rebase...</div>
            <div className="text-cyan-400">🔄 AI is monitoring your rebase for conflict resolution...</div>
            <div className="text-zinc-300 mt-1">Successfully rebased and updated refs/heads/feature.</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Command className="w-5 h-5 text-indigo-400" />
            Queue Status
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Check the global merge queue status directly from your terminal without opening the browser.
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
            <div className="text-zinc-500">$ git-ai status</div>
            <div className="text-fuchsia-400 mt-2">[AI GitFlow] Intercepting git status...</div>
            <div className="text-cyan-400">📊 Fetching queue status from AI GitFlow Cloud...</div>
            <div className="text-amber-400 mt-1">Queue Status: 2 PRs waiting, 1 processing.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
