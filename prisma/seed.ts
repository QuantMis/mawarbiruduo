import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TierData {
  readonly namaTier: string;
  readonly bilanganPax: number;
  readonly harga: number;
}

interface SectionData {
  readonly tajuk: string;
  readonly items: readonly string[];
}

interface PakejData {
  readonly namaPakej: string;
  readonly warna: string;
  readonly tiers: readonly TierData[];
  readonly sections: readonly SectionData[];
}

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!email || !passwordHash) {
    console.log(
      'Skipping admin seed: ADMIN_EMAIL or ADMIN_PASSWORD_HASH not set.',
    );
    return;
  }

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, nama: 'Admin' },
    create: { email, passwordHash, nama: 'Admin' },
  });

  console.log(`Admin user upserted: ${email}`);
}

async function seedPakej(data: PakejData): Promise<void> {
  const pakej = await prisma.pakej.upsert({
    where: { namaPakej: data.namaPakej },
    update: { warna: data.warna },
    create: { namaPakej: data.namaPakej, warna: data.warna },
  });

  // Delete existing tiers and sections, then recreate
  await prisma.pakejTier.deleteMany({ where: { pakejId: pakej.id } });
  await prisma.pakejSection.deleteMany({ where: { pakejId: pakej.id } });

  await prisma.pakejTier.createMany({
    data: data.tiers.map((tier) => ({
      pakejId: pakej.id,
      namaTier: tier.namaTier,
      bilanganPax: tier.bilanganPax,
      harga: tier.harga,
    })),
  });

  await prisma.pakejSection.createMany({
    data: data.sections.map((section) => ({
      pakejId: pakej.id,
      tajuk: section.tajuk,
      items: section.items as unknown as string[],
    })),
  });

  console.log(`Pakej seeded: ${data.namaPakej}`);
}

const nightWedding: PakejData = {
  namaPakej: 'Night Wedding',
  warna: '#07203F',
  tiers: [
    { namaTier: '300 PAX', bilanganPax: 300, harga: 15500 },
    { namaTier: '500 PAX', bilanganPax: 500, harga: 18500 },
    { namaTier: '800 PAX', bilanganPax: 800, harga: 21500 },
  ],
  sections: [
    {
      tajuk: 'Menu Kenduri',
      items: [
        'Nasi Putih 30%',
        'Nasi Minyak / Nasi Briyani / Nasi Hujan Panas 70%',
        'Ayam Masak Merah / Ayam Goreng Berempah / Ayam Masak Black Pepper',
        'Daging Hitam Masam Manis / Daging Palembang',
        'Dalca Sayur / Pajeri Nenas',
        'Acar Jelatah / Acar Rampai',
        'Acar Buah 20%',
        'Bubur Kacang 30%',
        'Buah 2 Jenis',
        'Air Teh O & Kopi O Panas',
        'Air Kordial Sirap',
        'Air Mineral',
      ],
    },
    {
      tajuk: 'Menu Kampung',
      items: [
        'Nasi Putih 100%',
        'Ayam Masak Kicap / Ayam Goreng Berempah',
        'Daging Lemak Cili Api / Daging Kurma',
        'Gulai Nenas Ikan Masin / Nenas Bombey',
        'Kobis Mamak / Kerabu Sayur',
        'Sambal Belacan 20%',
        'Ikan Masin',
        'Bubur Kacang 30%',
        'Buah 2 Jenis',
        'Air Teh O & Kopi O Panas',
        'Air Kordial Sirap',
        'Air Mineral',
      ],
    },
    {
      tajuk: 'Termasuk',
      items: [
        '4 Set Dome VIP',
        'Set Hidangan Pengantin',
        'Kek 3 Tingkat (Coklat, Vanilla, Strawberi)',
        'Pramusaji',
        'Peralatan Katering',
        'Makeup Sanding Pengantin Perempuan',
        'Grooming Pengantin Lelaki',
        'PA Sistem & Emcee',
        'Set Pelamin Dewan (Fixed)',
        'Full Dewan Berhawa Dingin',
        'Rela & Parking',
        'Kemudahan Awam',
      ],
    },
    {
      tajuk: 'Percuma',
      items: [
        'Air Balang 3 Jenis',
        'Sepasang Baju Sanding L/P + Aksesori',
        '2 Set Khemah Tetamu',
        'Perkhidmatan Buggy',
      ],
    },
  ],
};

