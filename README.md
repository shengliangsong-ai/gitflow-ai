# GitFlow AI - GitLab AI Hackathon Submission

GitFlow AI is an advanced, AI-powered Git workflow simulator and auto-merging tool designed to streamline complex merge queues, resolve semantic conflicts, and automate the code integration process using Google's Gemini models and GitLab's API.

## Features
- **AI Merge Queue**: Automatically groups and merges PRs based on semantic intent.
- **Conflict Resolution**: Uses Gemini to analyze code intent and automatically resolve Git merge conflicts.
- **GitOps State Management**: Uses a hidden `gitflow-ai-state` branch to manage the queue state directly in the repository without a central database.
- **Enterprise Audit Trail**: Syncs all AI operations and conversation context to a dedicated `gitflow-audit` repository.
- **GitLab/GitHub Integration**: Syncs directly with repositories, creates branches, and commits resolved files.
- **Interactive CLI Terminal**: A built-in terminal to simulate team activity, trigger conflicts, and run AI auto-merges.
- **Live Architecture & Roadmap**: Visualizes the system architecture and future roadmap.

## 🏗️ Architecture

GitFlow AI uses a unique **GitOps-native architecture**. Instead of relying on a centralized database (like PostgreSQL or MongoDB) to manage the merge queue, it uses the Git repository itself as the source of truth.

1. **The State Branch:** The entire AI merge queue state is stored in a hidden, orphaned branch named `gitflow-ai-state`. When a developer runs `git-ai queue add`, the CLI uses Git plumbing commands to update a `queue.json` file directly in the repository.
2. **The Audit Repository:** To prevent the main repository from being bloated by high-frequency AI logs, all operational data and conversation contexts are stored in a separate `gitflow-audit` repository. The local SQLite database (`~/.git-ai-context.db`) acts purely as a high-speed local cache for this remote repository.

For more details, see the [ARCHITECTURE.md](ARCHITECTURE.md) and [PITCH.md](PITCH.md) files.

## 🚀 Hackathon Repositories & Sync Process

Our final hackathon repository is:
**GitLab:** [https://gitlab.com/gitlab-ai-hackathon/participants/35450504.git](https://gitlab.com/gitlab-ai-hackathon/participants/35450504.git)

Our source repository is:
**GitHub:** [https://github.com/shengliangsong-ai/gitflow-ai](https://github.com/shengliangsong-ai/gitflow-ai)

### Sync Workflow
The **"Sync Git"** process follows this flow:
**Google AI Studio** ==> **GitHub** ==> **GitLab**

This ensures that the latest AI-generated code from Google AI Studio is pushed to GitHub, and then synchronized to the final GitLab hackathon repository.

## 🚀 Running Locally on a Private Company Network

GitFlow AI is designed to be easily cloned and run locally. This is ideal for enterprise teams who want to run the application behind a corporate firewall or within a private company network.

### Minimum Requirements
To run this project locally, you will need:
- Node.js (v18 or higher)
- npm or yarn
- Git installed on your machine

### Required API Keys
You will need to generate two API tokens to allow the AI to analyze your code and interact with your repositories:
1. **Google Gemini API Key:** Get this for free from [Google AI Studio](https://aistudio.google.com/).
2. **GitLab (or GitHub) Personal Access Token:** Generate a token from your GitLab/GitHub account settings with `api` and `read_repository` permissions.

## Installation

1. Clone the repository:
   ```bash
   git clone <YOUR_GITLAB_REPO_URL>
   cd <REPO_DIRECTORY>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_GITLAB_TOKEN=your_gitlab_personal_access_token
   ```
   *(Note: The app also uses Firebase. Ensure your `firebase-applet-config.json` is present in the `src` directory if you are using the live database features.)*

## Running the Application

Start the local development server (which runs both the Express backend and Vite frontend):

```bash
npm run dev
```

The application will be available at `http://localhost:3000`. Because it runs locally, your source code remains secure within your private network, only communicating outward to the Gemini and GitLab APIs.

## Building for Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Usage Instructions
1. Open the application in your browser.
2. Navigate to the **CLI Terminal** tab.
3. Run `benchmark team` to simulate team activity and create a GitLab project.
4. Run `benchmark conflict` to simulate a merge conflict scenario.
5. When prompted, type `merge` to trigger the AI auto-merge and conflict resolution process.
6. Check the **Architecture** tab to see the live Git graph updates.

## 🎬 Pitch Video Script (Under 3 Minutes)

**[0:00 - 0:25] The Hook & The Experiment**
"Hi everyone! Welcome to GitFlow AI. For this Hackathon, I ran an experiment as a solo developer: I gave Google AI Studio the same prompt twice to see how it would independently architect a solution. My other submission is Approach A. This is **Approach B**—a highly visual take on automating the Software Development Lifecycle."

**[0:25 - 1:10] The Demo: AI Merge Queue**
*(Visual: Click "Simulate Team Activity")*
"Managing merge queues and conflicts takes hours of manual toil. Approach B solves this by acting as an intelligent orchestrator. 

Let's click 'Simulate Team Activity'. Mock pull requests flood into our **AI Merge Queue**. Instantly, the AI performs a 'Semantic Intent Analysis.' It reads the code, summarizes the developer's actual goal, and assigns a Risk Level. If the risk is low, the AI automatically merges it. It completely removes the manual bottleneck for routine updates."

**[1:10 - 1:50] The Demo: Conflict Resolution & Audit**
*(Visual: Click "Simulate Conflict")*
"But what happens during a code collision? Let's click 'Simulate Conflict'. Two developers just modified the exact same lines of code. 

Normally, this breaks the pipeline. But we use a **Dual-Model Architecture**. The first AI model catches the conflict and intelligently resolves the collision during the cherry-pick. Then, a second, independent AI model acts as an auditor. It verifies the final merged file, ensures the logic is sound, and generates a confidence score. All of this—the original files, the AI parameters, and the score—is saved to a dedicated `gitflow-audit` repository for perfect enterprise traceability. If the score is low, it pauses for a human. Otherwise, it merges automatically!"

**[1:50 - 2:20] Deployment & Conclusion**
*(Visual: Show the README or Settings page mentioning API keys)*
"Best of all, enterprise teams can run this entirely offline on a private company network. Just clone the repo, plug in your Google Gemini API key and your GitLab token, and you are ready to go. 

Approach B proves that AI can architect creative, secure user experiences to solve complex DevOps problems. Thank you for checking out GitFlow AI!"

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
