'use client';

import { useState } from 'react';
import { SlotTempahanCalendar } from '@/components/admin/slot-tempahan/slot-tempahan-calendar';
import { SlotTempahanList } from '@/components/admin/slot-tempahan/slot-tempahan-list';

type ViewMode = 'calendar' | 'list';

export default function SlotTempahanPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy">Slot Tempahan</h1>
        <div className="flex gap-1 rounded-lg bg-navy/5 p-1">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-navy shadow-sm'
                : 'text-navy/60 hover:text-navy'
            }`}
          >
            Kalendar
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-navy shadow-sm'
                : 'text-navy/60 hover:text-navy'
            }`}
          >
            Senarai
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? <SlotTempahanCalendar /> : <SlotTempahanList />}
    </div>
  );
}
