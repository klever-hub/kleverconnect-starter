/**
 * useLongPress Hook
 * Detects long-press gestures on touch and mouse devices
 *
 * @example
 * ```tsx
 * const longPressHandlers = useLongPress({
 *   onLongPress: () => console.log('Long pressed!'),
 *   onPress: () => console.log('Quick press!'),
 *   duration: 800,
 * });
 *
 * <button {...longPressHandlers}>Press me</button>
 * ```
 */

import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  /** Callback when long-press completes */
  onLongPress: () => void;
  /** Callback when quick press (< duration) */
  onPress?: () => void;
  /** Duration in ms to trigger long-press (default: 800) */
  duration?: number;
  /** Callback when long-press starts */
  onStart?: () => void;
  /** Callback when long-press is cancelled */
  onCancel?: () => void;
  /** Maximum movement allowed in px before canceling (default: 10) */
  moveThreshold?: number;
}

export const useLongPress = ({
  onLongPress,
  onPress,
  duration = 800,
  onStart,
  onCancel,
  moveThreshold = 10,
}: UseLongPressOptions) => {
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressRef = useRef<boolean>(false);

  const start = useCallback(
    (clientX: number, clientY: number) => {
      isLongPressRef.current = false;
      startPosRef.current = { x: clientX, y: clientY };

      onStart?.();

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
      }, duration);
    },
    [duration, onLongPress, onStart]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    if (!isLongPressRef.current) {
      onCancel?.();
    }

    startPosRef.current = null;
  }, [onCancel]);

  const end = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    // If long-press didn't complete, treat as regular press
    if (!isLongPressRef.current && onPress) {
      onPress();
    }

    startPosRef.current = null;
    isLongPressRef.current = false;
  }, [onPress]);

  const checkMovement = useCallback(
    (clientX: number, clientY: number) => {
      if (!startPosRef.current) return false;

      const deltaX = Math.abs(clientX - startPosRef.current.x);
      const deltaY = Math.abs(clientY - startPosRef.current.y);

      // Cancel if moved too far
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        cancel();
        return true;
      }

      return false;
    },
    [cancel, moveThreshold]
  );

  return {
    onPointerDown: (e: React.PointerEvent) => {
      // Only handle primary button (left click) or touch
      if (e.button !== 0) return;
      // Prevent text selection
      e.preventDefault();
      start(e.clientX, e.clientY);
    },
    onPointerUp: () => {
      end();
    },
    onPointerLeave: () => {
      cancel();
    },
    onPointerMove: (e: React.PointerEvent) => {
      checkMovement(e.clientX, e.clientY);
    },
    // Prevent context menu on long-press
    onContextMenu: (e: React.MouseEvent) => {
      if (isLongPressRef.current) {
        e.preventDefault();
      }
    },
  };
};
