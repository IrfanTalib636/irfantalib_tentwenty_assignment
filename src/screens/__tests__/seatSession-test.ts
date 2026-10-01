import { seatSessionLabel } from '../seatSession';

describe('seat session label', () => {
  it('shows the selected date, time, and hall', () => {
    expect(seatSessionLabel('2021-03-05', '12:30', 'Cinetech + Hall 1')).toBe(
      'March 5, 2021 | 12:30 Hall 1',
    );
  });
});
