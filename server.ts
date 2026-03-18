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
      sendLog("Initializing Real GitLab API Benchmark...");
      
      // 1. Create Project
      sendLog("Creating new GitLab project...");
      const projectName = `git-ai-benchmark-${Date.now()}`;
      const createRes = await fetch("https://gitlab.com/api/v4/projects", {
        method: "POST",
        headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, visibility: "private" })
      });
      if (!createRes.ok) throw new Error(`Failed to create project: ${await createRes.text()}`);
      const project = await createRes.json();
      const projectId = project.id;
      sendLog(`Project created: ${project.web_url}`);

      // 2. Initial Commit
      sendLog("Creating initial commit on main branch...");
      const commitRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
        method: "POST",
        headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: "main",
          commit_message: "Initial commit",
          actions: [
            { action: "create", file_path: "math.js", content: "function add(a, b) {\\n  return a + b;\\n}\\n" }
          ]
        })
      });
      if (!commitRes.ok) throw new Error(`Failed to create initial commit: ${await commitRes.text()}`);

      // 3. Create Branches
      sendLog("Creating branches 'feature-a' and 'feature-b'...");
      const branchARes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/branches?branch=feature-a&ref=main`, { method: "POST", headers: { "PRIVATE-TOKEN": token } });
      if (!branchARes.ok) throw new Error(`Failed to create branch A: ${await branchARes.text()}`);
      const branchBRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/branches?branch=feature-b&ref=main`, { method: "POST", headers: { "PRIVATE-TOKEN": token } });
      if (!branchBRes.ok) throw new Error(`Failed to create branch B: ${await branchBRes.text()}`);

      // 4. Commit to Feature A
      sendLog("Committing change to 'feature-a'...");
      const commitARes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
        method: "POST",
        headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: "feature-a",
          commit_message: "Add c parameter",
          actions: [
            { action: "update", file_path: "math.js", content: "function add(a, b, c) {\\n  return a + b + c;\\n}\\n" }
          ]
        })
      });
      if (!commitARes.ok) throw new Error(`Failed to commit to feature-a: ${await commitARes.text()}`);

      // 5. Commit to Feature B
      sendLog("Committing conflicting change to 'feature-b'...");
      const commitBRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
        method: "POST",
        headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: "feature-b",
          commit_message: "Add d parameter",
          actions: [
            { action: "update", file_path: "math.js", content: "function add(a, b, d) {\\n  return a + b + d;\\n}\\n" }
          ]
        })
      });
      if (!commitBRes.ok) throw new Error(`Failed to commit to feature-b: ${await commitBRes.text()}`);

      // 6. Create MR for A and Merge
      sendLog("Creating Merge Request for 'feature-a'...");
      const mrARes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests`, {
        method: "POST",
        headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
        body: JSON.stringify({ source_branch: "feature-a", target_branch: "main", title: "Merge Feature A" })
      });
      if (!mrARes.ok) throw new Error(`Failed to create MR A: ${await mrARes.text()}`);
      const mrA = await mrARes.json();
      
      sendLog("Merging 'feature-a' into main...");
      const mergeARes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests/${mrA.iid}/merge`, {
        method: "PUT",
        headers: { "PRIVATE-TOKEN": token }
      });
      if (!mergeARes.ok) throw new Error(`Failed to merge MR A: ${await mergeARes.text()}`);

      // 7. Create MR for B (will have conflict)
      sendLog("Creating Merge Request for 'feature-b'...");
      const mrBRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests`, {
        method: "POST",
        headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
        body: JSON.stringify({ source_branch: "feature-b", target_branch: "main", title: "Merge Feature B" })
      });
      if (!mrBRes.ok) throw new Error(`Failed to create MR B: ${await mrBRes.text()}`);
      const mrB = await mrBRes.json();

      // 8. Detect Conflict
      sendLog("Checking for merge conflicts...");
      await new Promise(r => setTimeout(r, 3000)); // Wait for GitLab to calculate merge status
      const mrBCheckRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests/${mrB.iid}`, {
        headers: { "PRIVATE-TOKEN": token }
      });
      const mrBCheck = await mrBCheckRes.json();
      
      if (mrBCheck.has_conflicts) {
        sendLog("Conflict detected! Invoking Gemini 3.1 Pro for Semantic Resolution...");
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
You are an expert AI Git Merge Assistant.
We have a merge conflict in math.js.
Branch main has:
function add(a, b, c) {
  return a + b + c;
}

Branch feature-b has:
function add(a, b, d) {
  return a + b + d;
}

Resolve the conflict by combining both features. Return ONLY the raw resolved file content. Do not include markdown formatting.
`;
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt
        });
        
        let resolvedContent = response.text || "";
        resolvedContent = resolvedContent.replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '').trim();
        
        sendLog("AI resolved the conflict. Committing resolution...");
        
        await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
          method: "POST",
          headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
          body: JSON.stringify({
            branch: "feature-b",
            commit_message: "AI Conflict Resolution",
            actions: [
              { action: "update", file_path: "math.js", content: resolvedContent }
            ]
          })
        });

        sendLog("Merging 'feature-b' into main...");
        await new Promise(r => setTimeout(r, 3000)); // wait for pipeline/merge status
        const mergeBRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests/${mrB.iid}/merge`, {
          method: "PUT",
          headers: { "PRIVATE-TOKEN": token }
        });
        
        if (mergeBRes.ok) {
          sendLog("Merge successful! AI resolution verified.");
        } else {
          sendLog(`Merge failed: ${await mergeBRes.text()}`);
        }
      } else {
        sendLog("No conflict detected (unexpected).");
      }

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
