import { z } from 'zod';

export const temujanjiSchema = z.object({
  nama: z
    .string({ error: 'Nama diperlukan' })
    .min(2, 'Nama mestilah sekurang-kurangnya 2 aksara')
    .max(100, 'Nama mestilah tidak melebihi 100 aksara'),
  noTelefon: z
    .string({ error: 'No. telefon diperlukan' })
    .regex(
      /^(\+?60)?0?1[0-9]-?[0-9]{7,8}$/,
      'Sila masukkan nombor telefon Malaysia yang sah (cth: 0121234567)',
    ),
  nota: z
    .string()
    .max(500, 'Nota mestilah tidak melebihi 500 aksara')
    .optional(),
  slotTemujanjiId: z.string({ error: 'Slot temujanji diperlukan' }),
});

export type TemujanjiInput = z.infer<typeof temujanjiSchema>;
