import type { ReactNode } from 'react';
import { Header } from './Header';
import { ThemeControl } from '../ui/ThemeControl';

interface RootLayoutProps {
  children: ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      {/*
        Unified Theme Control:
        - Click = Quick light/dark toggle
        - Long-press (800ms) = Advanced theme menu (4 variants)
        - Right-click (desktop) = Advanced theme menu
        - Keyboard: T to toggle, Shift+T for menu

        Change position prop to move it around:
        Options: "top-left" | "top-right" | "bottom-left" | "bottom-right"
      */}
      <ThemeControl position="bottom-right" />
    </>
  );
};
