import https from 'https';

https.get('https://api.github.com/repos/shengliangsong-ai/gitflow-ai', { headers: { 'User-Agent': 'node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
