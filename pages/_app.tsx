import { initializeApp } from 'firebase/app';
import { DefaultSeo } from 'next-seo';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo
        additionalLinkTags={[
          {
            href: '/apple-touch-icon.png',
            rel: 'apple-touch-icon',
            sizes: '180x180',
          },
          {
            href: '/favicon-32x32.png',
            rel: 'icon',
            sizes: '32x32',
            type: 'image/png',
          },
          {
            href: '/favicon-16x16.png',
            rel: 'icon',
            sizes: '16x16',
            type: 'image/png',
          },
          {
            href: '/site.webmanifest',
            rel: 'webmanifest',
          },
        ]}
        description="Hey future Hubbers, ready to start your coding assignment? Here are a few things you need to know!"
        openGraph={{
          images: [
            {
              alt: 'Mockup',
              height: 630,
              type: 'image/jpeg',
              url: 'https://internship.freshamplify.com/images/og-image.jpg',
              width: 1200,
            },
          ],
        }}
        title="Welcome to Investor Hub"
      />
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}

export default MyApp;
