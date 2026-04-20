export type PakejTier = {
  nama: string;
  bilanganPax: number;
  harga: number;
  perPax?: boolean;
};

export type PakejSection = {
  tajuk: string;
  items: string[];
};

export type Pakej = {
  nama: string;
  warna: string;
  penerangan: string;
  tiers: PakejTier[];
  sections: PakejSection[];
};

export const senaraiPakej: readonly Pakej[] = [
  {
    nama: 'Night Wedding',
    warna: '#07203F',
    penerangan:
      'Pakej perkahwinan malam yang lengkap dengan katering, pelamin, dan kemudahan dewan.',
    tiers: [
      { nama: '300 PAX', bilanganPax: 300, harga: 15_500 },
      { nama: '500 PAX', bilanganPax: 500, harga: 18_500 },
      { nama: '800 PAX', bilanganPax: 800, harga: 21_500 },
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
  },
  {
    nama: 'Pakej Wedding',
    warna: '#D9AA90',
    penerangan:
      'Pakej perkahwinan premium dengan pelbagai pilihan menu dan kemudahan tambahan.',
    tiers: [
      { nama: 'Seroja', bilanganPax: 500, harga: 20_500 },
      { nama: 'Melur', bilanganPax: 800, harga: 23_500 },
      { nama: 'Teratai', bilanganPax: 1000, harga: 25_500 },
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
  },
  {
    nama: 'Event Package',
    warna: '#A65E46',
    penerangan:
      'Pakej acara fleksibel untuk sarapan, makan tengah hari, hi-tea, makan malam, dan sewaan dewan.',
    tiers: [
      { nama: 'Breakfast', bilanganPax: 1, harga: 10, perPax: true },
      { nama: 'Lunch', bilanganPax: 1, harga: 23, perPax: true },
      { nama: 'Hi-Tea', bilanganPax: 1, harga: 23, perPax: true },
      { nama: 'Dinner', bilanganPax: 1, harga: 23, perPax: true },
      {
        nama: 'Hall Rental (3 Hours)',
        bilanganPax: 0,
        harga: 2_500,
        perPax: false,
      },
      {
        nama: 'Hall Rental (5 Hours)',
        bilanganPax: 0,
        harga: 4_000,
        perPax: false,
      },
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
  },
] as const;
