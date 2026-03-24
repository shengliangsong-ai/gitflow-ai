# GitFlow AI: Architecture Specification

## 1. Executive Summary
**GitFlow AI** is a next-generation orchestration layer designed to eliminate "Merge Hell" in large-scale engineering organizations. By leveraging the **Gemini 3.1 Pro** multimodal model, the system semantically understands code changes, automates complex sync topologies, and provides real-time conflict resolution strategies that go beyond simple line-diffing.

## 2. System Architecture

### 2.1 Component Overview
The architecture is built on a reactive, event-driven model bridging traditional Git providers and advanced AI reasoning.

- **Git Providers:** GitHub / GitLab integration via Webhooks and CLI.
- **GitFlow CLI:** Local engine handling analysis and GitOps state branch sync.
- **AI Reasoning Engine:** Powered by Gemini 3.1 Pro. Analyzes the intent of changes to resolve logical conflicts.
- **State Branch:** The `gitflow-ai-state` branch acts as the global queue coordinator, storing the merge queue state in `queue.json`.
- **Audit Repository:** The `gitflow-audit` repo stores immutable logs, conflict artifacts, and semantic reasoning context.
- **UI:** React / Vite Dashboard for Live Updates.

### 2.2 Data Flow
1. **Developer Action:** Runs `git-ai` commands.
2. **CLI Analysis:** Intercepts commands, performs local checks, and syncs with the `gitflow-ai-state` branch.
3. **AI Orchestration:** Gemini analyzes diffs for semantic intent and suggests resolutions for conflicts.
4. **Audit Logging:** All operations and decisions are synced to the `gitflow-audit` repository for 100% traceability.

## 3. Conflict Resolution Strategies
- **Prefer A:** Discard Target, Keep Source (Feature overrides).
- **Prefer B:** Discard Source, Keep Target (Hotfixes).
- **Keep Both:** Semantic Interleaving (Independent additions).
- **User Override:** Pause & Notify (High-risk logic changes).

## 4. Key Implementation Features
- **GitLab API Proxy:** Secure layer for GitLab API v4.
- **Live Topology Visualization:** Translates commit relationships into SVG/Canvas topology.
- **Binary Search Failure Isolation:** Isolates breaking PRs in O(log N) time.
- **Atomic Union Groups:** Merges dependent PRs atomically.
- **Semantic Intent Analysis:** Detects logical conflicts (e.g., variable renames).
