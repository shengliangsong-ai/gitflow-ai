# GitFlow AI - Architecture

This document outlines the GitOps-native architecture of GitFlow AI, specifically detailing how the CLI, AI Engine, and Git repositories interact without requiring a centralized, traditional database.

## High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Local Environment
        Dev[Developer]
        CLI[GitFlow AI CLI]
        LocalRepo[(Local Git Repository)]
        LocalCache[(Local SQLite Cache)]
    end

    subgraph Remote Infrastructure
        MainRepo[(Main Repository: GitHub)]
        StateBranch([Branch: gitflow-ai-state])
        AuditRepo[(gitflow-audit Repository: GitLab)]
        Gemini[Google Gemini 3.1 Pro]
        Dashboard[Web Dashboard]
    end

    %% Developer Interactions
    Dev -->|Runs git-ai commands| CLI
    
    %% CLI to Local Repo
    CLI <-->|Reads/Commits Code| LocalRepo
    
    %% CLI to Remote Main Repo (State Branch)
    CLI -->|Fetches queue.json| StateBranch
    CLI -->|Commits updated queue.json| StateBranch
    LocalRepo -->|Pushes Code/PRs| MainRepo
    
    %% Sync Process
    MainRepo -->|Sync Git| AuditRepo
    
    %% CLI to Audit Repo
    CLI -->|Syncs Context & Logs| AuditRepo
    CLI <-->|Reads/Writes Fast Cache| LocalCache
    LocalCache -.->|Mirrors| AuditRepo
    
    %% CLI to AI
    CLI <-->|Sends Diffs / Gets Resolutions| Gemini
    
    %% Dashboard Interactions
    Dashboard <-->|Visualizes Queue| StateBranch
    Dashboard <-->|Reads Audit Logs| AuditRepo
    Dashboard <-->|Analyzes Intent| Gemini

    classDef repo fill:#f9f,stroke:#333,stroke-width:2px;
    classDef ai fill:#bbf,stroke:#333,stroke-width:2px;
    classDef cli fill:#bfb,stroke:#333,stroke-width:2px;
    
    class MainRepo,AuditRepo,LocalRepo repo;
    class Gemini ai;
    class CLI cli;
```

## Component Details

### 1. GitFlow AI CLI (`git-ai`)
The core engine running on the developer's machine. It intercepts standard Git commands (like `commit`, `push`, `rebase`) and injects AI analysis. It also provides custom commands (`queue`, `benchmark`) to manage the SDLC.

### 2. The State Branch (`gitflow-ai-state`)
Instead of a centralized PostgreSQL or MongoDB database, GitFlow AI uses **GitOps** to manage the merge queue.
- A hidden, orphaned branch named `gitflow-ai-state` lives in the main repository.
- It contains a single `queue.json` file.
- When a developer runs `git-ai queue add`, the CLI uses Git plumbing commands (`git mktree`, `git commit-tree`) to update this file and push the new state.
- **Benefit:** Free audit log, zero infrastructure overhead, and respects existing repository RBAC (Role-Based Access Control).

### 3. The Audit Repository (`gitflow-audit`)
To prevent the main repository from being bloated by high-frequency AI logs, all operational data is stored in a separate `gitflow-audit` repository.
- **Context & Parameters:** Stores the conversational history, AI model parameters, prompts, and raw responses (`context.json`).
- **Conflict Artifacts:** When a conflict occurs between File A and File B, both original files and the final AI-generated merged file are checked into the audit repo for traceability.
- **Audit Trail:** Logs every AI decision, conflict resolution, and queue modification.
- **Local Cache:** The CLI maintains a local SQLite database (`~/.git-ai-context.db`) as a high-speed cache, which asynchronously syncs to the remote `gitflow-audit` repo.

### 4. Dual-Model AI Engine (Google Gemini 3.1 Pro)
The intelligence layer utilizes two distinct model phases to ensure safety and accuracy:
- **Phase 1: Resolution Model:** Performs Semantic Intent Analysis to understand *why* code was written and intelligently combines divergent code paths during a cherry-pick or merge.
- **Phase 2: Audit & Verification Model:** An independent model evaluation that reviews the final AI-generated merged file against the original conflicting files (File A and File B). It verifies that the conflict was correctly resolved without introducing syntax or logical errors.
- **Confidence Scoring (95/5 Rule):** The Audit Model assigns a Confidence Score. If the score is low (representing the 5% of conflicts the AI cannot confidently resolve), the CLI automatically pauses the merge queue or reverts the cherry-pick, alerting a human developer to intervene.

### 5. Web Dashboard
A React-based frontend that provides a visual representation of the GitOps state. It reads the `queue.json` from the `gitflow-ai-state` branch and the logs from the `gitflow-audit` repo to display real-time metrics to engineering managers.
