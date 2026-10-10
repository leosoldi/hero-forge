const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export function toDateInputValue(apiDate: string): string {
  return apiDate.slice(0, 10);
}

export function formatDate(apiDate: string): string {
  const match = DATE_PATTERN.exec(apiDate);
  if (!match) return apiDate;

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function calculateAge(
  apiDate: string,
  today = new Date(),
): number | null {
  const match = DATE_PATTERN.exec(apiDate);
  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number);
  let age = today.getFullYear() - year;

  const hadBirthdayThisYear =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);

  if (!hadBirthdayThisYear) age -= 1;

  return age;
}

export function formatDateTime(apiDateTime: string): string {
  const date = new Date(`${apiDateTime.replace(' ', 'T')}Z`);
  if (Number.isNaN(date.getTime())) return apiDateTime;

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function todayAsDateInputValue(today = new Date()): string {
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
