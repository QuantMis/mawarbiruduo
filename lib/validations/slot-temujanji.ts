import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeString = z
  .string({ error: 'Masa diperlukan' })
  .regex(timeRegex, 'Format masa tidak sah (cth: 09:00)');

export const createSlotSchema = z
  .object({
    tarikh: z
      .string({ error: 'Tarikh diperlukan' })
      .date('Format tarikh tidak sah (cth: 2026-01-15)'),
    masaMula: timeString,
    masaTamat: timeString,
  })
  .refine((data) => data.masaTamat > data.masaMula, {
    message: 'Masa tamat mestilah selepas masa mula',
    path: ['masaTamat'],
  });

export type CreateSlotInput = z.infer<typeof createSlotSchema>;

const slotEntry = z.object({
  masaMula: timeString,
  masaTamat: timeString,
});

export const bulkCreateSlotSchema = z
  .object({
    tarikh: z
      .string({ error: 'Tarikh diperlukan' })
      .date('Format tarikh tidak sah (cth: 2026-01-15)'),
    slots: z
      .array(slotEntry, { error: 'Senarai slot diperlukan' })
      .min(1, 'Sekurang-kurangnya satu slot diperlukan'),
  })
  .refine(
    (data) => data.slots.every((s) => s.masaTamat > s.masaMula),
    {
      message: 'Masa tamat mestilah selepas masa mula untuk semua slot',
      path: ['slots'],
    },
  );

export type BulkCreateSlotInput = z.infer<typeof bulkCreateSlotSchema>;

export const updateSlotSchema = z
  .object({
    tarikh: z
      .string()
      .date('Format tarikh tidak sah (cth: 2026-01-15)')
      .optional(),
    masaMula: timeString.optional(),
    masaTamat: timeString.optional(),
  })
  .refine(
    (data) => {
      if (data.masaMula && data.masaTamat) {
        return data.masaTamat > data.masaMula;
      }
      return true;
    },
    {
      message: 'Masa tamat mestilah selepas masa mula',
      path: ['masaTamat'],
    },
  );

export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;
