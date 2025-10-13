import { useEffect, useRef, useState } from 'react';

interface UseSlotMachineAnimationOptions {
  duration?: number;
  steps?: number;
  randomness?: number;
}

export const useSlotMachineAnimation = (
  targetValue: number | null,
  options: UseSlotMachineAnimationOptions = {}
) => {
  const { duration = 500, steps = 20, randomness = 0.3 } = options;

  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValueRef = useRef<number | null>(null);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clean up any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }

    if (targetValue === null) {
      setDisplayValue(null);
      previousValueRef.current = null;
      return;
    }

    // Check if value changed
    if (previousValueRef.current !== null && previousValueRef.current !== targetValue) {
      setIsAnimating(true);

      const startValue = previousValueRef.current;
      const endValue = targetValue;
      const stepTime = duration / steps;
      let currentStep = 0;

      const animate = () => {
        currentStep++;

        if (currentStep < steps) {
          // Generate random value between start and end for slot effect
          const progress = currentStep / steps;
          const range = endValue - startValue;
          const randomOffset = (Math.random() - 0.5) * Math.abs(range) * randomness;
          const interpolatedValue = startValue + range * progress + randomOffset;

          setDisplayValue(interpolatedValue);
          animationRef.current = setTimeout(animate, stepTime);
        } else {
          // Final value
          setDisplayValue(endValue);
          setIsAnimating(false);
        }
      };

      animate();
    } else {
      // First time setting value or no change
      setDisplayValue(targetValue);
    }

    previousValueRef.current = targetValue;

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [targetValue, duration, steps, randomness]);

  return { displayValue, isAnimating };
};
