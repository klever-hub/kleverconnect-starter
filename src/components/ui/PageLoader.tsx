/**
 * PageLoader Component
 * Beautiful, branded loading page for Klever blockchain dApp
 *
 * Features:
 * - Dual rotating gradient rings (orbital blockchain theme)
 * - Pulsing center glow effect
 * - Animated gradient text
 * - Supports all 6 theme variants (light, light-1, light-2, dark, dark-1, dark-2)
 * - Respects prefers-reduced-motion for accessibility
 * - Lightweight, pure CSS animations
 *
 * @example
 * ```tsx
 * <Suspense fallback={<PageLoader />}>
 *   <Routes>...</Routes>
 * </Suspense>
 * ```
 */

import './PageLoader.css';

export const PageLoader = () => {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label="Loading page">
      <div className="page-loader__container">
        {/* Outer rotating ring */}
        <div className="page-loader__ring page-loader__ring--outer" aria-hidden="true" />

        {/* Inner rotating ring (opposite direction) */}
        <div className="page-loader__ring page-loader__ring--inner" aria-hidden="true" />

        {/* Center pulsing glow */}
        <div className="page-loader__glow" aria-hidden="true" />

        {/* Center icon/dot */}
        <div className="page-loader__center" aria-hidden="true">
          <div className="page-loader__dot" />
        </div>

        {/* Loading text with gradient animation */}
        <div className="page-loader__text">
          <span className="page-loader__text-gradient">Loading</span>
          <span className="page-loader__dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading page content, please wait...</span>
    </div>
  );
};
