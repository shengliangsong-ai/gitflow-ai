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
        timestamp: new Date(c.created_at).getTime() / 1000
      },
      committer: {
        name: c.committer_name,
        email: c.committer_email,
        timestamp: new Date(c.committed_date).getTime() / 1000
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
      
      // 1. Create or get GitLab project 'gitflow-ai'
      sendLog("Checking for existing 'gitflow-ai' project in GitLab...");
      const searchRes = await fetch(`https://gitlab.com/api/v4/projects?search=gitflow-ai&owned=true`, {
        headers: { "PRIVATE-TOKEN": token }
      });
      const searchData = await searchRes.json();
      
      let projectId;
      let gitlabRepoUrl;
      
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

      if (gitlabCommit && githubCommit && gitlabCommit === githubCommit) {
        sendLog(`Repositories are already in sync (Commit: ${gitlabCommit.substring(0, 7)}). Skipping clone.`);
        sendLog(`Successfully synced commits from GitHub to GitLab!`);
        sendLog("DONE");
        res.end();
        return;
      }

      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitflow-sync-'));
      sendLog(`Created temporary directory: ${tempDir}`);

      try {
        sendLog(`$ git clone <GITLAB_URL> .`);
        await execPromise(`git clone ${authUrl} .`, { cwd: tempDir });
        
        sendLog(`$ git remote add github <GITHUB_URL>`);
        await execPromise(`git remote add github ${githubRepoUrl}`, { cwd: tempDir });
        
        sendLog(`$ git fetch github`);
        await execPromise(`git fetch github`, { cwd: tempDir });

        const { stdout: branchOut } = await execPromise(`git branch`, { cwd: tempDir });
        const { stdout: remoteBranchOut } = await execPromise(`git branch -r`, { cwd: tempDir });
        const githubBranch = remoteBranchOut.includes('github/main') ? 'github/main' : 'github/master';

        if (!branchOut.includes('main') && !branchOut.includes('master')) {
            sendLog(`$ git checkout -b main ${githubBranch}`);
            await execPromise(`git checkout -b main ${githubBranch}`, { cwd: tempDir });
        } else {
            sendLog(`$ git cherry-pick ..${githubBranch}`);
            try {
                await execPromise(`git cherry-pick ..${githubBranch}`, { cwd: tempDir });
            } catch (cpErr: any) {
                sendLog(`Cherry-pick had conflicts or no new commits. Aborting cherry-pick.`);
                await execPromise(`git cherry-pick --abort`, { cwd: tempDir }).catch(() => {});
            }
        }

        sendLog(`$ git push origin HEAD:main`);
        await execPromise(`git push origin HEAD:main`, { cwd: tempDir });
        
        sendLog(`Successfully synced commits from GitHub to GitLab!`);
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
      const commit = async (branch: string, message: string) => {
        sendLog(`$ git checkout ${branch}`);
        sendLog(`$ git commit -m "${message}"`);
        const filename = `file_${Date.now()}_${Math.floor(Math.random()*10000)}.txt`;
        const res = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
          body: JSON.stringify({
            branch,
            commit_message: message,
            actions: [{ action: "create", file_path: filename, content: `Content for ${message}` }]
          })
        });
        if (!res.ok) throw new Error(`Commit failed: ${await res.text()}`);
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
          if (!cpRes.ok) throw new Error(`Cherry-pick failed: ${await cpRes.text()}`);
          const data = await cpRes.json();
          sendLog(`[${targetBranch} ${data.short_id}] ${data.message}`);
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
      } else {
        throw new Error("Invalid phase. Use phase=A or phase=B");
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

Please resolve the conflicts. Return a JSON object with this exact structure:
{
  "resolvedFiles": [
    { "name": "filename", "content": "resolved content without conflict markers" }
  ],
  "logs": ["log message 1", "log message 2"]
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

      const result = JSON.parse(response.text || "{}");
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

      const result = JSON.parse(response.text || "{}");
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

      const result = JSON.parse(response.text || "{}");
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
