import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

export default function BenchmarkDoc() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/BENCHMARK.md')
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(err => setContent('Failed to load documentation.'));
  }, []);

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-xl">
      <div className="prose prose-invert max-w-none prose-indigo">
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
}
