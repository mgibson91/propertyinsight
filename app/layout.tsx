import "../css/preflight-without-button.css";
import "../css/globals.css" ;
import "@radix-ui/themes/styles.css";

import { Heading, Theme } from "@radix-ui/themes";
import { MatchingSnapshotProvider } from "@/app/matching-snapshot-provider";
import { NavBar } from "@/app/nav-bar";
import { DisplayModeAwareRadixThemeProvider } from "@/app/display-mode-aware-radix-theme-provider";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'tradescan.pro',
  description: 'Backtest faster than ever before',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <body className="">
      <DisplayModeAwareRadixThemeProvider>
        <main className="min-h-screen flex flex-col items-center">
          <MatchingSnapshotProvider>
            <>
              <div className={'w-full'}>
                <NavBar/>
              </div>
              {children}
            </>

          </MatchingSnapshotProvider>
        </main>
      </DisplayModeAwareRadixThemeProvider>


    </body>
    </html>
  )
}
