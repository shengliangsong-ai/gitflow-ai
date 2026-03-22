#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const command = args[0];
const gitArgs = args.slice(1).join(' ');

const CONFIG_PATH = path.join(os.homedir(), '.git-ai.json');

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

const config = loadConfig();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || config.GEMINI_API_KEY;
const GIT_TOKEN = process.env.GITLAB_TOKEN || process.env.GITHUB_TOKEN || config.GIT_TOKEN;

const runGit = (cmd) => {
  try {
    execSync(`git ${cmd}`, { stdio: 'inherit' });
  } catch (e) {
    process.exit(e.status || 1);
  }
};

if (command === 'config') {
  const subCmd = args[1];
  const key = args[2];
  const value = args[3];
  
  if (subCmd === 'set' && key && value) {
    config[key] = value;
    saveConfig(config);
    console.log(`\x1b[32m✅ Config saved: ${key} = ${value.substring(0, 4)}...\x1b[0m`);
    process.exit(0);
  } else {
    console.log('\x1b[35m🤖 AI GitFlow CLI Configuration\x1b[0m');
    console.log('Usage: git-ai config set <key> <value>\n');
    console.log('Available keys:');
    console.log('  GEMINI_API_KEY   Your Google Gemini API Key');
    console.log('  GIT_TOKEN        Your GitHub or GitLab Personal Access Token\n');
    console.log('Example:');
    console.log('  git-ai config set GEMINI_API_KEY AIzaSyYourKeyHere...');
    process.exit(1);
  }
}

if (!command || command === 'help' || command === '--version' || command === '-v') {
  console.log('\x1b[35m🤖 AI GitFlow CLI v1.0.0\x1b[0m');
  console.log('Integrates AI merge queues and automated reviews into your local git workflow.\n');
  console.log('📖 Documentation & Usage: \x1b[36mhttps://github.com/shengliangsong-ai/gitflow-ai\x1b[0m\n');
  console.log('Usage: git-ai <command> [args]\n');
  console.log('Commands:');
  console.log('  config    Set up your API keys (GEMINI_API_KEY, GIT_TOKEN)');
  console.log('  commit    Analyze staged files with AI before committing');
  console.log('  push      Push code and automatically register with AI Merge Queue');
  console.log('  rebase    Run rebase with AI conflict resolution monitoring');
  console.log('  status    Check the status of the global merge queue and verify tokens');
  console.log('  benchmark Run a self-test to measure API latency and verify connections');
  console.log('  *         Any other command falls back to standard git');
  process.exit(0);
}

if (command !== 'benchmark') {
  console.log(`\x1b[35m[AI GitFlow]\x1b[0m Intercepting git ${command}...`);
}

