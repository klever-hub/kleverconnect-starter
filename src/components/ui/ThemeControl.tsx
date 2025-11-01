/**
 * Unified Theme Control Component
 * Single button that handles both quick toggle and advanced theme selection
 *
 * Interactions:
 * - Click: Quick light/dark toggle
 * - Long-press (800ms): Opens advanced theme menu
 * - Right-click: Opens advanced theme menu (desktop)
 * - Keyboard: T to toggle, Shift+T for menu
 *
 * @example
 * ```tsx
 * <ThemeControl position="bottom-right" />
 * ```
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useLongPress } from '../../hooks/useLongPress';
import type { Theme } from '../../contexts/ThemeContext';

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ThemeControlProps {
  /** Position of the button */
  position?: Position;
  /** Show discovery tooltip for new users */
  showDiscoveryHint?: boolean;
}

const themes: { value: Theme; label: string; description: string; icon: string }[] = [
  { value: 'light', label: 'Light', description: 'Clean white', icon: '☀️' },
  { value: 'light-2', label: 'Warm', description: 'Soft cream', icon: '🌤️' },
  { value: 'dark', label: 'Dark', description: 'Zinc gray', icon: '🌙' },
  { value: 'dark-2', label: 'Klever', description: 'True black', icon: '✨' },
];

const positionClasses: Record<Position, { container: string; panel: string }> = {
  'top-left': {
    container: 'top-4 sm:top-8 left-4 sm:left-8',
    panel: 'top-16 left-0 mt-2',
  },
  'top-right': {
    container: 'top-4 sm:top-8 right-4 sm:right-8',
    panel: 'top-16 right-0 mt-2',
  },
  'bottom-left': {
    container: 'bottom-4 sm:bottom-8 left-4 sm:left-8',
    panel: 'bottom-16 left-0 mb-2',
  },
  'bottom-right': {
    container: 'bottom-4 sm:bottom-8 right-4 sm:right-8',
    panel: 'bottom-16 right-0 mb-2',
  },
};

export const ThemeControl = ({ position = 'bottom-right', showDiscoveryHint = true }: ThemeControlProps) => {
  const { theme, themeMode, toggleTheme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const currentTheme = themes.find((t) => t.value === theme || t.value === `${theme}-1`) || themes[0];
  const positions = positionClasses[position];

  // Show discovery tooltip for new users
  useEffect(() => {
    if (!showDiscoveryHint) return;

    const visitCount = parseInt(localStorage.getItem('theme-control-visits') || '0', 10);

    if (visitCount < 3) {
      const timer = setTimeout(() => setShowTooltip(true), 1000);
      localStorage.setItem('theme-control-visits', String(visitCount + 1));

      return () => clearTimeout(timer);
    }
  }, [showDiscoveryHint]);

  // Auto-hide tooltip after 5 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // Long-press handlers
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      setIsMenuOpen(true);
      setShowTooltip(false);
    },
    onPress: () => {
      if (!isMenuOpen) {
        toggleTheme();
      }
    },
    duration: 800,
  });

  // Handle right-click (desktop)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(true);
    setShowTooltip(false);
  };

  // Handle theme selection
  const handleThemeSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    setIsMenuOpen(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // T = Quick toggle
      if (e.key === 't' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleTheme();
      }

      // Shift+T = Open menu
      if (e.key === 'T' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsMenuOpen((prev) => !prev);
      }

      // Escape = Close menu
      if (e.key === 'Escape' && isMenuOpen) {
        e.preventDefault();
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, isMenuOpen]);

  return (
    <div className={`fixed ${positions.container} z-40`}>
      {/* Discovery Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            💡 Hold for more themes
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
          </div>
        </div>
      )}

      {/* Theme Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 bg-black/20 sm:hidden -z-10" onClick={() => setIsMenuOpen(false)} />

          {/* Theme Options Panel */}
          <div
            className={`absolute ${positions.panel} bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-bottom-2 duration-200`}
          >
            <div className="p-3 border-b border-gray-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Choose Theme</h3>
            </div>
            <div className="p-2 flex flex-col gap-1 min-w-[180px] max-h-[300px] overflow-y-auto">
              {themes.map((themeOption) => {
                const isActive = theme === themeOption.value || theme === `${themeOption.value}-1`;
                return (
                  <button
                    key={themeOption.value}
                    onClick={() => handleThemeSelect(themeOption.value)}
                    className={`
                      text-left px-3 py-2 rounded-md transition-all text-sm flex items-center gap-2
                      ${
                        isActive
                          ? 'bg-klever-gradient text-white shadow-md'
                          : 'bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-zinc-700'
                      }
                    `}
                  >
                    <span className="text-base">{themeOption.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{themeOption.label}</div>
                      <div
                        className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        {themeOption.description}
                      </div>
                    </div>
                    {isActive && <span className="text-sm">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Main Button */}
      <button
        {...longPressHandlers}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="w-14 h-14 sm:w-11 sm:h-11 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-[var(--shadow-lg)] backdrop-blur-[10px] transition-all duration-300 ease-in-out flex items-center justify-center select-none hover:bg-[var(--bg-tertiary)] hover:scale-110 hover:shadow-[0_8px_32px_rgba(139,92,246,0.2)] active:scale-95 group"
        style={{ backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.9)' }}
        aria-label={`Theme control. Current: ${currentTheme.label}. Click to toggle, hold for more options`}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
      >
        {/* SVG Icon with rotation animation */}
        {themeMode === 'light' ? (
          // Moon icon for light theme
          <svg
            className="transition-transform duration-300 ease-in-out group-hover:rotate-[15deg]"
            style={{
              color: 'var(--text-primary)',
              width: '1.75rem',
              height: '1.75rem',
              minWidth: '1.75rem',
              minHeight: '1.75rem',
            }}
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          // Sun icon for dark theme
          <svg
            className="transition-transform duration-300 ease-in-out group-hover:rotate-[15deg]"
            style={{
              color: 'var(--text-primary)',
              width: '1.75rem',
              height: '1.75rem',
              minWidth: '1.75rem',
              minHeight: '1.75rem',
            }}
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}

        {/* Subtle hint indicator on hover (desktop only) - only show on first few visits */}
        {isHovering && !isMenuOpen && showTooltip && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-klever-pink rounded-full animate-pulse hidden sm:block"></div>
        )}
      </button>
    </div>
  );
};
