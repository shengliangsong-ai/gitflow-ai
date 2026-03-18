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
