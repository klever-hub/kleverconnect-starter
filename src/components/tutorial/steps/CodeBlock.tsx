import { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/hooks/useTheme';

// Create custom theme objects that avoid background/backgroundColor conflicts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createCustomTheme = (baseTheme: Record<string, any>) => {
  const customTheme = { ...baseTheme };
  // Remove all background properties from the theme to prevent conflicts
  Object.keys(customTheme).forEach((key) => {
    if (typeof customTheme[key] === 'object' && customTheme[key] !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { background: _bg, backgroundColor: _bgColor, ...rest } = customTheme[key];
      customTheme[key] = rest;
    }
  });
  // Remove background from root level too
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { background: _rootBg, backgroundColor: _rootBgColor, ...rootTheme } = customTheme;
  return rootTheme;
};

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
  const { themeMode } = useTheme();

  // Create custom themes without background conflicts
  const customTheme = useMemo(() => {
    const baseTheme = themeMode === 'dark' ? vscDarkPlus : vs;
    return createCustomTheme(baseTheme);
  }, [themeMode]);

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
    <div className="relative my-6 rounded-xl overflow-hidden hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-shadow duration-200 sm:my-4 sm:rounded-lg">
      {fileName && (
        <div
          className="flex justify-between items-center px-4 py-3 text-sm border-b sm:px-3 sm:py-2"
          style={{
            background: 'var(--code-header-bg)',
            borderBottomColor: 'var(--code-border)',
          }}
        >
          <span className="font-medium" style={{ color: 'var(--code-filename)' }}>
            {fileName}
          </span>
          <span
            className="px-2 py-1 text-xs uppercase font-semibold tracking-wider rounded"
            style={{
              background: 'var(--code-badge-bg)',
              color: 'var(--code-badge-color)',
            }}
          >
            {language}
          </span>
        </div>
      )}
      <div className="relative flex overflow-hidden rounded-xl sm:rounded-lg" style={{ backgroundColor: 'var(--code-bg)' }}>
        <div className="w-full">
          <SyntaxHighlighter
            language={language}
            style={customTheme}
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
          className="absolute top-3 right-3 rounded-md px-2 py-2 flex items-center justify-center z-10 opacity-0 hover:opacity-100 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 [@media(hover:none)]:opacity-100 sm:px-1.5 sm:py-1.5"
          style={{
            background: 'var(--code-copy-bg)',
            borderWidth: '1px',
            borderColor: 'var(--code-copy-border)',
            color: 'var(--code-copy-color)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--code-copy-hover-bg)';
            e.currentTarget.style.color = 'var(--code-copy-hover-color)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--code-copy-bg)';
            e.currentTarget.style.color = 'var(--code-copy-color)';
          }}
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
