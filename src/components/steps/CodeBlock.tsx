import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock = ({ code, language = 'bash' }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="code-block-wrapper">
      <pre className={`language-${language}`}>
        <code>{code}</code>
      </pre>
      <button 
        className="copy-button"
        onClick={handleCopy}
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <span className="copy-icon">✓</span>
        ) : (
          <span className="copy-icon">📋</span>
        )}
      </button>
    </div>
  );
};