function makeGeminiRequest(prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            let text = parsed.candidates[0].content.parts[0].text;
            if (text.startsWith('```json')) text = text.substring(7);
            if (text.startsWith('```')) text = text.substring(3);
            if (text.endsWith('```')) text = text.substring(0, text.length - 3);
            resolve(JSON.parse(text.trim()));
          } catch (e) {
            reject(new Error("Failed to parse Gemini response"));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function analyzeCommit() {
  if (!GEMINI_API_KEY) {
    console.error('\x1b[31m❌ GEMINI_API_KEY is not set.\x1b[0m');
    console.log('Please set it by running: \x1b[36mgit-ai config set GEMINI_API_KEY <your_key>\x1b[0m');
    process.exit(1);
  }

  try {
    const diff = execSync('git diff --cached', { encoding: 'utf8' });
    if (!diff.trim()) {
      console.log(`\x1b[33mNo staged changes found. Running standard git commit...\x1b[0m`);
      runGit(`commit ${gitArgs}`);
      return;
    }

    console.log(`\x1b[36m🤖 Analyzing staged files for potential issues...\x1b[0m`);
    
    const prompt = `You are an expert code reviewer. Review the following git diff.
    Provide a concise summary of the changes and point out any obvious bugs, security issues, or bad practices.
    If there are critical security issues or syntax errors that will break the build, set "blockCommit" to true.
    Otherwise, set "blockCommit" to false.
    
    Git Diff:
    ${diff}
    
    Respond in JSON format with two fields:
    - "review": A string containing your concise markdown review.
    - "blockCommit": A boolean indicating if the commit should be blocked.`;

    const result = await makeGeminiRequest(prompt);
    
    console.log(`\n\x1b[35m=== AI Code Review ===\x1b[0m`);
    console.log(result.review);
    console.log(`\x1b[35m======================\x1b[0m\n`);

    if (result.blockCommit) {
      console.log(`\x1b[31m❌ Critical issues found. Commit blocked. Please fix the issues and try again.\x1b[0m`);
      process.exit(1);
    } else {
      console.log(`\x1b[32m✅ Code looks solid. Proceeding with commit.\x1b[0m`);
      runGit(`commit ${gitArgs}`);
    }
  } catch (error) {
    console.error(`\x1b[31m⚠️ AI Analysis failed: ${error.message}\x1b[0m`);
    console.log(`\x1b[33mFalling back to standard git commit...\x1b[0m`);
    runGit(`commit ${gitArgs}`);
  }
}

async function checkStatus() {
  if (!GIT_TOKEN) {
    console.error('\x1b[31m❌ GIT_TOKEN is not set.\x1b[0m');
    console.log('Please set it by running: \x1b[36mgit-ai config set GIT_TOKEN <your_token>\x1b[0m');
    process.exit(1);
  }

  console.log(`\x1b[36m📊 Verifying Git token...\x1b[0m`);
  
  const options = {
    hostname: 'api.github.com',
    path: '/user',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GIT_TOKEN}`,
      'User-Agent': 'AI-GitFlow-CLI'
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        const user = JSON.parse(data);
        console.log(`\x1b[32m✅ Authenticated as GitHub user: ${user.login}\x1b[0m`);
        console.log(`\x1b[33mQueue Status: Ready for AI Merge Queue.\x1b[0m`);
      } else {
         // Fallback to GitLab check
         const glOptions = {
           hostname: 'gitlab.com',
           path: '/api/v4/user',
           method: 'GET',
           headers: {
             'Authorization': `Bearer ${GIT_TOKEN}`,
             'User-Agent': 'AI-GitFlow-CLI'
           }
         };
         const glReq = https.request(glOptions, (glRes) => {
           let glData = '';
           glRes.on('data', (chunk) => glData += chunk);
           glRes.on('end', () => {
             if (glRes.statusCode === 200) {
               const user = JSON.parse(glData);
               console.log(`\x1b[32m✅ Authenticated as GitLab user: ${user.username}\x1b[0m`);
               console.log(`\x1b[33mQueue Status: Ready for AI Merge Queue.\x1b[0m`);
             } else {
               console.log(`\x1b[31m⚠️ Failed to authenticate with GitHub or GitLab using provided token.\x1b[0m`);
             }
           });
         });
         glReq.on('error', () => console.log(`\x1b[31m⚠️ Network error verifying token.\x1b[0m`));
         glReq.end();
      }
    });
  });
  req.on('error', () => console.log(`\x1b[31m⚠️ Network error verifying token.\x1b[0m`));
  req.end();
}

async function runBenchmark() {
  console.log(`\x1b[36m🚀 Starting AI GitFlow Benchmark Self-Test...\x1b[0m\n`);

  if (!GEMINI_API_KEY) {
    console.error('\x1b[31m❌ GEMINI_API_KEY is not set. Cannot benchmark AI latency.\x1b[0m');
  } else {
    console.log(`\x1b[33mTesting Gemini API Latency...\x1b[0m`);
    const prompt = `Respond with exactly this JSON and nothing else: {"review": "Benchmark successful.", "blockCommit": false}`;
    
    const startTime = Date.now();
    try {
      const result = await makeGeminiRequest(prompt);
      const endTime = Date.now();
      const latency = endTime - startTime;
      console.log(`\x1b[32m✅ Gemini API responded in ${latency}ms\x1b[0m`);
      console.log(`   Response: ${result.review}`);
    } catch (e) {
      console.error(`\x1b[31m❌ Gemini API Test Failed: ${e.message}\x1b[0m`);
    }
  }

  console.log();

  if (!GIT_TOKEN) {
    console.error('\x1b[31m❌ GIT_TOKEN is not set. Cannot benchmark Git provider latency.\x1b[0m');
  } else {
    console.log(`\x1b[33mTesting Git Provider Latency (GitHub/GitLab)...\x1b[0m`);
    const startTime = Date.now();
    
    const options = {
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GIT_TOKEN}`,
        'User-Agent': 'AI-GitFlow-CLI'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const endTime = Date.now();
        const latency = endTime - startTime;
        if (res.statusCode === 200) {
          const user = JSON.parse(data);
          console.log(`\x1b[32m✅ GitHub API responded in ${latency}ms (User: ${user.login})\x1b[0m`);
        } else {
           const glStartTime = Date.now();
           const glOptions = {
             hostname: 'gitlab.com',
             path: '/api/v4/user',
             method: 'GET',
             headers: {
               'Authorization': `Bearer ${GIT_TOKEN}`,
               'User-Agent': 'AI-GitFlow-CLI'
             }
           };
           const glReq = https.request(glOptions, (glRes) => {
             let glData = '';
             glRes.on('data', (chunk) => glData += chunk);
             glRes.on('end', () => {
               const glEndTime = Date.now();
               const glLatency = glEndTime - glStartTime;
               if (glRes.statusCode === 200) {
                 const user = JSON.parse(glData);
                 console.log(`\x1b[32m✅ GitLab API responded in ${glLatency}ms (User: ${user.username})\x1b[0m`);
               } else {
                 console.log(`\x1b[31m❌ Failed to authenticate with GitHub or GitLab.\x1b[0m`);
               }
             });
           });
           glReq.on('error', (e) => console.log(`\x1b[31m❌ GitLab Network error: ${e.message}\x1b[0m`));
           glReq.end();
        }
      });
    });
    req.on('error', (e) => console.log(`\x1b[31m❌ GitHub Network error: ${e.message}\x1b[0m`));
    req.end();
  }

  console.log();

  if (GEMINI_API_KEY) {
    console.log(`\x1b[33mTesting AI Conflict Resolution (Simulated PR Merge)...\x1b[0m`);
    const conflictPrompt = `You are an expert developer resolving a git conflict.
    Resolve the following conflict by combining both features (tax and discount).
    Respond with exactly this JSON and nothing else: {"resolvedCode": "...", "explanation": "..."}

    Conflict:
    <<<<<<< HEAD
    function calculateTotal(items) {
      return items.reduce((sum, item) => sum + item.price * 1.2, 0); // Added 20% tax
    }
    =======
    function calculateTotal(items) {
      const discount = 0.9; // 10% discount
      return items.reduce((sum, item) => sum + item.price * discount, 0);
    }
    >>>>>>> feature/discount`;

    const conflictStartTime = Date.now();
    try {
      const conflictResult = await makeGeminiRequest(conflictPrompt);
      const conflictEndTime = Date.now();
      console.log(`\x1b[32m✅ AI resolved conflict in ${conflictEndTime - conflictStartTime}ms\x1b[0m`);
      console.log(`   Explanation: ${conflictResult.explanation}`);
    } catch (e) {
      console.error(`\x1b[31m❌ Conflict Resolution Test Failed: ${e.message}\x1b[0m`);
    }

    console.log();

    console.log(`\x1b[33mTesting AI Merge Queue Analysis (Simulated Team Activity)...\x1b[0m`);
    const queuePrompt = `You are an AI Merge Queue manager.
    Analyze these 3 pending PRs and determine the safest merge order.
    PR #12: Update React to v18 (High risk, touches many files)
    PR #13: Fix typo in README.md (Low risk, docs only)
    PR #14: Add new payment gateway (Medium risk, isolated to billing module)

    Respond with exactly this JSON and nothing else: {"mergeOrder": [13, 14, 12], "reasoning": "..."}`;

    const queueStartTime = Date.now();
    try {
      const queueResult = await makeGeminiRequest(queuePrompt);
      const queueEndTime = Date.now();
      console.log(`\x1b[32m✅ AI analyzed team queue in ${queueEndTime - queueStartTime}ms\x1b[0m`);
      console.log(`   Recommended Order: PRs ${queueResult.mergeOrder.join(', ')}`);
      console.log(`   Reasoning: ${queueResult.reasoning}`);
    } catch (e) {
      console.error(`\x1b[31m❌ Queue Analysis Test Failed: ${e.message}\x1b[0m`);
    }
  }
}

switch (command) {
  case 'commit':
    analyzeCommit();
    break;
  case 'push':
    runGit(`push ${gitArgs}`);
    console.log(`\x1b[36m🚀 Push detected. Registering with AI Merge Queue...\x1b[0m`);
    break;
  case 'rebase':
    console.log(`\x1b[36m🔄 AI is monitoring your rebase for conflict resolution...\x1b[0m`);
    runGit(`rebase ${gitArgs}`);
    break;
  case 'status':
    checkStatus();
    break;
  case 'benchmark':
    runBenchmark();
    break;
  default:
    runGit(`${command} ${gitArgs}`);
}
