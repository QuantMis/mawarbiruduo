import Link from 'next/link';
import {
  Section,
  Container,
  SectionTitle,
  Text,
} from '@/components/ui';

const ctaBase =
  'inline-flex items-center justify-center gap-2 font-sans font-medium rounded-button transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-dusty-rose px-6 py-3 text-base';

export default function Home() {
  return (
    <>
      {/* Hero section */}
      <section
        className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-navy to-navy-dark flex items-center"
        data-testid="hero-section"
      >
        <Container className="flex flex-col items-center text-center">
          <div className="motion-safe:animate-fade-in">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-cream font-bold">
              MawarBiru
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-cream/80">
              Dewan Perkahwinan &amp; Acara Eksklusif
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link
                href="/temujanji"
                className={`${ctaBase} bg-dusty-rose text-dark hover:bg-dusty-rose-dark w-full sm:w-auto`}
              >
                Buat Temujanji
              </Link>
              <Link
                href="/kalendar"
                className={`${ctaBase} bg-cream text-navy border border-navy hover:bg-cream-dark w-full sm:w-auto`}
              >
                Lihat Kalendar
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Intro section */}
      <Section bg="cream" data-testid="intro-section">
        <SectionTitle title="Selamat Datang ke MawarBiru" level={2} />
        <div className="mx-auto mt-8 max-w-2xl space-y-4">
          <Text>
            MawarBiru merupakan dewan perkahwinan dan acara eksklusif yang
            menawarkan pengalaman istimewa untuk hari bahagia anda. Dengan
            suasana mewah dan perkhidmatan berkualiti tinggi, kami memastikan
            setiap majlis berjalan dengan sempurna.
          </Text>
          <Text>
            Kami menyediakan pelbagai pakej perkahwinan dan acara yang boleh
            disesuaikan mengikut keperluan anda. Daripada katering hingga
            dekorasi, semuanya diuruskan oleh pasukan profesional kami.
          </Text>
          <Text>
            Hubungi kami hari ini untuk membuat temujanji dan melihat sendiri
            kemewahan yang kami tawarkan.
          </Text>
        </div>
      </Section>
    </>
  );
}
