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
- **Benefits:** This provides a free, built-in audit log of every queue change, perfectly respects the repository's existing access permissions, and allows the CLI to function entirely standalone.

## 4. Security & Privacy
- **Local Execution:** The application can be run entirely locally on a private company network.
- **API Keys:** Users provide their own Gemini API Key and GitHub/GitLab Token via environment variables (`.env`) or local config (`~/.git-ai.json`). Keys are never stored centrally.
- **Data Flow:** Source code only flows between the local server/CLI, the Git Provider API, and the Gemini API.

## 5. Future Roadmap
- **Multi-Repository Support:** Scaling the dashboard to manage multiple repositories simultaneously.
- **Advanced Code Review:** Adding inline AI comments for code quality and security vulnerabilities.
- **Custom AI Personas:** Allowing teams to define specific coding standards that the AI must enforce during merges.
