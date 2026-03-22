# GitFlow AI - Pitch Deck

## Slide 1: The GitOps Native AI Merge Queue
**GitFlow AI**
*Automating the Software Development Lifecycle with Google Gemini 3.1 Pro.*

---

## Slide 2: The Problem
**Merge Conflicts & Broken Builds Cost Millions**
- **Manual Toil:** Developers spend hours resolving complex merge conflicts.
- **Queue Bottlenecks:** Large teams struggle to safely merge multiple PRs without breaking the main branch.
- **Lost Context:** Code reviews often lack the original "intent" behind the code.
- **Infrastructure Overhead:** Traditional merge queue tools require complex, centralized databases and dedicated servers.

---

## Slide 3: The Solution
**Dual-Model AI Orchestration**
GitFlow AI acts as an intelligent "traffic controller" using two distinct AI phases:
- **Phase 1: Auto-Resolution:** The first model reads PRs, understands the *why*, and intelligently combines divergent code paths during a cherry-pick.
- **Phase 2: Audit & Verify:** A second, independent model audits the final merged file, verifies the conflict was correctly resolved, and generates a Confidence Score.
- **The 95/5 Rule:** 95% of conflicts are auto-resolved. For the 5% that score low, the queue auto-pauses for human intervention.

---

## Slide 4: The Innovation - 100% GitOps
**No Central Database Required.**
We use the Git repository itself as the source of truth.
- **The State Branch:** The entire AI merge queue state is stored in a hidden, orphaned branch (`gitflow-ai-state`).
- **Zero Infrastructure:** When a developer runs `git-ai queue add`, the CLI uses Git plumbing commands to update the state directly in the repository.
- **Built-in RBAC:** Because it uses Git, it perfectly respects your existing repository permissions and access controls.

---

## Slide 5: Enterprise-Grade Audit Trail
**The `gitflow-audit` Repository**
To prevent the main repository from being bloated by high-frequency updates, we introduced a dedicated audit repository.
- **Conflict Artifacts:** When a conflict occurs, File A, File B, the AI model parameters, and the final merged file are all saved to the audit repo for perfect traceability.
- **Immutable Logs:** Every AI decision, conflict resolution, and queue modification is committed as a JSON log entry.
- **Context Sync:** The developer's conversational history with the AI is synced to `gitflow-audit/<username>/context.json`.
- **High-Speed Local Cache:** A local SQLite database acts purely as a fast cache, ensuring the CLI remains lightning-fast.

---

## Slide 6: Security & Privacy
**Bring Your Own Keys. Run Locally.**
- **Private Networks:** The CLI and Dashboard can run entirely locally behind corporate firewalls.
- **Data Flow:** Source code only flows between your local machine, your Git Provider (GitHub/GitLab), and the Gemini API.
- **No Central Storage:** Your code and API keys are never stored on our servers.

---

## Slide 7: Call to Action
**Try the GitFlow AI CLI Today**
1. Clone the repository.
2. Run `npm run dev`.
3. Open the **CLI Terminal** tab and run `git-ai benchmark` to see the GitOps State Branch and `gitflow-audit` sync in action!