const pakejWedding: PakejData = {
  namaPakej: 'Pakej Wedding',
  warna: '#D9AA90',
  tiers: [
    { namaTier: 'Seroja', bilanganPax: 500, harga: 20500 },
    { namaTier: 'Melur', bilanganPax: 800, harga: 23500 },
    { namaTier: 'Teratai', bilanganPax: 1000, harga: 25500 },
  ],
  sections: [
    {
      tajuk: 'Menu Kenduri',
      items: [
        'Nasi Putih 30%',
        'Nasi Minyak / Nasi Briyani / Nasi Hujan Panas 70%',
        'Ayam Masak Merah / Ayam Goreng Berempah / Ayam Masak Black Pepper',
        'Daging Hitam Masam Manis / Daging Palembang / Daging Masak Merah',
        'Dalca Sayur / Pajeri Nenas',
        'Acar Jelatah / Acar Rampai',
        'Papadom',
        'Acar Buah 20%',
        'Kuih 2 Jenis / Bubur 30%',
        'Buah 2 Jenis',
        'Air Teh O & Kopi O Panas',
        'Air Kordial Sirap / Sirap Oren / Sarsi / Anggur',
        'Air Mineral',
      ],
    },
    {
      tajuk: 'Menu Kampung',
      items: [
        'Nasi Putih 100%',
        'Ayam Masak Kicap / Ayam Goreng Berempah',
        'Daging Lemak Cili Api / Daging Kurma / Daging Kari',
        'Gulai Nenas Ikan Masin / Nenas Bombey',
        'Sambal Goreng Jawa / Kobis Mamak / Kerabu Sayur',
        'Sambal Belacan 20%',
        'Ikan Masin',
        'Kuih 2 Jenis / Bubur 30%',
        'Buah 2 Jenis',
        'Air Teh O & Kopi O Panas',
        'Air Kordial Sirap / Sirap Oren / Sarsi / Anggur',
        'Air Mineral',
      ],
    },
    {
      tajuk: 'Termasuk',
      items: [
        '4 Set Dome VIP',
        'Set Hidangan Pengantin',
        'Kek 3 Tingkat (Coklat / Vanilla / Strawberi)',
        'Pramusaji',
        'Peralatan Katering',
        'Makeup Sanding Pengantin Perempuan',
        'Grooming Pengantin Lelaki',
        'PA Sistem & Emcee',
        'Set Pelamin Dewan (Fixed)',
        'Full Dewan Berhawa Dingin',
        'Kemudahan Awam',
        'Rela & Parking',
        'Homestay Bakawali',
      ],
    },
    {
      tajuk: 'Percuma',
      items: [
        'Air Balang 3 Jenis',
        'Aiskrim 300 Cone',
        'Sepasang Baju Sanding L/P + Aksesori',
        '2 Set Khemah Tetamu',
        'Perkhidmatan Buggy',
      ],
    },
  ],
};

