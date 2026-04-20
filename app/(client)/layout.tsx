import type { Metadata } from 'next';
import { Header } from '@/components/client/header';
import { Footer } from '@/components/client/footer';
import { WhatsAppFab } from '@/components/client/whatsapp-fab';

export const metadata: Metadata = {
  title: {
    default: 'MawarBiru — Dewan Perkahwinan & Acara',
    template: '%s — MawarBiru',
  },
  description:
    'Dewan perkahwinan dan acara eksklusif. Tempah temujanji atau lihat kalendar ketersediaan kami.',
  openGraph: {
    title: 'MawarBiru — Dewan Perkahwinan & Acara',
    description:
      'Dewan perkahwinan dan acara eksklusif. Tempah temujanji atau lihat kalendar ketersediaan kami.',
    type: 'website',
    locale: 'ms_MY',
  },
};

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 pt-16 lg:pt-18">
        {children}
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
