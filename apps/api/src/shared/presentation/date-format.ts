const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?: 00:00:00)?$/;

export function formatDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function formatDateOnly(date: Date): string {
  return `${date.toISOString().slice(0, 10)} 00:00:00`;
}

export function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  const isSameDay =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return isSameDay ? date : null;
}
