import { execSync } from 'child_process';
try {
  const commits = execSync('cd /tmp/gitflow-ai && git rev-list --all --count').toString().trim();
  console.log('Total commits:', commits);
} catch (e) {
  console.error(e);
}
