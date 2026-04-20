import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return { start, end };
}

function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  return { start, end };
}

function formatTarikh(date: Date): string {
  return date.toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusBadgeVariant(
  status: string,
): "default" | "success" | "warning" | "error" {
  switch (status) {
    case "TERSEDIA":
      return "success";
    case "DITEMPAH":
      return "default";
    case "DIBATALKAN":
      return "error";
    default:
      return "default";
  }
}

export default async function DashboardPage() {
  const { start: todayStart, end: todayEnd } = getTodayRange();
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange();

  const [
    temujanjiHariIni,
    tempahanBulanIni,
    jumlahPelanggan,
    jumlahPakej,
    recentTemujanji,
    recentTempahan,
  ] = await Promise.all([
    prisma.temujanji.count({
      where: {
        slotTemujanji: {
          tarikh: { gte: todayStart, lt: todayEnd },
        },
      },
    }),
    prisma.tempahan.count({
      where: {
        slotTempahan: {
          tarikh: { gte: monthStart, lt: monthEnd },
        },
      },
    }),
    prisma.pelanggan.count(),
    prisma.pakej.count(),
    prisma.temujanji.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        pelanggan: { select: { nama: true } },
        slotTemujanji: { select: { tarikh: true, status: true } },
      },
    }),
    prisma.tempahan.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        slotTempahan: { select: { tarikh: true } },
        pakej: { select: { namaPakej: true } },
      },
    }),
  ]);

  const cards = [
    {
      title: "Temujanji Hari Ini",
      count: temujanjiHariIni,
      href: "/admin/temujanji",
    },
    {
      title: "Tempahan Bulan Ini",
      count: tempahanBulanIni,
      href: "/admin/tempahan",
    },
    {
      title: "Jumlah Pelanggan",
      count: jumlahPelanggan,
      href: "/admin/pelanggan",
    },
    {
      title: "Jumlah Pakej",
      count: jumlahPakej,
      href: "/admin/pakej",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>

      {/* Count Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="bg-white hover:shadow-elevated">
              <CardBody>
                <p className="text-sm text-navy/60">{card.title}</p>
                <p className="mt-1 text-3xl font-bold text-navy">
                  {card.count}
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Temujanji */}
        <Card className="bg-white">
          <CardHeader>
            <h2 className="text-lg font-semibold text-navy">
              Temujanji Terkini
            </h2>
          </CardHeader>
          <CardBody>
            {recentTemujanji.length === 0 ? (
              <p className="text-sm text-navy/60">Tiada temujanji.</p>
            ) : (
              <ul className="divide-y divide-navy/10">
                {recentTemujanji.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy">
                        {t.pelanggan.nama}
                      </p>
                      <p className="text-xs text-navy/60">
                        {formatTarikh(t.slotTemujanji.tarikh)}
                      </p>
                    </div>
                    <Badge variant={statusBadgeVariant(t.slotTemujanji.status)}>
                      {t.slotTemujanji.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Recent Tempahan */}
        <Card className="bg-white">
          <CardHeader>
            <h2 className="text-lg font-semibold text-navy">
              Tempahan Terkini
            </h2>
          </CardHeader>
          <CardBody>
            {recentTempahan.length === 0 ? (
              <p className="text-sm text-navy/60">Tiada tempahan.</p>
            ) : (
              <ul className="divide-y divide-navy/10">
                {recentTempahan.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy">
                        {t.namaTempahan}
                      </p>
                      <p className="text-xs text-navy/60">
                        {formatTarikh(t.slotTempahan.tarikh)} &middot;{" "}
                        {t.pakej.namaPakej}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
