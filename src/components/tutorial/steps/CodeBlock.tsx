import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/hooks/useTheme';
import './CodeBlock.css';

interface CodeBlockProps {
  code: string;
  language?: 'bash' | 'typescript' | 'javascript' | 'json' | 'jsx' | 'tsx';
  fileName?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock = ({
  code,
  language = 'bash',
  fileName,
  showLineNumbers = false,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

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
      {fileName && (
        <div className="code-block-header">
          <span className="file-name">{fileName}</span>
          <span className="language-badge">{language}</span>
        </div>
      )}
      <div className="code-block-container">
        <div className="syntax-highlighter-wrapper">
          <SyntaxHighlighter
            language={language}
            style={theme === 'dark' ? vscDarkPlus : vs}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              padding: '1.25rem 1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              overflowX: 'auto',
            }}
            codeTagProps={{
              style: {
                fontFamily: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace",
                display: 'inline-block',
                minWidth: '100%',
              },
            }}
            wrapLines={false}
            wrapLongLines={false}
          >
            {code}
          </SyntaxHighlighter>
        </div>
        <button
          className="copy-button"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