const eventPackage: PakejData = {
  namaPakej: 'Event Package',
  warna: '#A65E46',
  tiers: [
    { namaTier: 'Breakfast', bilanganPax: 1, harga: 10 },
    { namaTier: 'Lunch', bilanganPax: 1, harga: 23 },
    { namaTier: 'Hi-Tea', bilanganPax: 1, harga: 23 },
    { namaTier: 'Dinner', bilanganPax: 1, harga: 23 },
    { namaTier: 'Hall Rental (3 Hours)', bilanganPax: 0, harga: 2500 },
    { namaTier: 'Hall Rental (5 Hours)', bilanganPax: 0, harga: 4000 },
  ],
  sections: [
    {
      tajuk: 'Breakfast',
      items: [
        'Nasi Lemak / Bihun Goreng',
        'Sambal Kosong',
        'Telur Mata',
        'Kuih 2 Jenis',
        'Teh Tarik',
      ],
    },
    {
      tajuk: 'Lunch',
      items: [
        'Nasi Putih',
        'Ayam Palembang',
        'Daging Lemak Cili Api',
        'Ikan Fillet Sweet Sour',
        'Sayur Campur',
        'Sambal Belacan',
        'Kuih 2 Jenis',
        'Buah 2 Jenis',
        'Teh O & Teh Tarik',
        'Air Sirap Sejuk',
      ],
    },
    {
      tajuk: 'Hi-Tea',
      items: [
        'Nasi Goreng Cina',
        'Ayam Goreng Popcorn',
        'Spaghetti Aglio Olio',
        'Roti Jala & Kuih Kari',
        'Roti Perancis & Mushroom Soup',
        'Kuih 2 Jenis',
        'Buah 2 Jenis',
        'Teh O & Teh Tarik',
        'Air Sirap Sejuk',
      ],
    },
    {
      tajuk: 'Dinner',
      items: [
        'Nasi Putih',
        'Ayam Paprik',
        'Daging Merah Thai',
        'Gulai Nenas Udang Cendawan',
        'Sayur Campur',
        'Sambal Belacan',
        'Kuih 2 Jenis',
        'Buah 2 Jenis',
        'Kopi O & Teh Tarik',
        'Air Sirap Sejuk',
      ],
    },
    {
      tajuk: 'Hall Rental',
      items: [
        'Berhawa Dingin',
        'Pentas Berdeko',
        'PA Sistem Tanpa Emcee',
        'Dome VIP (1)',
        'Pelayan Am',
      ],
    },
  ],
};

async function seedSlotTemujanji(): Promise<void> {
  const today = new Date();
  const slots: { tarikh: Date; masaMula: string; masaTamat: string }[] = [];

  // Create slots for the next 14 days, 3 slots per day
  for (let d = 0; d < 14; d++) {
    const date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + d),
    );

    slots.push(
      { tarikh: date, masaMula: '10:00', masaTamat: '12:00' },
      { tarikh: date, masaMula: '14:00', masaTamat: '16:00' },
      { tarikh: date, masaMula: '16:00', masaTamat: '18:00' },
    );
  }

  for (const slot of slots) {
    const existing = await prisma.slotTemujanji.findFirst({
      where: {
        tarikh: slot.tarikh,
        masaMula: slot.masaMula,
      },
    });

    if (!existing) {
      await prisma.slotTemujanji.create({ data: slot });
    }
  }

  console.log(`Slot temujanji seeded: ${slots.length} slots (14 days x 3 per day)`);
}

async function seedSlotTempahan(): Promise<void> {
  const today = new Date();
  let created = 0;

  // Create venue slots for the next 60 days (skip past dates)
  for (let d = 0; d < 60; d++) {
    const date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + d),
    );

    const existing = await prisma.slotTempahan.findFirst({
      where: { tarikh: date },
    });

    if (!existing) {
      await prisma.slotTempahan.create({
        data: { tarikh: date },
      });
      created++;
    }
  }

  console.log(`Slot tempahan seeded: ${created} new slots (60 days)`);
}

async function main(): Promise<void> {
  console.log('Seeding database...');

  await seedAdmin();
  await seedPakej(nightWedding);
  await seedPakej(pakejWedding);
  await seedPakej(eventPackage);
  await seedSlotTemujanji();
  await seedSlotTempahan();

  console.log('Seeding complete.');
}

main()
  .catch((e: unknown) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
