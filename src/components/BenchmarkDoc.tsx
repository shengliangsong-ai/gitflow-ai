import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import Mermaid from './Mermaid';

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
          {content}
        </Markdown>
      </div>
    </div>
  );
}
