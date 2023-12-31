import '../css/preflight-without-button.css';
import '../css/globals.css';
import '@radix-ui/themes/styles.css';
import { MatchingSnapshotProvider } from '@/app/matching-snapshot-provider';
import { NavBar } from '@/app/nav-bar';
import { DisplayModeAwareRadixThemeProvider } from '@/app/display-mode-aware-radix-theme-provider';
import Script from 'next/script';

// const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export const metadata = {
  // metadataBase: new URL(defaultUrl),
  title: 'tradescan.pro',
  description: 'Test. Learn. Earn - Faster',
  openGraph: {
    title: 'Tradescan',
    description: 'Test. Learn. Earn - Faster',
    url: 'https://tradescan.pro',
    siteName: 'Tradescan',
    images: [
      {
        url: 'https://drive.google.com/uc?export=view&id=1dQoOQK9yflBc-vYZAc5VAzAE7652tPbE',
        width: 1204,
        height: 632,
      },
      // {
      //   url: 'https://nextjs.org/og-alt.png',
      //   width: 1800,
      //   height: 1600,
      //   alt: 'My custom alt',
      // },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <Script id="google-tag-manager" strategy="afterInteractive">
      {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${process.env.GTM_ID}');
          `}
    </Script>
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
