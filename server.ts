import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";

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
    // Fetch all commits
    const commitsRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits?all=true`, {
      headers: { "PRIVATE-TOKEN": token }
    });
    if (!commitsRes.ok) throw new Error(`Failed to fetch commits: ${await commitsRes.text()}`);
    const commits = await commitsRes.json();
    
    // Fetch all branches to map refs
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
    return commits.map((c: any) => ({
      hash: c.id,
      parents: c.parent_ids || [],
      subject: c.title,
      refs: commitRefs[c.id] || [],
      author: {
        name: c.author_name,
        email: c.author_email
      }
    }));
  };

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
      const projectId = project.id;
      sendLog(`Project created: ${project.web_url}`);
      res.write(`data: ${JSON.stringify({ type: 'projectId', projectId })}\n\n`);

      // Helper functions
      const commit = async (branch: string, message: string) => {
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
        return res.json();
      };

      const createBranch = async (branch: string, ref: string) => {
        const res = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/branches?branch=${branch}&ref=${ref}`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token }
        });
        if (!res.ok) throw new Error(`Create branch failed: ${await res.text()}`);
        return res.json();
      };

      const createTag = async (tag: string, ref: string) => {
        const res = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/tags?tag_name=${tag}&ref=${ref}`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token }
        });
        if (!res.ok) throw new Error(`Create tag failed: ${await res.text()}`);
        return res.json();
      };

      const mergeBranch = async (source: string, target: string) => {
        const mrRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
          body: JSON.stringify({ source_branch: source, target_branch: target, title: `Merge ${source} to ${target}`, remove_source_branch: false })
        });
        if (!mrRes.ok) throw new Error(`Create MR failed: ${await mrRes.text()}`);
        const mr = await mrRes.json();
        
        let mergeRes;
        for (let i = 0; i < 5; i++) {
          await new Promise(r => setTimeout(r, 2000));
          mergeRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests/${mr.iid}/merge`, {
            method: "PUT",
            headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
            body: JSON.stringify({ should_remove_source_branch: false })
          });
          if (mergeRes.ok) break;
        }
        if (!mergeRes || !mergeRes.ok) throw new Error(`Merge MR failed: ${await mergeRes?.text()}`);
        return mergeRes.json();
      };

      const cherryPick = async (sha: string, branch: string) => {
        const res = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits/${sha}/cherry_pick`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
          body: JSON.stringify({ branch })
        });
        if (!res.ok) throw new Error(`Cherry-pick failed: ${await res.text()}`);
        return res.json();
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

      // Execute Sequence
      sendLog("Creating initial commit on primary branch...");
      await commit("primary", "Initial commit");

      sendLog("Creating branches prjA and prjB...");
      await createBranch("prjA", "primary");
      await createBranch("prjB", "primary");

      sendLog("Adding commit to primary to ensure merge commits...");
      await commit("primary", "Primary commit 2");

      sendLog("Adding 2 commits to prjA...");
      await commit("prjA", "prjA commit 1");
      await commit("prjA", "prjA commit 2");

      sendLog("Adding 3 commits to prjB...");
      await commit("prjB", "prjB commit 1");
      await commit("prjB", "prjB commit 2");
      await commit("prjB", "prjB commit 3");
      
      await captureSnapshot("Before merge");

      sendLog("Tagging merge checkpoint 1...");
      await createTag("merge-checkpoint-1", "primary");

      sendLog("Merging prjA to primary branch...");
      await mergeBranch("prjA", "primary");
      
      await captureSnapshot("After merging prjA");
      
      sendLog("Merging prjB to primary branch...");
      await mergeBranch("prjB", "primary");

      await captureSnapshot("After merging prjB");

      sendLog("Adding 2 more commits {x,y} to prjA...");
      const commitX = await commit("prjA", "Commit X");
      const commitY = await commit("prjA", "Commit Y");

      sendLog("Adding 1 more commit {z} to prjB...");
      const commitZ = await commit("prjB", "Commit Z");

      sendLog("Cutting new-prjA and cherry-picking {x,y}...");
      await createBranch("new-prjA", "primary");
      await cherryPick(commitX.id, "new-prjA");
      await cherryPick(commitY.id, "new-prjA");

      sendLog("Cutting new-prjB and cherry-picking {z}...");
      await createBranch("new-prjB", "primary");
      await cherryPick(commitZ.id, "new-prjB");

      sendLog("Tagging merge checkpoint 2...");
      await createTag("merge-checkpoint-2", "primary");

      sendLog("Cutting final branches from primary...");
      await createBranch("final-prjA", "primary");
      await createBranch("final-prjB", "primary");
      
      await captureSnapshot("Final State");

      sendLog(`Benchmark complete! View the real repo here: ${project.web_url}`);
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
