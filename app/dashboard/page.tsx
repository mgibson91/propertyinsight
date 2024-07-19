import ClientPage from '@/app/dashboard/client-page';
import { getAllTickerStreams } from '@/repository/ticker_stream_data/get-ticker-streams';

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
};

export default async function Page() {
  const tickerStreams = await getAllTickerStreams();
  return <ClientPage streams={tickerStreams} />;
}
