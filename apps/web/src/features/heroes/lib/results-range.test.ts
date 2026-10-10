import { resultsRange } from './results-range';

describe('resultsRange', () => {
  it('describes the first page', () => {
    expect(
      resultsRange({ page: 1, limit: 10, total: 23, total_pages: 3 }),
    ).toBe('1–10 de 23');
  });

  it('does not go beyond the total on the last page', () => {
    expect(
      resultsRange({ page: 3, limit: 10, total: 23, total_pages: 3 }),
    ).toBe('21–23 de 23');
  });

  it('handles an empty list', () => {
    expect(resultsRange({ page: 1, limit: 10, total: 0, total_pages: 0 })).toBe(
      '0 de 0',
    );
  });
});
