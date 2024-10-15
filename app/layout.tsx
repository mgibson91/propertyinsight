import '../css/preflight-without-button.css';
import '../css/globals.css';
import '@radix-ui/themes/styles.css';
import React from 'react';
import { DisplayModeAwareRadixThemeProvider } from '@/app/display-mode-aware-radix-theme-provider';
import FeedbackForm from '@/app/(authenticated)/feedback/FeedbackForm';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="">
        <DisplayModeAwareRadixThemeProvider>
          <main className="flex-auto flex flex-col items-center">
            {children}
            <div className="w-full bg-accent-bg border-t border-primary-line">
              <FeedbackForm />
            </div>
          </main>
        </DisplayModeAwareRadixThemeProvider>
      </body>
    </html>
  );
}
