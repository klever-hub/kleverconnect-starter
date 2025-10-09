import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import './InfoTooltip.css';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoTooltip = ({ content, position = 'bottom' }: InfoTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible && isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, isMobile]);

  // Adjust position to prevent overflow - use useLayoutEffect since this is synchronous DOM measurement
  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current && buttonRef.current && !isMobile) {
      const tooltip = tooltipRef.current;
      const button = buttonRef.current;
      const rect = tooltip.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      let newPosition = position;

      // Check if tooltip overflows viewport
      if (position === 'top' && rect.top < 10) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && rect.bottom > window.innerHeight - 10) {
        newPosition = 'top';
      } else if (position === 'left' && rect.left < 10) {
        newPosition = 'right';
      } else if (position === 'right' && rect.right > window.innerWidth - 10) {
        newPosition = 'left';
      }

      // For very narrow spaces, prefer top/bottom
      if (
        (newPosition === 'left' || newPosition === 'right') &&
        buttonRect.top > window.innerHeight / 2
      ) {
        newPosition = 'top';
      }

      // This setState is intentional for DOM measurement-based positioning
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActualPosition(newPosition);
    }
  }, [isVisible, position, isMobile]);

  const handleMouseEnter = () => {
    if (!isMobile) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    }
  };

  const handleTooltipMouseEnter = () => {
    if (!isMobile && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    if (!isMobile) {
      setIsVisible(false);
    }
  };

  const handleToggle = () => {
    if (isMobile) {
      setIsVisible(!isVisible);
    }
  };

  return (
    <span className="info-tooltip-container">
      <button
        ref={buttonRef}
        className={`info-tooltip-trigger ${isVisible ? 'active' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggle}
        aria-label="More information"
        type="button"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="info-icon"
        >
          <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1" />
          <path
            d="M8 11.5V7M8 4.5V5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`info-tooltip-content ${actualPosition} ${isMobile ? 'mobile' : ''}`}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="info-tooltip-arrow" />
          <div className="info-tooltip-header">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="tooltip-header-icon"
            >
              <path
                d="M8 2L10.5 6.5L15.5 7L11.5 10.5L12.5 15L8 12.5L3.5 15L4.5 10.5L0.5 7L5.5 6.5L8 2Z"
                fill="currentColor"
                opacity="0.5"
              />
            </svg>
            <span className="tooltip-header-text">Learn More</span>
          </div>
          <div className="info-tooltip-body">{content}</div>
        </div>
      )}
    </span>
  );
};
