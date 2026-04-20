import { z } from 'zod';

export const createSlotTempahanSchema = z.object({
  tarikh: z
    .string({ error: 'Tarikh diperlukan' })
    .date('Format tarikh tidak sah (cth: 2026-01-15)'),
});

export type CreateSlotTempahanInput = z.infer<typeof createSlotTempahanSchema>;

export const bulkCreateSlotTempahanSchema = z
  .object({
    startDate: z
      .string({ error: 'Tarikh mula diperlukan' })
      .date('Format tarikh tidak sah (cth: 2026-01-15)'),
    endDate: z
      .string({ error: 'Tarikh akhir diperlukan' })
      .date('Format tarikh tidak sah (cth: 2026-01-15)'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'Tarikh akhir mestilah sama atau selepas tarikh mula',
    path: ['endDate'],
  });

export type BulkCreateSlotTempahanInput = z.infer<typeof bulkCreateSlotTempahanSchema>;

export const updateSlotTempahanSchema = z.object({
  status: z.enum(['TERSEDIA', 'DITEMPAH', 'DIBATALKAN'], {
    error: 'Status tidak sah',
  }),
});

export type UpdateSlotTempahanInput = z.infer<typeof updateSlotTempahanSchema>;
