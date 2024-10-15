import ClientPage from '@/app/dashboard/client-page';

export const metadata = {
  title: 'propertyinsight.ai',
  description: 'Accessible. Transparent. At your fingertips.',
  openGraph: {
    title: 'Property Insight',
    description: 'Accessible. Transparent. At your fingertips.',
    url: 'https://propertyinsight.ai',
    siteName: 'Property Insight',
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
  return <ClientPage />;
}
