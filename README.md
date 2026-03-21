# GitFlow AI - GitLab AI Hackathon Submission

GitFlow AI is an advanced, AI-powered Git workflow simulator and auto-merging tool designed to streamline complex merge queues, resolve semantic conflicts, and automate the code integration process using Google's Gemini models and GitLab's API.

## Features
- **AI Merge Queue**: Automatically groups and merges PRs based on semantic intent.
- **Conflict Resolution**: Uses Gemini to analyze code intent and automatically resolve Git merge conflicts.
- **GitLab Integration**: Syncs directly with GitLab repositories, creates branches, and commits resolved files.
- **Interactive CLI Terminal**: A built-in terminal to simulate team activity, trigger conflicts, and run AI auto-merges.
- **Live Architecture & Roadmap**: Visualizes the system architecture and future roadmap.

## Prerequisites
To run this project locally, you will need:
- Node.js (v18 or higher)
- npm or yarn
- A GitLab Personal Access Token (with `api` scope)
- A Google Gemini API Key
- Firebase Configuration (if using the live database features)

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
   GEMINI_API_KEY=your_gemini_api_key
   GITLAB_TOKEN=your_gitlab_personal_access_token
   ```
   *(Note: The app also uses Firebase. Ensure your `firebase-applet-config.json` is present in the `src` directory if you are using the live database features.)*

## Running the Application

Start the development server (which runs both the Express backend and Vite frontend):

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
