import ClientPage from "@/app/client-page";

export const metadata = {
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
}

export default function Page() {
  return <ClientPage/>
}