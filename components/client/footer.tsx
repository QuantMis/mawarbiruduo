import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Stack } from '@/components/ui/stack';

const FOOTER_LINKS = [
  { label: 'Utama', href: '/' },
  { label: 'Pakej', href: '/pakej' },
  { label: 'Temujanji', href: '/temujanji' },
  { label: 'Kalendar', href: '/kalendar' },
] as const;

const WHATSAPP_NUMBER = '+60123456789';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, '')}`;

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-navy text-cream">
      <div className="h-[1px] bg-dusty-rose" aria-hidden="true" />

      <Container className="py-12 lg:py-16">
        <Grid
          cols={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap="gap-8 lg:gap-12"
          className="text-center md:text-left"
        >
          <Stack gap="gap-3" align="items-center md:items-start">
            <span className="font-serif text-xl font-semibold tracking-wide">
              MawarBiru
            </span>
            <p className="text-sm text-cream/70">
              Dewan Perkahwinan & Acara Eksklusif
            </p>
          </Stack>

          <nav aria-label="Navigasi footer">
            <Stack gap="gap-3" align="items-center md:items-start">
              <span className="text-sm font-semibold uppercase tracking-wider text-cream/50">
                Pautan
              </span>
              <ul className="space-y-2">
                {FOOTER_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-cream transition-colors hover:text-dusty-rose"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Stack>
          </nav>

          <Stack gap="gap-3" align="items-center md:items-start">
            <span className="text-sm font-semibold uppercase tracking-wider text-cream/50">
              Hubungi Kami
            </span>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream transition-colors hover:text-dusty-rose"
                >
                  WhatsApp: {WHATSAPP_NUMBER}
                </a>
              </li>
              <li className="text-cream/70">
                Alamat akan dikemaskini
              </li>
              <li className="text-cream/70">
                Isnin - Ahad: 9:00 AM - 6:00 PM
              </li>
            </ul>
          </Stack>
        </Grid>

        <div className="mt-8 border-t border-cream/20 pt-6 text-center">
          <p className="text-xs text-cream/50">
            &copy; 2026 MawarBiru. Hak cipta terpelihara.
          </p>
        </div>
      </Container>
    </footer>
  );
}
