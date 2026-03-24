# GitFlow AI - Design Document

## 1. Overview
GitFlow AI is a next-generation Git orchestration layer designed to eliminate "Merge Hell" and maintain a clean, linear history on primary branches. It leverages Large Language Models (Gemini 3.1 Pro) to semantically understand code changes and resolve logical conflicts that traditional Git tools cannot handle.

## 2. System Architecture

### 2.1 Component Diagram
The system consists of three main layers:
1.  **Local CLI (`git-ai`):** A wrapper around standard Git that provides local AI analysis and interacts with the GitOps state.
2.  **Cloud Orchestrator:** An Express-based backend that proxies Git provider APIs and invokes the Gemini Reasoning Engine.
3.  **GitOps State Layer:** Uses dedicated Git branches (`gitflow-ai-state`) and repositories (`gitflow-audit`) to store system state and audit logs, ensuring 100% traceability without a central database.

### 2.2 Data Flow
- **Commit Phase:** CLI intercepts `git commit`, sends diff to Gemini for bug detection and security review.
- **Sync Phase:** Orchestrator fetches commits from source (e.g., GitHub), attempts cherry-picks to target (e.g., GitLab), and invokes AI for semantic conflict resolution if line-based merging fails.
- **Merge Queue:** PRs are queued in `queue.json` on the `gitflow-ai-state` branch. The orchestrator processes them based on priority and dependency analysis.

## 3. Key Features

### 3.1 Semantic Conflict Resolution
Unlike standard Git which only sees line collisions, GitFlow AI understands the *intent* of the code. If one developer renames a function and another calls the old name, the AI detects the logical break and automatically updates the caller.

### 3.2 Advanced Merge Topologies
- **N-Way Star Merge:** Merges multiple feature branches into a single integration branch simultaneously.
- **Cascading Rebase:** Automatically rebases a chain of dependent PRs when the base branch moves.

### 3.3 100% Traceability
Every AI decision, conflict artifact, and conversation context is stored in the `gitflow-audit` repository. This provides an immutable, enterprise-grade audit log of all automated operations.

## 4. Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide React, Gitgraph.js.
- **Backend:** Node.js, Express, Google Generative AI SDK (Gemini 3.1 Pro).
- **CLI:** Node.js, SQLite (for local context caching).
- **Analytics:** GitLab Browser SDK.

## 5. Deployment & Security
- **Environment Variables:** All sensitive tokens (GitHub, GitLab, Gemini) are managed server-side.
- **Linear History:** The system enforces a "no merge commit" policy on the primary branch, preferring rebase and cherry-pick strategies to keep history clean.
