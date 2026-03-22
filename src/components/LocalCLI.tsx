import React, { useState, useEffect } from 'react';
import { Terminal, Download, Command, GitCommit, GitPullRequest, GitMerge, Copy, Check, Github, Gitlab, RefreshCw, PlusCircle } from 'lucide-react';

export default function LocalCLI() {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('https://gitflow-ai-836641670384.us-west1.run.app');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);
  
  const installCommand = `curl -sL ${origin}/install.sh | bash -s ${origin}`;

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

        <div className="mt-6 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-indigo-300 mb-2">Required Token Permissions:</h4>
          <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
            <li>
              <strong className="text-zinc-300">GitHub:</strong> Select the <code className="text-indigo-300">repo</code> scope (Full control of private repositories). Also select <code className="text-indigo-300">read:user</code> if you want to run the benchmark test.
            </li>
            <li>
              <strong className="text-zinc-300">GitLab:</strong> Select the <code className="text-indigo-300">api</code> scope (Grants complete read/write access to the API). Alternatively, select <code className="text-indigo-300">read_repository</code>, <code className="text-indigo-300">write_repository</code>, and <code className="text-indigo-300">read_api</code>.
            </li>
          </ul>
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
            Push your code with <code className="text-indigo-300">git-ai push</code> to automatically register your branch with the global GitFlow AI queue.
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
            <div className="text-zinc-500">$ git-ai push origin feature/login</div>
            <div className="text-fuchsia-400 mt-2">[AI GitFlow] Intercepting git push...</div>
            <div className="text-zinc-300">Counting objects: 3, done.</div>
            <div className="text-cyan-400 mt-1">🚀 Push detected. Registering with GitFlow AI Queue...</div>
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
            <GitCommit className="w-5 h-5 text-indigo-400" />
            AI Cherry-Pick
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Run <code className="text-indigo-300">git-ai cherry-pick &lt;hash&gt;</code> to apply specific commits with AI conflict resolution.
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
            <div className="text-zinc-500">$ git-ai cherry-pick a1b2c3d</div>
            <div className="text-fuchsia-400 mt-2">[AI GitFlow] Intercepting git cherry-pick...</div>
            <div className="text-cyan-400">🍒 AI is monitoring your cherry-pick for conflict resolution...</div>
            <div className="text-zinc-300 mt-1">[main a1b2c3d] Applied specific commit changes</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            AI Repository Scaffolding
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Run <code className="text-indigo-300">git-ai create &lt;url&gt;</code> to generate a new repository with AI-powered scaffolding.
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
            <div className="text-zinc-500">$ git-ai create https://github.com/org/new-repo</div>
            <div className="text-fuchsia-400 mt-2">[AI GitFlow] Intercepting create...</div>
            <div className="text-cyan-400">✨ Generating AI scaffolding for new repository...</div>
            <div className="text-emerald-400 mt-1">✅ Repository created. AI generated initial README, .gitignore, and CI/CD pipelines.</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            Cross-Platform Clone
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Run <code className="text-indigo-300">git-ai clone &lt;url&gt;</code> to clone and migrate repositories seamlessly between GitHub and GitLab.
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
            <div className="text-zinc-500">$ git-ai clone https://github.com/org/repo</div>
            <div className="text-fuchsia-400 mt-2">[AI GitFlow] Intercepting clone...</div>
            <div className="text-cyan-400">🔄 Migrating repository to local-repo...</div>
            <div className="text-emerald-400 mt-1">✅ Successfully cloned and migrated repository.</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-400" />
            Cross-Platform Sync
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Run <code className="text-indigo-300">git-ai sync &lt;repoA&gt; &lt;repoB&gt;</code> to synchronize codebases across different platforms with AI conflict resolution.
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
            <div className="text-zinc-500">$ git-ai sync repoA repoB</div>
            <div className="text-fuchsia-400 mt-2">[AI GitFlow] Initiating cross-platform synchronization...</div>
            <div className="text-cyan-400">🧠 Applying GitFlow AI Queue for conflict resolution...</div>
            <div className="text-emerald-400 mt-1">✅ Synchronization complete. Both repositories are now identical.</div>
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

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            Built-in Benchmark
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Run <code className="text-indigo-300">git-ai benchmark</code> to trigger an automated self-test that simulates real-world conflicts and proves AI accuracy.
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
            <div className="text-zinc-500">$ git-ai benchmark</div>
            <div className="text-fuchsia-400 mt-2">[AI GitFlow] Starting benchmark suite...</div>
            <div className="text-cyan-400">🚀 Creating live repository and simulating developer activity...</div>
            <div className="text-emerald-400 mt-1">✅ Conflict detected and resolved semantically by Gemini 3.1 Pro.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
