import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'light-1' | 'light-2' | 'dark' | 'dark-1' | 'dark-2';
export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  cycleThemeVariant: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export { ThemeContext };

interface ThemeProviderProps {
  children: ReactNode;
}

// Theme variants for each mode
const lightThemes: Theme[] = ['light', 'light-1', 'light-2'];
const darkThemes: Theme[] = ['dark', 'dark-1', 'dark-2'];

const getThemeMode = (theme: Theme): ThemeMode => {
  return theme.startsWith('light') ? 'light' : 'dark';
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && [...lightThemes, ...darkThemes].includes(savedTheme)) {
      return savedTheme;
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const themeMode = getThemeMode(theme);

  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove(...lightThemes, ...darkThemes);
    // Add current theme class
    document.documentElement.classList.add(theme);
    // Set data-theme attribute for CSS selectors
    document.documentElement.setAttribute('data-theme', theme);
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    // Toggle between light and dark mode (keeping the same variant)
    setThemeState((prevTheme) => {
      const currentMode = getThemeMode(prevTheme);
      if (currentMode === 'light') {
        // Switch to corresponding dark variant
        const index = lightThemes.indexOf(prevTheme);
        return darkThemes[index] || 'dark';
      } else {
        // Switch to corresponding light variant
        const index = darkThemes.indexOf(prevTheme);
        return lightThemes[index] || 'light';
      }
    });
  };

  const cycleThemeVariant = () => {
    // Cycle through variants within the same mode
    setThemeState((prevTheme) => {
      const currentMode = getThemeMode(prevTheme);
      const themes = currentMode === 'light' ? lightThemes : darkThemes;
      const currentIndex = themes.indexOf(prevTheme);
      const nextIndex = (currentIndex + 1) % themes.length;
      return themes[nextIndex];
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setTheme, cycleThemeVariant }}>
      {children}
    </ThemeContext.Provider>
  );
};
