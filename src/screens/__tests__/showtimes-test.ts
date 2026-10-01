import { buildShowtimes, formatDateChip, ticketDates } from '../showtimes';

describe('showtimes', () => {
  it('formats a date chip as day and short month', () => {
    expect(formatDateChip(new Date(2021, 2, 5))).toBe('5 Mar');
  });

  it('builds four or five stable showtimes for a day', () => {
    const date = new Date(2021, 11, 22);
    const first = buildShowtimes(11, date);
    const second = buildShowtimes(11, date);

    expect(first.length).toBeGreaterThanOrEqual(4);
    expect(first.length).toBeLessThanOrEqual(5);
    expect(first).toEqual(second);
    expect(first[0]?.hall).toMatch(/^Cinetech \+ Hall \d$/);
    expect(ticketDates(date, 3)).toHaveLength(3);
  });
});
