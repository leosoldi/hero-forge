import {
  formatDateOnly,
  formatDateTime,
  parseDateOnly,
} from './date-format.js';

describe('date-format', () => {
  describe('formatDateTime', () => {
    it('formats as "YYYY-MM-DD HH:mm:ss" in UTC, without milliseconds', () => {
      expect(formatDateTime(new Date('2024-09-18T21:41:43.987Z'))).toBe(
        '2024-09-18 21:41:43',
      );
    });
  });

  describe('formatDateOnly', () => {
    it('formats the date with a zeroed time', () => {
      expect(formatDateOnly(new Date('1962-04-10T00:00:00.000Z'))).toBe(
        '1962-04-10 00:00:00',
      );
    });
  });

  describe('parseDateOnly', () => {
    it.each(['1962-04-10', '1962-04-10 00:00:00'])(
      'parses "%s" as UTC midnight',
      (value) => {
        expect(parseDateOnly(value)?.toISOString()).toBe(
          '1962-04-10T00:00:00.000Z',
        );
      },
    );

    it('accepts February 29 on leap years', () => {
      expect(parseDateOnly('2024-02-29')?.toISOString()).toBe(
        '2024-02-29T00:00:00.000Z',
      );
    });

    it.each([
      '2026-02-31',
      '2023-02-29',
      '2026-13-01',
      '2026-00-10',
      '10/04/1962',
      '1962-4-10',
      '1962-04-10T10:00:00Z',
      '',
    ])('rejects "%s"', (value) => {
      expect(parseDateOnly(value)).toBeNull();
    });
  });
});
