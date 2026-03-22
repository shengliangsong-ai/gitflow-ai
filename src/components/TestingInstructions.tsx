import React from 'react';
import Markdown from 'react-markdown';
import Mermaid from './Mermaid';

const markdownContent = `
## 🧪 Testing Instructions

Welcome to the GitFlow AI demo! Our application is designed to be fully verifiable. You can test the core functionality directly through the web interface.

\`\`\`mermaid
graph TD
    A[Start: Open App] --> B[Explore Dashboard & UI]
    B --> C[Play AI Pitch]
    C --> D[Run Live GitHub Sync]
    D --> E[Start Phase A: Devs push code]
    E --> F[Start Phase B: Merge & Conflict]
    F --> G{GitFlow AI Queue}
    G -->|Semantic Resolution| H[Merge Success]
    H --> I[Test Built-in Benchmark]
    I --> J[Test Local CLI]
    
    classDef default fill:#18181b,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef ai fill:#18181b,stroke:#f59e0b,stroke-width:2px,color:#fff;
    class G ai;
\`\`\`

### Prerequisites
*   A modern web browser (Chrome, Firefox, Safari, Edge).
*   Ensure your browser allows audio playback if you wish to test the "Play AI Pitch" feature.

### Step 1: Explore the Dashboard & UI
1.  **Open the Application:** Navigate to the provided App URL.
2.  **Navigation:** Use the top navigation bar to click through the different tabs: **Dashboard**, **CLI Terminal**, **Local CLI**, **Architecture**, **Benchmark**, **Pitch**, and **Testing**.
3.  **Dashboard View:** On the Dashboard, observe the layout for Active PRs, Merge Queue, and Recent Activity. (These will populate during the demo).

### Step 2: Test the "Play AI Pitch"
1.  Navigate to the **Pitch** tab.
2.  Click the **"Play AI Pitch"** button.
3.  **Verify:** The application should automatically advance through the presentation slides while playing an AI-generated voiceover explaining the project. 
4.  *Note: You can pause or stop the pitch at any time using the provided controls.*

### Step 3: Run the Live GitHub Sync & AI Merge Demo
This is the core demonstration of our technology. We will simulate a real-world scenario where multiple developers push conflicting code.

1.  **Start the Sync:** In the top navigation bar, click the **"Sync GitHub"** button.
    *   *What's happening:* The backend is actively cloning our real GitHub repository and syncing it to a GitLab instance.
2.  **Watch the Terminal:** The UI will automatically switch to the **CLI Terminal** tab. Watch the terminal output as it logs the sync progress.
3.  **Observe the Git Graph:** On the right side of the CLI Terminal, you will see the **Live Git Graph** begin to populate with commits in real-time.
4.  **Start Phase A (Dev):** Once the sync is complete, click the **"Start Phase A (Dev)"** button below the terminal.
    *   *What's happening:* The system simulates two developers creating separate feature branches and making conflicting changes to the same files.
5.  **Start Phase B (Merge):** After Phase A completes, click the **"Start Phase B (Merge)"** button.
    *   *What's happening:* The system attempts to merge both branches into \`main\`. A merge conflict will occur.
6.  **Watch the AI Resolve:** Pay close attention to the terminal output. You will see the system detect the conflict, pause, and hand the conflict over to the GitFlow AI Queue. The AI will analyze the AST, resolve the conflict semantically, and complete the merge automatically.
7.  **Verify the Graph:** Look at the Live Git Graph to confirm that the branches have been successfully merged into \`main\`.

### Step 4: Test the Built-in Benchmark
1.  Navigate to the **Benchmark** tab.
2.  This tab provides documentation on how the \`git-ai benchmark\` command works.
3.  To run the benchmark, navigate to the **CLI Terminal** tab.
4.  Type \`git-ai benchmark\` and press Enter.
5.  Watch the live Server-Sent Events (SSE) stream as the system orchestrates a real GitLab repository, simulates developer activity, generates a conflict, and resolves it using Gemini 3.1 Pro.

### Step 5: Test the Local CLI (Optional/Informational)
1.  Navigate to the **Local CLI** tab.
2.  This tab provides documentation and interactive examples of how a developer would use the \`git-ai\` tool on their local machine.
3.  Click through the simulated commands (e.g., \`git-ai commit\`, \`git-ai push\`, \`git-ai benchmark\`) to see how the local CLI intercepts standard Git commands to provide AI feedback before code is pushed to the queue.

### Troubleshooting
*   **Sync Fails:** If the "Sync GitHub" process fails or hangs, click the **"Reset Demo"** button in the CLI Terminal tab and try again.
*   **No Audio:** If the AI Pitch has no audio, ensure your browser tab is not muted and that you have interacted with the page (some browsers block autoplay audio until the user clicks somewhere on the page).
`;

export default function TestingInstructions() {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-xl">
      <div className="prose prose-invert max-w-none prose-indigo">
        <Markdown
          components={{
            code(props: any) {
              const {children, className, node, ...rest} = props;
              const match = /language-(\w+)/.exec(className || '');
              if (match && match[1] === 'mermaid') {
                return <Mermaid chart={String(children).replace(/\n$/, '')} />;
              }
              return <code {...rest} className={className}>{children}</code>;
            }
          }}
        >
          {markdownContent}
        </Markdown>
      </div>
    </div>
  );
}
