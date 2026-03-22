# GitFlow AI (Approach B) - Design Document

## 1. Overview
GitFlow AI is an intelligent orchestrator designed to automate the Software Development Lifecycle (SDLC) by resolving merge conflicts and managing merge queues using Google's Gemini 3.1 Pro model. This document outlines the architecture and design decisions for "Approach B", a highly visual, dashboard-driven implementation, combined with a GitOps-based standalone CLI.

## 2. Architecture
The application is built as a modern web application with the following stack:
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Express.js (Node.js)
- **Database/State:** Firebase Firestore (for real-time dashboard state) and GitOps State Branch (for CLI queue state)
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Git Integration:** GitHub/GitLab API

### 2.1 Core Components
1. **Dashboard:** The central hub displaying the Git Tree View, Workflow Actions, and the AI Merge Queue.
2. **AI Merge Queue:** A real-time staging area for incoming Pull Requests. It performs Semantic Intent Analysis on every PR.
3. **Git Tree View:** A visual representation of branches and commits, updating in real-time as the AI merges code.
4. **Interactive CLI Terminal:** A built-in terminal for running benchmark simulations (`benchmark team`, `benchmark conflict`).
5. **Standalone CLI (`git-ai`):** A local CLI tool that intercepts git commands and manages the AI queue using a GitOps approach.

## 3. Key Workflows

### 3.1 Semantic Intent Analysis
When a PR enters the queue, the system sends the code diffs to Gemini to determine the developer's intent.
- **Input:** PR Title, Code Diffs (Added/Removed lines).
- **Output:** A JSON object containing a summary of the intent, affected systems, logical conflicts, and a risk level (low, medium, high).
- **Action:** If the risk is low and there are no conflicts, the PR is automatically merged.

### 3.2 AI Conflict Resolution
When a Git merge conflict is detected (e.g., `<<<<<<< HEAD`), the system intervenes.
- **Detection:** The backend identifies conflict markers in the files.
- **Resolution:** Gemini analyzes both versions of the code, understands the semantic intent of both developers, and generates a unified, resolved file.
- **Commit:** The resolved file is committed back to the repository, and the PR is merged.

### 3.3 GitOps Queue State Management
The CLI manages the queue state directly in the user's repository without requiring a central database.
- **State Branch:** The queue state is stored as a `queue.json` file in a hidden, orphaned branch named `gitflow-ai-state`.
- **Operations:** When a user runs `git-ai queue add` or `git-ai queue create`, the CLI uses the GitHub/GitLab API to fetch the `queue.json` file, updates the JSON array, and commits the change back to the `gitflow-ai-state` branch.

### 3.4 Audit & Context Management (`gitflow-audit` repo)
To solve the limitations of high-frequency updates and provide a robust historical audit trail, all AI operations and conversation contexts are stored in a dedicated, separate repository named `gitflow-audit`.
- **Audit Trail:** Every AI action (queue changes, conflict resolutions, code reviews) is committed as a JSON log entry to the `gitflow-audit` repository. This provides an enterprise-grade, immutable audit log.
- **Context & Parameters:** The AI model's parameters, prompts, and raw responses are saved alongside the developer's conversation history (`context.json`).
- **Conflict Artifacts:** When a merge conflict occurs between File A and File B, both original files, the AI's parameters, and the final AI-generated merged file are checked into the audit repo. This allows for perfect traceability of how a conflict was resolved.
- **Local Cache:** The local SQLite database (`~/.git-ai-context.db`) is no longer a strict requirement. It now acts purely as a high-speed local cache for the `gitflow-audit` repository, ensuring fast CLI responses while maintaining the remote repo as the single source of truth.

### 3.5 Confidence Scoring & Human Fallback (95/5 Rule)
GitFlow AI aims to automatically resolve 95% of merge conflicts using a **Dual-Model Architecture**. For the remaining 5% of highly complex or ambiguous conflicts, the system relies on a Human-in-the-Loop fallback mechanism.
- **Phase 1 (Resolution):** The first model auto-resolves the conflict during the cherry-pick or merge process.
- **Phase 2 (Audit & Verify):** A second, independent model acts as an auditor. It verifies the final commit file against the original conflicting files (File A and File B) to ensure it indeed fixes the conflict issues and generates an audit score.
- **Auto-Pause / Revert:** If the Confidence Score falls below a defined threshold (e.g., < 0.85), the CLI will automatically **pause the AI merge queue** (or revert the cherry-pick and move to the next item in the queue).
- **Human Intervention:** The system alerts the engineering team that human intervention is required to manually resolve the specific conflict before the queue can resume.

## 4. Security & Privacy
- **Local Execution:** The application can be run entirely locally on a private company network.
- **API Keys:** Users provide their own Gemini API Key and GitHub/GitLab Token via environment variables (`.env`) or local config (`~/.git-ai.json`). Keys are never stored centrally.
- **Data Flow:** Source code only flows between the local server/CLI, the Git Provider API, and the Gemini API.

## 5. Future Roadmap
- **Multi-Repository Support:** Scaling the dashboard to manage multiple repositories simultaneously.
- **Advanced Code Review:** Adding inline AI comments for code quality and security vulnerabilities.
- **Custom AI Personas:** Allowing teams to define specific coding standards that the AI must enforce during merges.
