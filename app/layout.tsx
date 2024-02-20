import '../css/preflight-without-button.css';
import '../css/globals.css';
import '@radix-ui/themes/styles.css';
import { MatchingSnapshotProvider } from '@/app/matching-snapshot-provider';
import { DisplayModeAwareRadixThemeProvider } from '@/app/display-mode-aware-radix-theme-provider';
import Script from 'next/script';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NavDropdown } from '@/shared/nav-dropdown';
import { NavBar } from '@/shared/nav-bar';

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
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
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          <div className={'w-full sticky top-0 z-10 backdrop-blur-lg max-h-[50px]'}>
            <NavBar
              isLoggedIn={Boolean(user?.email)}
              rightSlot={
                <div className={'ml-2'}>
                  <NavDropdown
                    headerSlot={<span className={'text truncate pr-1 text-primary-text-contrast'}>{user?.email}</span>}
                  />
                </div>
              }
            />
          </div>

          <main className="min-h-screen flex flex-col items-center text-primary-text">
            <MatchingSnapshotProvider>{children}</MatchingSnapshotProvider>
          </main>
        </DisplayModeAwareRadixThemeProvider>
      </body>
    </html>
  );
}
