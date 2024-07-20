import '../css/preflight-without-button.css';
import '../css/globals.css';
import '@radix-ui/themes/styles.css';
import { DisplaySnapshotProvider } from '@/app/display-snapshot-provider';
import { DisplayModeAwareRadixThemeProvider } from '@/app/display-mode-aware-radix-theme-provider';
import Script from 'next/script';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NavDropdown } from '@/shared/nav-dropdown';
import { NavBar } from '@/shared/nav-bar';
import { CSPostHogProvider } from '@/app/posthog-provider';
import { UserMetadata, UserMetadataProvider } from '@/app/user-metadata-provider';
import { PostHogIdentifier } from '@/app/posthog-identifier';

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

  const userMetadata: UserMetadata = {
    userId: '',
    email: '',
    // subscribed: false,
    // creditBalance: 0,
  };

  if (user?.id && user?.email) {
    // const subscription = await getSubscription(user.id);
    // userMetadata.subscribed = Boolean(subscription);
    userMetadata.userId = user.id;
    userMetadata.email = user.email;
    // userMetadata.creditBalance = subscription?.creditBalance || 0;
  }

  if (user?.id) {
    userMetadata.userId = user.id;
  }

  return (
    <html lang="en">
      {process.env.GTM_ID && (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${process.env.GTM_ID}');
          `}
        </Script>
      )}

      <CSPostHogProvider>
        <body className="min-h-screen">
          <UserMetadataProvider defaultValues={userMetadata}>
            <PostHogIdentifier>
              <DisplayModeAwareRadixThemeProvider>
                {/*<ResponsiveDisplay mobileFallback={<div>Nope</div>}>*/}
                <div className={'w-full sticky top-0 z-10 backdrop-blur-lg max-h-[50px]'}>
                  <NavBar
                    isLoggedIn={Boolean(user?.email)}
                    rightSlot={
                      <div className={'ml-2'}>
                        <NavDropdown
                          headerSlot={
                            <span className={'text truncate pr-1 text-primary-text-contrast'}>{user?.email}</span>
                          }
                        />
                      </div>
                    }
                  />
                </div>

                <main className="flex-auto flex flex-col items-center text-primary-text">
                  <DisplaySnapshotProvider>{children}</DisplaySnapshotProvider>
                </main>
                {/*</ResponsiveDisplay>*/}
              </DisplayModeAwareRadixThemeProvider>
            </PostHogIdentifier>
          </UserMetadataProvider>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
