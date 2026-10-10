import {
  calculateAge,
  formatDate,
  formatDateTime,
  toDateInputValue,
  todayAsDateInputValue,
} from './date';

describe('date helpers', () => {
  it('converts the API date to the value of a date input', () => {
    expect(toDateInputValue('1962-04-10 00:00:00')).toBe('1962-04-10');
  });

  it('formats a date in the Brazilian format without time zone shifts', () => {
    expect(formatDate('1962-04-10 00:00:00')).toBe('10/04/1962');
  });

  it('calculates the age considering whether the birthday has passed', () => {
    expect(calculateAge('1962-04-10', new Date(2026, 3, 9))).toBe(63);
    expect(calculateAge('1962-04-10', new Date(2026, 3, 10))).toBe(64);
  });

  it('formats API timestamps (UTC) in the local time zone', () => {
    const expected = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date('2024-09-18T21:41:43Z'));

    expect(formatDateTime('2024-09-18 21:41:43')).toBe(expected);
  });

  it('builds today as YYYY-MM-DD in local time', () => {
    expect(todayAsDateInputValue(new Date(2026, 9, 9))).toBe('2026-10-09');
  });
});
