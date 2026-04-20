interface CalendarDay {
  readonly date: Date;
  readonly isCurrentMonth: boolean;
  readonly isToday: boolean;
}

/**
 * Generate an array of calendar days for a given month/year.
 * Always starts from Sunday and ends on Saturday, producing 5 or 6 rows.
 */
export function getCalendarDays(month: number, year: number): readonly CalendarDay[] {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const firstOfMonth = new Date(year, month - 1, 1);
  const lastOfMonth = new Date(year, month, 0);

  // Start from Sunday of the first week
  const startDate = new Date(firstOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // End on Saturday of the last week
  const endDate = new Date(lastOfMonth);
  const daysUntilSaturday = 6 - endDate.getDay();
  endDate.setDate(endDate.getDate() + daysUntilSaturday);

  const days: CalendarDay[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const cursorStr = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    days.push({
      date: new Date(cursor),
      isCurrentMonth: cursor.getMonth() === month - 1 && cursor.getFullYear() === year,
      isToday: cursorStr === todayStr,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

/**
 * Get the visible date range for a calendar month grid (Sunday start to Saturday end).
 * Returns start and end dates for querying bookings.
 */
export function getCalendarDateRange(
  month: number,
  year: number,
): { readonly start: Date; readonly end: Date } {
  const firstOfMonth = new Date(year, month - 1, 1);
  const lastOfMonth = new Date(year, month, 0);

  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(lastOfMonth);
  const daysUntilSaturday = 6 - end.getDay();
  end.setDate(end.getDate() + daysUntilSaturday);

  return { start, end };
}
