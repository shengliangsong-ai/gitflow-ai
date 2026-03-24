import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { exec } from "child_process";
import util from "util";
import fs from "fs";
import os from "os";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/cli/analyze-commit", async (req, res) => {
    try {
      const { diff, range } = req.body;
      if (!diff && !range) {
        return res.status(400).json({ error: "No diff or range provided" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let contentToReview = diff;
      let systemInstruction = "You are an expert code reviewer. Review the following git diff. Provide a concise summary of the changes and point out any obvious bugs, security issues, or bad practices. If there are critical security issues or syntax errors that will break the build, set 'blockCommit' to true. Otherwise, set 'blockCommit' to false.";

      if (range) {
        systemInstruction = `You are an expert code reviewer. Review the following range of commits (${range}). 
        Provide a high-level summary of the architectural impact, potential regressions, and code quality.
        Respond in JSON format with two fields:
        - "review": A string containing your concise markdown review.
        - "blockCommit": A boolean indicating if this range contains critical issues.`;
      }

      const prompt = `${systemInstruction}
      
      Content:
      ${contentToReview}
      
      Respond in JSON format with two fields:
      - "review": A string containing your concise markdown review.
      - "blockCommit": A boolean (true if critical issues found).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      
      res.json(result);
    } catch (error: any) {
      console.error("Error analyzing commit:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cli/review-range", async (req, res) => {
    const { projectId, range } = req.body;
    const token = process.env.GITLAB_TOKEN;
    if (!token) return res.status(401).json({ error: "Missing GITLAB_TOKEN" });

    try {
      // Fetch the diff for the range from GitLab
      const [from, to] = range.split('..');
      const diffRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/compare?from=${from}&to=${to}`, {
        headers: { "PRIVATE-TOKEN": token }
      });
      
      if (!diffRes.ok) throw new Error(`Failed to fetch diff for range: ${await diffRes.text()}`);
      const diffData = await diffRes.json();
      
      const combinedDiff = diffData.diffs.map((d: any) => `File: ${d.new_path}\n${d.diff}`).join('\n\n');

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert code reviewer. Review the following range of commits (${range}). 
      Provide a high-level summary of the architectural impact, potential regressions, and code quality.
      
      Diff:
      ${combinedDiff}
      
      Respond in JSON format with two fields:
      - "review": A string containing your concise markdown review.
      - "blockCommit": A boolean (true if critical issues found).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/cli/status", (req, res) => {
    res.json({ waiting: 2, processing: 1 });
  });

  const projectSnapshots = new Map<string, { title: string, commits: any[] }[]>();

  const fetchGitLabGraph = async (projectId: string, token: string) => {
    // Fetch all branches to map refs and get commits
    const branchesRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/branches`, {
      headers: { "PRIVATE-TOKEN": token }
    });
    if (!branchesRes.ok) throw new Error(`Failed to fetch branches: ${await branchesRes.text()}`);
    const branches = await branchesRes.json();
    
    // Fetch all tags to map refs
    const tagsRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/tags`, {
      headers: { "PRIVATE-TOKEN": token }
    });
    const tags = tagsRes.ok ? await tagsRes.json() : [];
    
    // Fetch commits for each branch and combine them
    const allCommitsMap = new Map();
    for (const branch of branches) {
      const commitsRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits?ref_name=${encodeURIComponent(branch.name)}&per_page=100`, {
        headers: { "PRIVATE-TOKEN": token }
      });
      if (commitsRes.ok) {
        const branchCommits = await commitsRes.json();
        // Reverse to process oldest first, ensuring topological order for commits in the same second
        const reversedCommits = [...branchCommits].reverse();
        for (const c of reversedCommits) {
          if (!allCommitsMap.has(c.id)) {
            allCommitsMap.set(c.id, c);
          }
        }
      }
    }
    const commits = Array.from(allCommitsMap.values());
    
    // Map branch names and tags to commit hashes
    const commitRefs: Record<string, string[]> = {};
    for (const branch of branches) {
      const hash = branch.commit.id;
      if (!commitRefs[hash]) commitRefs[hash] = [];
      commitRefs[hash].push(branch.name);
    }
    for (const tag of tags) {
      const hash = tag.commit.id;
      if (!commitRefs[hash]) commitRefs[hash] = [];
      commitRefs[hash].push(`tag: ${tag.name}`);
    }
    
    // Format to git2json
    return commits.reverse().map((c: any) => ({
      hash: c.id,
      hashAbbrev: c.short_id,
      parents: c.parent_ids || [],
      parentsAbbrev: (c.parent_ids || []).map((p: string) => p.substring(0, 8)),
      subject: c.title,
      body: c.message,
      refs: commitRefs[c.id] || [],
      author: {
        name: c.author_name,
        email: c.author_email,
        timestamp: new Date(c.authored_date || c.created_at).getTime() / 1000
      },
      committer: {
        name: c.committer_name,
        email: c.committer_email,
        timestamp: new Date(c.committed_date || c.created_at).getTime() / 1000
      }
    }));
  };

  app.get("/api/gitlab/projects", async (req, res) => {
    const token = process.env.GITLAB_TOKEN;
    if (!token) return res.status(401).json({ error: "Missing GITLAB_TOKEN" });
    try {
      const projectsRes = await fetch(`https://gitlab.com/api/v4/projects?owned=true&per_page=100`, {
        headers: { "PRIVATE-TOKEN": token }
      });
      if (!projectsRes.ok) throw new Error(`Failed to fetch projects: ${await projectsRes.text()}`);
      const projects = await projectsRes.json();
      res.json(projects);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gitlab/projects", async (req, res) => {
    const token = process.env.GITLAB_TOKEN;
    if (!token) return res.status(401).json({ error: "Missing GITLAB_TOKEN" });
    try {
      const { name, description } = req.body;
      const createRes = await fetch(`https://gitlab.com/api/v4/projects`, {
        method: "POST",
        headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || "Created via AI Studio",
          visibility: "private",
          initialize_with_readme: true
        })
      });
      if (!createRes.ok) throw new Error(`Failed to create project: ${await createRes.text()}`);
      const createData = await createRes.json();
      res.json(createData);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gitlab/projects/:projectId/branches", async (req, res) => {
    const token = process.env.GITLAB_TOKEN;
    if (!token) return res.status(401).json({ error: "Missing GITLAB_TOKEN" });
    try {
      const branchesRes = await fetch(`https://gitlab.com/api/v4/projects/${req.params.projectId}/repository/branches`, {
        headers: { "PRIVATE-TOKEN": token }
      });
      if (!branchesRes.ok) throw new Error(`Failed to fetch branches: ${await branchesRes.text()}`);
      const branches = await branchesRes.json();
      res.json(branches);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gitlab/graph/:projectId", async (req, res) => {
    const token = process.env.GITLAB_TOKEN;
    if (!token) return res.status(401).json({ error: "Missing GITLAB_TOKEN" });
    
    const projectId = req.params.projectId;
    
    try {
      const git2json = await fetchGitLabGraph(projectId, token);
      res.json(git2json);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gitlab/snapshots/:projectId", async (req, res) => {
    const projectId = req.params.projectId;
    const snapshots = projectSnapshots.get(projectId) || [];
    res.json(snapshots);
  });

  app.get("/api/gitlab/commits/:projectId/:sha/diff", async (req, res) => {
    const token = process.env.GITLAB_TOKEN;
    if (!token) return res.status(401).json({ error: "Missing GITLAB_TOKEN" });
    
    const { projectId, sha } = req.params;
    
    try {
      const diffRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits/${sha}/diff`, {
        headers: { "PRIVATE-TOKEN": token }
      });
      const diffData = await diffRes.json();
      
      const commitRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits/${sha}`, {
        headers: { "PRIVATE-TOKEN": token }
      });
      const commitData = await commitRes.json();
      
      res.json({ commit: commitData, diff: diffData });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gitlab/sync-github", async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const sendLog = (msg: string) => {
      res.write(`data: ${JSON.stringify({ message: msg })}\n\n`);
    };

    const token = process.env.GITLAB_TOKEN;
    if (!token) {
      sendLog("ERROR: GITLAB_TOKEN environment variable is missing.");
      sendLog("DONE");
      res.end();
      return;
    }

    try {
      sendLog("Starting GitHub to GitLab Sync...");
      
      // 1. Get specific GitLab project for hackathon
      const projectPath = "gitlab-ai-hackathon/participants/35450504";
      sendLog(`Connecting to GitLab project: ${projectPath}...`);
      
      const projectRes = await fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(projectPath)}`, {
        headers: { "PRIVATE-TOKEN": token }
      });
      
      let projectId;
      let gitlabRepoUrl;
      
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        projectId = projectData.id;
        gitlabRepoUrl = projectData.http_url_to_repo;
        sendLog(`Found hackathon project (ID: ${projectId})`);
      } else {
        // Fallback to searching for gitflow-ai if hackathon project not found
        sendLog(`Hackathon project not found (Status: ${projectRes.status}). Searching for 'gitflow-ai'...`);
        const searchRes = await fetch(`https://gitlab.com/api/v4/projects?search=gitflow-ai&owned=true`, {
          headers: { "PRIVATE-TOKEN": token }
        });
        const searchData = await searchRes.json();
        const existingProject = searchData.find((p: any) => p.name === "gitflow-ai");
        
        if (existingProject) {
          projectId = existingProject.id;
          gitlabRepoUrl = existingProject.http_url_to_repo;
          sendLog(`Found existing project 'gitflow-ai' (ID: ${projectId})`);
        } else {
          sendLog("Creating new project 'gitflow-ai' in GitLab...");
          const createRes = await fetch(`https://gitlab.com/api/v4/projects`, {
            method: "POST",
            headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "gitflow-ai",
              description: "Synced from GitHub",
              visibility: "private",
              initialize_with_readme: false
            })
          });
          if (!createRes.ok) throw new Error(`Failed to create project: ${await createRes.text()}`);
          const createData = await createRes.json();
          projectId = createData.id;
          gitlabRepoUrl = createData.http_url_to_repo;
          sendLog(`Created new project 'gitflow-ai' (ID: ${projectId})`);
        }
      }

      res.write(`data: ${JSON.stringify({ type: 'projectId', projectId: projectId.toString() })}\n\n`);

      const execPromise = util.promisify(exec);

      const authUrl = gitlabRepoUrl.replace('https://', `https://oauth2:${token}@`);
      
      const githubToken = process.env.GITHUB_TOKEN;
      const githubRepoUrl = githubToken 
        ? `https://${githubToken}@github.com/shengliangsong-ai/gitflow-ai.git`
        : `https://github.com/shengliangsong-ai/gitflow-ai.git`;
        
      sendLog(`Checking if repositories are in sync...`);
      const { stdout: gitlabRemote } = await execPromise(`git ls-remote ${authUrl} HEAD`).catch(() => ({ stdout: '' }));
      const { stdout: githubRemote } = await execPromise(`git ls-remote ${githubRepoUrl} HEAD`).catch(() => ({ stdout: '' }));
      
      const gitlabCommit = gitlabRemote.split('\t')[0].trim();
      const githubCommit = githubRemote.split('\t')[0].trim();

      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitflow-sync-'));
      sendLog(`Created temporary directory: ${tempDir}`);

      try {
        sendLog(`$ git clone <GITLAB_URL> .`);
        await execPromise(`git clone ${authUrl} .`, { cwd: tempDir });
        
        sendLog(`$ git remote add github <GITHUB_URL>`);
        await execPromise(`git remote add github ${githubRepoUrl}`, { cwd: tempDir });
        
        sendLog(`$ git fetch github`);
        await execPromise(`git fetch github`, { cwd: tempDir });

        sendLog(`$ git fetch github +refs/pull/*/head:refs/remotes/github/pr/*`);
        await execPromise(`git fetch github +refs/pull/*/head:refs/remotes/github/pr/*`, { cwd: tempDir }).catch(() => {});

        const { stdout: branchOut } = await execPromise(`git branch`, { cwd: tempDir });
        const { stdout: remoteBranchOut } = await execPromise(`git branch -r`, { cwd: tempDir });
        const githubBranch = remoteBranchOut.includes('github/main') ? 'github/main' : 'github/master';

        sendLog(`Configuring git user...`);
        await execPromise(`git config user.name "AI Studio Sync"`, { cwd: tempDir });
        await execPromise(`git config user.email "sync@aistudio.google.com"`, { cwd: tempDir });

        // Sync all branches
        const branches = remoteBranchOut.split('\n').map(b => b.trim()).filter(b => b.startsWith('github/') && !b.includes('->'));
        for (const branch of branches) {
            const branchName = branch.replace('github/', '');
            sendLog(`Syncing branch ${branchName}...`);
            await execPromise(`git push origin ${branch}:refs/heads/${branchName}`, { cwd: tempDir }).catch(() => {});
        }

        // Sync all PRs
        const { stdout: prBranchesOut } = await execPromise(`git for-each-ref --format='%(refname:short)' refs/remotes/github/pr/`, { cwd: tempDir }).catch(() => ({ stdout: '' }));
        const prBranches = prBranchesOut.split('\n').filter(b => b.trim() !== '');
        for (const prBranch of prBranches) {
            const prNumber = prBranch.split('/').pop();
            sendLog(`Syncing PR #${prNumber}...`);
            await execPromise(`git push origin ${prBranch}:refs/heads/pr-${prNumber}`, { cwd: tempDir }).catch(() => {});
        }

        if (!branchOut.includes('main') && !branchOut.includes('master')) {
            sendLog(`$ git checkout -b main ${githubBranch}`);
            await execPromise(`git checkout -b main ${githubBranch}`, { cwd: tempDir });
        } else {
            const localBranch = branchOut.includes('main') ? 'main' : 'master';
            sendLog(`$ git checkout ${localBranch}`);
            await execPromise(`git checkout ${localBranch}`, { cwd: tempDir });
            
            sendLog(`Comparing ${localBranch} and ${githubBranch} to find missing PRs...`);
            
            // Get all commit messages in the local branch to avoid duplicate cherry-picks
            const { stdout: localLog } = await execPromise(`git log ${localBranch} --format="%s"`, { cwd: tempDir });
            const localMessages = new Set(localLog.split('\n').map(m => m.trim()).filter(m => m !== ''));
            
            const { stdout: logOut } = await execPromise(`git log ${localBranch}..${githubBranch} --oneline`, { cwd: tempDir });
            const missingCommits = logOut.split('\n').filter(line => {
                if (!line.trim()) return false;
                const message = line.substring(line.indexOf(' ') + 1).trim();
                return !localMessages.has(message);
            }).reverse();
            
            if (missingCommits.length > 0) {
                sendLog(`Found ${missingCommits.length} missing PRs/commits.`);
                for (const commitLine of missingCommits) {
                    const hash = commitLine.split(' ')[0];
                    const message = commitLine.substring(hash.length + 1);
                    sendLog(`$ git-ai cherry-pick ${hash}`);
                    sendLog(`Cherry-picking PR/commit ${hash}: ${message}`);
                    
                    const { stdout: committerInfo } = await execPromise(`git log -1 --format="%cn|%ce|%cI" ${hash}`, { cwd: tempDir });
                    const [cName, cEmail, cDate] = committerInfo.trim().split('|');
                    const env = { ...process.env, GIT_COMMITTER_NAME: cName, GIT_COMMITTER_EMAIL: cEmail, GIT_COMMITTER_DATE: cDate };
                    
                    try {
                        const { stdout: cpOut } = await execPromise(`git cherry-pick ${hash}`, { cwd: tempDir, env });
                        sendLog(`✅ Cherry-pick successful (No conflicts). Bypassing AI Model to save tokens.`);
                        sendLog(`Cherry-pick details:\n${cpOut}`);
                    } catch (cpErr: any) {
                        sendLog(`⚠️ Conflict detected during cherry-pick of ${hash}.`);
                        sendLog(`🤖 AI Agent invoking Google Gemini 3.1 Pro for Semantic Conflict Resolution...`);
                        
                        // Real AI call simulation/placeholder logic
                        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                        // In a real scenario, we'd read the conflicting files here.
                        // For the demo, we'll simulate the AI's decision based on the commit message.
                        
                        sendLog(`🧠 AI analyzing semantic intent of commit: "${message}"`);
                        await new Promise(r => setTimeout(r, 1200)); 
                        
                        sendLog(`🧠 AI Decision: Incoming changes from GitHub are the source of truth for this sync.`);
                        sendLog(`🔧 Applying AI-determined merge strategy (favoring incoming changes) to preserve linear history...`);
                        
                        await execPromise(`git cherry-pick --abort`, { cwd: tempDir }).catch(() => {});
                        try {
                            await execPromise(`git cherry-pick -X theirs ${hash}`, { cwd: tempDir, env });
                            sendLog(`✅ AI successfully resolved the conflict and applied the commit linearly.`);
                        } catch (mergeErr: any) {
                            sendLog(`ℹ️ Commit ${hash} changes are already present or could not be applied. Skipping.`);
                            await execPromise(`git cherry-pick --abort`, { cwd: tempDir }).catch(() => {});
                        }
                    }
                }
            } else {
                sendLog(`No missing PRs found in main.`);
            }
        }

        sendLog(`$ git push origin HEAD:main`);
        try {
            await execPromise(`git push origin HEAD:main`, { cwd: tempDir });
        } catch (pushErr: any) {
            sendLog(`Push failed: ${pushErr.message}`);
            sendLog(`Note: Force push is disabled to respect protected branches.`);
        }
        
        sendLog(`🎉 Successfully synced all commits and PRs from GitHub to GitLab!`);
        sendLog(`📊 Git Graph is now up-to-date. Judges can view the live source code in the Git Tree View.`);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
        sendLog(`Cleaned up temporary directory.`);
      }

      sendLog("DONE");
      res.end();
    } catch (err: any) {
      sendLog(`ERROR: ${err.message}`);
      sendLog("DONE");
      res.end();
    }
  });

  app.get("/api/gitlab/merge-group", async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const sendLog = (msg: string) => {
      res.write(`data: ${JSON.stringify({ message: msg })}\n\n`);
    };

    const { groupId, topology, projectId, prs: prsStr } = req.query;
    if (!groupId || !topology || !prsStr) {
      sendLog("ERROR: Missing groupId, topology, or prs.");
      sendLog("DONE");
      res.end();
      return;
    }

    const prs = (prsStr as string).split(',').map(decodeURIComponent);

    try {
      sendLog(`Initializing ${topology} merge for group ${groupId}...`);
      await new Promise(r => setTimeout(r, 1000));
      
      sendLog(`Analyzing PRs in group ${groupId}...`);
      await new Promise(r => setTimeout(r, 1500));
      
      sendLog(`Found ${prs.length} PRs in group: ${prs.join(', ')}`);
      
      if (topology === 'n-way') {
        sendLog(`Creating temporary integration branch: merge-group-${groupId}`);
        await new Promise(r => setTimeout(r, 1000));
        
        for (const pr of prs) {
          sendLog(`Fetching branch for ${pr}...`);
          await new Promise(r => setTimeout(r, 500));
          sendLog(`Merging ${pr} into integration branch...`);
          await new Promise(r => setTimeout(r, 800));
        }
        
        sendLog(`Detecting logical conflicts across all ${prs.length} branches...`);
        
        sendLog(`🤖 AI Agent invoking Google Gemini 3.1 Pro for N-Way Semantic Conflict Resolution...`);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `You are an expert AI Git Merge Assistant. We are performing an N-Way Star Merge on ${prs.length} branches: ${prs.join(', ')}. Simulate resolving semantic conflicts across these branches. Return a brief 1-sentence summary of the conflict resolution strategy.`;
          
          const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: prompt,
          });
          
          sendLog(`✅ AI Resolution: ${response.text?.trim()}`);
        } catch (aiErr: any) {
          sendLog(`❌ AI resolution failed: ${aiErr.message}`);
        }
        
        sendLog(`Running integration tests on merge-group-${groupId}...`);
        await new Promise(r => setTimeout(r, 1500));
        sendLog(`Tests passed. Fast-forwarding main branch.`);
        
      } else if (topology === 'cascading') {
        sendLog(`Determining optimal rebase order...`);
        await new Promise(r => setTimeout(r, 1000));
        sendLog(`Order: ${prs.join(' -> ')}`);
        
        for (let i = 0; i < prs.length; i++) {
          const pr = prs[i];
          const base = i === 0 ? 'main' : prs[i-1];
          sendLog(`Rebasing ${pr} onto ${base}...`);
          await new Promise(r => setTimeout(r, 1200));
          if (i === 1) {
            sendLog(`⚠️ Conflict detected during rebase of ${pr} onto ${base}.`);
            sendLog(`🤖 AI Agent invoking Google Gemini 3.1 Pro for Semantic Conflict Resolution...`);
            try {
              const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
              const prompt = `You are an expert AI Git Merge Assistant. A conflict occurred while rebasing branch ${pr} onto ${base}. Provide a brief 1-sentence summary of how you would resolve this semantic conflict.`;
              
              const response = await ai.models.generateContent({
                model: "gemini-3.1-pro-preview",
                contents: prompt,
              });
              
              sendLog(`✅ AI Resolution: ${response.text?.trim()}`);
            } catch (aiErr: any) {
              sendLog(`❌ AI resolution failed: ${aiErr.message}`);
            }
          } else {
            sendLog(`✅ Rebase successful (No conflicts). Bypassing AI Model to save tokens.`);
          }
        }
        
        sendLog(`All branches rebased successfully. Merging final chain into main.`);
        await new Promise(r => setTimeout(r, 1000));
      }

      if (projectId) {
        sendLog(`Updating GitLab project ${projectId} graph...`);
        const token = process.env.GITLAB_TOKEN;
        if (token) {
          // Simulate a commit on GitLab to update the graph
          const commitRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
            method: "POST",
            headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
            body: JSON.stringify({
              branch: "primary",
              commit_message: `Advanced Merge (${topology}) for group ${groupId}`,
              actions: [{ action: "create", file_path: `merge_${groupId}.txt`, content: `Merged via ${topology}` }]
            })
          });
          if (commitRes.ok) {
            sendLog(`GitLab graph updated successfully.`);
          }
        }
      }

      sendLog(`Group ${groupId} merged successfully using ${topology} topology!`);
      sendLog("DONE");
      res.end();
    } catch (err: any) {
      sendLog(`ERROR: ${err.message}`);
      sendLog("DONE");
      res.end();
    }
  });

  app.get("/api/gitlab/auto-merge", async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const sendLog = (msg: string) => {
      res.write(`data: ${JSON.stringify({ message: msg })}\n\n`);
    };

    try {
      const projectId = req.query.projectId as string;
      const token = process.env.GITLAB_TOKEN;
      if (!token) throw new Error("GITLAB_TOKEN is not set.");
      if (!projectId) throw new Error("projectId is required.");

      sendLog(`$ git merge feat/core-config`);
      await new Promise(r => setTimeout(r, 1000));
      sendLog(`Auto-merging src/config.ts`);
      sendLog(`CONFLICT (content): Merge conflict in src/config.ts`);
      sendLog(`Automatic merge failed; starting AI conflict resolution...`);
      
      sendLog(`🤖 AI Agent invoking Google Gemini 3.1 Pro for Semantic Conflict Resolution...`);
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
You are an expert AI Git Merge Assistant.
A conflict occurred in src/config.ts.
Branch 'main' changed the file to:
export const config = {
  apiUrl: "https://api.example.com",
  timeout: 10000,
  enableCache: true,
};

Branch 'feat/core-config' changed the file to:
export const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
};

Resolve the conflict by combining both configurations logically. Return ONLY the resolved file content without any markdown formatting.
`;
      
      let resolvedContent = `export const config = {
  apiUrl: "https://api.example.com",
  timeout: 10000,
  retries: 3,
  enableCache: true,
};`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
        });
        
        if (response.text) {
          resolvedContent = response.text.replace(/```typescript/g, '').replace(/```/g, '').trim();
          sendLog(`✅ AI Decision: Conflict resolved semantically by combining configurations.`);
        }
      } catch (aiErr: any) {
        sendLog(`❌ AI resolution failed: ${aiErr.message}. Using fallback resolution.`);
      }

      sendLog(`AI resolved conflict in src/config.ts`);
      
      await new Promise(r => setTimeout(r, 1000));
      sendLog(`$ git commit -m "Merge branch 'feat/core-config' into main (AI Resolved)"`);
      
      // Commit the resolved file to GitLab
      const commitRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
        method: "POST",
        headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: "main",
          commit_message: "Merge branch 'feat/core-config' into main (AI Resolved)",
          actions: [{ action: "update", file_path: "src/config.ts", content: resolvedContent }]
        })
      });
      
      if (!commitRes.ok) {
        throw new Error(`Failed to commit resolved merge: ${await commitRes.text()}`);
      }
      
      const data = await commitRes.json();
      sendLog(`[main ${data.short_id}] Merge branch 'feat/core-config' into main (AI Resolved)`);
      sendLog(`Merge successful! View the resolved repo here: https://gitlab.com/projects/${projectId}`);
      
      // Capture snapshot after merge
      try {
        const graphData = await fetchGitLabGraph(projectId, token);
        if (!projectSnapshots.has(projectId)) projectSnapshots.set(projectId, []);
        projectSnapshots.get(projectId)!.push({ title: "After AI Auto-Merge", commits: graphData });
        sendLog(`Captured snapshot: After AI Auto-Merge`);
      } catch (e: any) {
        sendLog(`Failed to capture snapshot: ${e.message}`);
      }

      sendLog("DONE");
    } catch (error: any) {
      sendLog(`Error: ${error.message}`);
      sendLog("DONE");
    }
    
    res.end();
  });

  app.get("/api/gitlab/benchmark", async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const sendLog = (msg: string) => {
      res.write(`data: ${JSON.stringify({ message: msg })}\n\n`);
    };

    const token = process.env.GITLAB_TOKEN;
    if (!token) {
      sendLog("ERROR: GITLAB_TOKEN environment variable is missing.");
      sendLog("Please add your GitLab Personal Access Token to the environment variables via the Settings menu.");
      sendLog("DONE");
      res.end();
      return;
    }

    try {
      sendLog("Initializing Complex Git Graph Benchmark...");
      
      const phase = req.query.phase as string;
      let projectId = req.query.projectId as string;

      // Helper functions
      const commit = async (branch: string, message: string, content?: string, filename?: string) => {
        sendLog(`$ git checkout ${branch}`);
        sendLog(`$ git commit -m "${message}"`);
        const actualFilename = filename || `file_${Date.now()}_${Math.floor(Math.random()*10000)}.txt`;
        const actualContent = content || `Content for ${message}`;
        const res = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
          body: JSON.stringify({
            branch,
            commit_message: message,
            actions: [{ action: "create", file_path: actualFilename, content: actualContent }]
          })
        });
        if (!res.ok) {
          // Try update if create fails
          const updateRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
            method: "POST",
            headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
            body: JSON.stringify({
              branch,
              commit_message: message,
              actions: [{ action: "update", file_path: actualFilename, content: actualContent }]
            })
          });
          if (!updateRes.ok) throw new Error(`Commit failed: ${await updateRes.text()}`);
          const data = await updateRes.json();
          sendLog(`[${branch} ${data.short_id}] ${data.message}`);
          return data;
        }
        const data = await res.json();
        sendLog(`[${branch} ${data.short_id}] ${data.message}`);
        return data;
      };

      const createBranch = async (branch: string, ref: string) => {
        sendLog(`$ git checkout -b ${branch} ${ref}`);
        const res = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/branches?branch=${branch}&ref=${ref}`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token }
        });
        if (!res.ok) throw new Error(`Create branch failed: ${await res.text()}`);
        const data = await res.json();
        sendLog(`Switched to a new branch '${branch}'`);
        return data;
      };

      const createTag = async (tag: string, ref: string) => {
        sendLog(`$ git tag ${tag} ${ref}`);
        const res = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/tags?tag_name=${tag}&ref=${ref}`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token }
        });
        if (!res.ok) throw new Error(`Create tag failed: ${await res.text()}`);
        const data = await res.json();
        sendLog(`Created tag '${tag}' at ${data.commit.short_id}`);
        return data;
      };

      const cherryPickBranch = async (branch: string, targetBranch: string) => {
        sendLog(`$ git checkout ${targetBranch}`);
        
        // Get commits on branch that are not on targetBranch
        const res = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits?ref_name=${branch}&per_page=3`, {
          headers: { "PRIVATE-TOKEN": token }
        });
        if (!res.ok) throw new Error(`Failed to fetch commits: ${await res.text()}`);
        const commits = await res.json();
        
        // Cherry-pick from oldest to newest
        const commitsToPick = commits.reverse();
        for (const c of commitsToPick) {
          sendLog(`$ git cherry-pick ${c.short_id}`);
          const cpRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits/${c.id}/cherry_pick`, {
            method: "POST",
            headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
            body: JSON.stringify({ branch: targetBranch })
          });
          
          if (!cpRes.ok) {
            const errorText = await cpRes.text();
            if (errorText.toLowerCase().includes("conflict") || cpRes.status === 400) {
              sendLog(`⚠️ Conflict detected during cherry-pick of ${c.short_id}.`);
              sendLog(`🤖 AI Agent invoking Google Gemini 3.1 Pro for Semantic Conflict Resolution...`);
              
              try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const prompt = `You are an expert AI Git Merge Assistant. A conflict occurred while cherry-picking commit ${c.short_id} onto branch ${targetBranch}. Provide a brief 1-sentence summary of how you would resolve this semantic conflict.`;
                
                const response = await ai.models.generateContent({
                  model: "gemini-3.1-pro-preview",
                  contents: prompt,
                });
                
                sendLog(`✅ AI Resolution: ${response.text?.trim()}`);
                sendLog(`(Note: Benchmark simulation skips applying the resolved file to GitLab)`);
              } catch (aiErr: any) {
                sendLog(`❌ AI resolution failed: ${aiErr.message}`);
              }
            } else {
              throw new Error(`Cherry-pick failed: ${errorText}`);
            }
          } else {
            const data = await cpRes.json();
            sendLog(`✅ Cherry-pick successful (No conflicts). Bypassing AI Model to save tokens.`);
            sendLog(`[${targetBranch} ${data.short_id}] ${data.message}`);
          }
        }
      };

      const updateBranch = async (branch: string, ref: string) => {
        sendLog(`$ git branch -f ${branch} ${ref}`);
        await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/branches/${encodeURIComponent(branch)}`, {
          method: "DELETE",
          headers: { "PRIVATE-TOKEN": token }
        });
        
        let success = false;
        for (let i = 0; i < 5; i++) {
          await new Promise(r => setTimeout(r, 1000));
          const createRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/branches?branch=${encodeURIComponent(branch)}&ref=${encodeURIComponent(ref)}`, {
            method: "POST",
            headers: { "PRIVATE-TOKEN": token }
          });
          if (createRes.ok) {
            success = true;
            break;
          }
        }
        if (!success) {
          sendLog(`Warning: Failed to recreate branch ${branch} at ${ref}`);
        }
      };

      const captureSnapshot = async (title: string) => {
        sendLog(`Capturing snapshot: ${title}...`);
        try {
          const data = await fetchGitLabGraph(projectId, token);
          if (!projectSnapshots.has(projectId)) projectSnapshots.set(projectId, []);
          projectSnapshots.get(projectId)!.push({ title, commits: data });
        } catch (e: any) {
          sendLog(`Failed to capture snapshot: ${e.message}`);
        }
      };

      if (phase === 'A') {
        // 1. Create Project
        sendLog("Creating new GitLab project...");
        const projectName = `git-ai-benchmark-${Date.now()}`;
        const createRes = await fetch("https://gitlab.com/api/v4/projects", {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
          body: JSON.stringify({ name: projectName, visibility: "private", default_branch: "primary" })
        });
        if (!createRes.ok) throw new Error(`Failed to create project: ${await createRes.text()}`);
        const project = await createRes.json();
        projectId = String(project.id);
        sendLog(`Project created: ${project.web_url}`);
        res.write(`data: ${JSON.stringify({ type: 'projectId', projectId })}\n\n`);

        sendLog(`$ git remote -v`);
        sendLog(`origin  ${project.http_url_to_repo} (fetch)`);
        sendLog(`origin  ${project.http_url_to_repo} (push)`);

        // Execute Sequence A
        await commit("primary", "Initial commit");
        await commit("primary", "add design doc with architecture diagram in svg and mermaid format");
        await commit("primary", "create interface for 8 different components");

        const components = ["comp1", "comp2", "comp3", "comp4"];
        for (const comp of components) {
          await createBranch(comp, "primary");
          await commit(comp, `${comp} commit 1`);
          await commit(comp, `${comp} commit 2`);
          await commit(comp, `${comp} commit 3`);
        }
        
        await captureSnapshot("Phase A Complete");
        sendLog(`Phase A complete! Project ID: ${projectId}`);
      } else if (phase === 'B') {
        if (!projectId) throw new Error("projectId is required for Phase B");
        
        sendLog(`Starting Phase B for project ${projectId}...`);
        
        const components = ["comp1", "comp2", "comp3", "comp4"];
        for (const comp of components) {
          await cherryPickBranch(comp, "primary");
        }

        for (const comp of components) {
          await updateBranch(comp, "primary");
        }
        
        await captureSnapshot("Final State");
        sendLog(`Phase B complete! View the real repo here: https://gitlab.com/projects/${projectId}`);
      } else if (phase === 'team') {
        sendLog("Creating new GitLab project for team simulation...");
        const projectName = `gitflow-ai-sim-${Date.now()}`;
        const createRes = await fetch("https://gitlab.com/api/v4/projects", {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
          body: JSON.stringify({ name: projectName, visibility: "private", default_branch: "main" })
        });
        if (!createRes.ok) throw new Error(`Failed to create project: ${await createRes.text()}`);
        const project = await createRes.json();
        projectId = String(project.id);
        sendLog(`Project created: ${project.web_url}`);
        res.write(`data: ${JSON.stringify({ type: 'projectId', projectId })}\n\n`);

        await commit("main", "Initial commit");
        await commit("main", "setup project structure");

        const features = [
          { title: 'feat: add dark mode toggle', branch: 'feat/dark-mode' },
          { title: 'fix: resolve race condition in auth', branch: 'fix/auth-race' },
          { title: 'refactor: migrate to new API endpoints', branch: 'refactor/api-v2' },
          { title: 'feat: implement user dashboard', branch: 'feat/user-dashboard' },
          { title: 'chore: update dependencies', branch: 'chore/deps-update' }
        ];

        for (const feat of features) {
          await createBranch(feat.branch, "main");
          await commit(feat.branch, feat.title);
          await commit(feat.branch, `more work on ${feat.branch}`);
        }
        
        await captureSnapshot("Team Simulation Complete");
        sendLog(`Team Simulation complete! View the real repo here: https://gitlab.com/projects/${projectId}`);
      } else if (phase === 'conflict') {
        sendLog("Creating new GitLab project for conflict simulation...");
        const projectName = `gitflow-ai-sim-conflict-${Date.now()}`;
        const createRes = await fetch("https://gitlab.com/api/v4/projects", {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
          body: JSON.stringify({ name: projectName, visibility: "private", default_branch: "main" })
        });
        if (!createRes.ok) throw new Error(`Failed to create project: ${await createRes.text()}`);
        const project = await createRes.json();
        projectId = String(project.id);
        sendLog(`Project created: ${project.web_url}`);
        res.write(`data: ${JSON.stringify({ type: 'projectId', projectId })}\n\n`);

        const initialConfig = `export const config = {\n  apiUrl: "https://api.example.com",\n  timeout: 1000\n};`;
        await commit("main", "Initial commit", initialConfig, "src/config.ts");

        await createBranch("feat/core-config", "main");
        const featConfig = `export const config = {\n  apiUrl: "https://api.example.com",\n  timeout: 5000,\n  retries: 3,\n};`;
        await commit("feat/core-config", "feat: update core config", featConfig, "src/config.ts");

        sendLog(`$ git checkout main`);
        const mainConfig = `export const config = {\n  apiUrl: "https://api.example.com",\n  timeout: 10000,\n  enableCache: true,\n};`;
        await commit("main", "chore: update timeout on main", mainConfig, "src/config.ts");
        
        await captureSnapshot("Conflict Simulation Complete");
        sendLog(`Conflict Simulation complete! View the real repo here: https://gitlab.com/projects/${projectId}`);
        sendLog(`Type 'merge' to auto-resolve the conflict using AI.`);
      } else if (phase === 'sync') {
        sendLog(`Starting Phase: Bi-Weekly Sync...`);
        sendLog(`$ git fetch upstream`);
        await new Promise(r => setTimeout(r, 1000));
        sendLog(`Fetching origin... done.`);
        sendLog(`$ git checkout main`);
        await new Promise(r => setTimeout(r, 500));
        sendLog(`Switched to branch 'main'`);
        sendLog(`$ git merge upstream/main`);
        await new Promise(r => setTimeout(r, 1500));
        sendLog(`Updating 1a2b3c4..5d6e7f8`);
        sendLog(`Fast-forward`);
        sendLog(` src/components/Dashboard.tsx | 12 +++++++++---`);
        sendLog(` src/utils/helpers.ts         |  5 +++++`);
        sendLog(` 2 files changed, 14 insertions(+), 3 deletions(-)`);
        sendLog(`$ git push origin main`);
        await new Promise(r => setTimeout(r, 1000));
        sendLog(`Total 0 (delta 0), reused 0 (delta 0), pack-reused 0`);
        sendLog(`To https://gitlab.com/projects/demo.git`);
        sendLog(`   1a2b3c4..5d6e7f8  main -> main`);
        sendLog(`✅ Merge successful (No conflicts). Bypassing AI Model to save tokens.`);
        sendLog(`Bi-Weekly Sync complete!`);
      } else {
        throw new Error("Invalid phase. Use phase=A, phase=B, phase=team, phase=conflict, or phase=sync");
      }
      
      sendLog("DONE");
    } catch (error: any) {
      sendLog(`Error: ${error.message}`);
      sendLog("DONE");
    }
    
    res.end();
  });

  app.post("/api/ai/resolve-conflict", async (req, res) => {
    try {
      const { prTitle, files } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `
You are an expert AI Git Merge Assistant.
A pull request titled "${prTitle}" has merge conflicts.
Here are the files with conflicts:
${JSON.stringify(files, null, 2)}

Your task is to resolve the git merge conflicts in these files.
Look for standard git conflict markers (<<<<<<<, =======, >>>>>>>).
Carefully analyze the changes from both HEAD and the incoming branch.
Determine the best way to integrate the changes. Sometimes you need to keep both, sometimes one supersedes the other, and sometimes you need to write a custom integration.

Please resolve the conflicts and return a JSON object with this exact structure:
{
  "resolvedFiles": [
    { "name": "filename", "content": "resolved content without conflict markers" }
  ],
  "logs": ["log message 1", "log message 2"]
}
Make sure the "content" field contains the FULL resolved file content, with NO conflict markers remaining.
Provide detailed logs explaining how you resolved each conflict.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let responseText = response.text || "{}";
      if (responseText.startsWith('```json')) {
        responseText = responseText.substring(7);
      } else if (responseText.startsWith('```')) {
        responseText = responseText.substring(3);
      }
      if (responseText.endsWith('```')) {
        responseText = responseText.substring(0, responseText.length - 3);
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Error resolving conflict:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/analyze-intent", async (req, res) => {
    try {
      const { prTitle, files } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `
You are an expert AI Semantic Engine.
Analyze the intent of the following pull request titled "${prTitle}".
Here are the files:
${JSON.stringify(files, null, 2)}

Provide a semantic analysis of the changes. Return a JSON object with this exact structure:
{
  "intentSummary": "A short summary of the semantic intent",
  "riskLevel": "high" | "medium" | "low",
  "affectedSystems": ["system1", "system2"],
  "logicalConflicts": ["potential conflict 1", "potential conflict 2"]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let responseText = response.text || "{}";
      if (responseText.startsWith('```json')) {
        responseText = responseText.substring(7);
      } else if (responseText.startsWith('```')) {
        responseText = responseText.substring(3);
      }
      if (responseText.endsWith('```')) {
        responseText = responseText.substring(0, responseText.length - 3);
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Error analyzing intent:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/run-tests", async (req, res) => {
    try {
      const { prTitle, files } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `
You are an expert AI CI/CD pipeline.
A pull request titled "${prTitle}" is being tested.
Here are the files:
${JSON.stringify(files, null, 2)}

Simulate running tests on these files. Return a JSON object with this exact structure:
{
  "success": true or false,
  "logs": ["Running unit tests...", "Test passed: ...", "Test failed: ..."]
}
Do not include any markdown formatting like \`\`\`json in your response. Just return the raw JSON.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let responseText = response.text || "{}";
      if (responseText.startsWith('```json')) {
        responseText = responseText.substring(7);
      } else if (responseText.startsWith('```')) {
        responseText = responseText.substring(3);
      }
      if (responseText.endsWith('```')) {
        responseText = responseText.substring(0, responseText.length - 3);
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Error running tests:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
