import '../css/preflight-without-button.css';
import '../css/globals.css';
import '@radix-ui/themes/styles.css';
import React from 'react';
import { DisplayModeAwareRadixThemeProvider } from '@/app/display-mode-aware-radix-theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="">
        <DisplayModeAwareRadixThemeProvider>{children}</DisplayModeAwareRadixThemeProvider>
      </body>
    </html>
  );
}
