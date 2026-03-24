# GitFlow AI - Hackathon Pitch

## Slide 1: The Problem - Broken Main Branches
In fast-moving engineering teams, the **sync queue bottleneck** is real.
- Developers push code that passes locally but breaks when integrated.
- Manual code reviews take hours or days.
- Resolving complex rebase conflicts wastes valuable engineering time.
**Result:** Slower velocity, frustrated developers, and broken builds.

## Slide 2: The Solution - AI GitFlow
**AI GitFlow** is a hybrid local-cloud tool that injects AI directly into the developer's daily workflow.
- **Local CLI:** Intercepts standard git commands to provide instant AI feedback before code ever leaves the machine.
- **Cloud Queue:** A global, intelligent merge queue that automatically tests combinations of PRs before merging.

## Slide 3: Key Features & Demo Highlights
- `git-ai commit`: Analyzes staged files locally. Catches bugs before the commit is created.
- `git-ai push`: Pushes code and automatically registers it with the global GitFlow AI Queue.
- `git-ai rebase`: AI monitors the rebase process and suggests resolutions for conflicts.
- **GitLab SDK Integration:** Track CLI commands and dashboard usage (Note: Analytics currently disabled).

## Slide 4: Dual-Model Semantic Orchestration
Moving beyond basic CI/CD with a **Dual-Model Architecture**.
- **Token Optimization:** Bypasses AI for clean cherry-picks; only invokes Gemini for semantic conflict resolution.
- **Decoupled Review:** Manual auditing via `git-ai review <range>`, separate from the sync workflow.
- **Model 2 (Audit & Verify):** Independently audits the final file, verifies the fix, and generates a Confidence Score.
- **100% Traceability:** All `git-ai` operations are traceable in the `gitflow-audit` repo.

## Slide 5: 100% GitOps & Full Traceability
Our architecture is 100% GitOps native.
- No central database.
- Merge queue state stored in a hidden `gitflow-ai-state` branch.
- Every decision, conflict artifact, and conversation context is synced to the `gitflow-audit` repository.

## Slide 6: Verifiable Trust - Built-in Benchmarks
Don't just take our word for it. Prove it yourself with **Built-in Benchmarks**.
- `git-ai benchmark`: Automated self-tests simulating complex, real-world merge conflicts locally.
- Semantic verification of everything from line collisions to deep refactoring.

## Slide 7: Why This Wins
We built a **seamless workflow integration**, not just a dashboard.
- **Zero Friction:** Developers keep their existing habits. Just type `git-ai` instead of `git`.
- **Real-time Sync:** CLI and Web Dashboard are always perfectly in sync.
- **Enterprise-Ready:** Built-in analytics and data-driven from day one.
