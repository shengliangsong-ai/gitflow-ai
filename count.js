import { execSync } from 'child_process';
try {
  execSync('rm -rf /tmp/gitflow-ai');
  execSync('git clone https://github.com/shengliangsong-ai/gitflow-ai.git /tmp/gitflow-ai');
  const files = execSync('find /tmp/gitflow-ai -type f | wc -l').toString().trim();
  console.log('Total files:', files);
} catch (e) {
  console.error(e);
}
