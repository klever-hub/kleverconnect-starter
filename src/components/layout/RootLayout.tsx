import type { ReactNode } from 'react';
import { Header } from './Header';

interface RootLayoutProps {
  children: ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
};
