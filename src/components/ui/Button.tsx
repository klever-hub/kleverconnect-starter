/**
 * Button Component
 * Reusable button with consistent styling across the app
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */

import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button content */
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) => {
  // Base styles applied to all buttons
  const baseStyles = 'font-semibold rounded-lg transition-opacity duration-200 border-none cursor-pointer';

  // Variant-specific styles
  const variants = {
    primary: 'bg-klever-gradient text-white hover:opacity-90',
    secondary: 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-50 hover:bg-gray-200 dark:hover:bg-zinc-700',
    outline: 'border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-zinc-900',
  };

  // Size-specific styles
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
