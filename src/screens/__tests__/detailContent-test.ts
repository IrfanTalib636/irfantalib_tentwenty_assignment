import type { MovieVideo } from '../../api/movies';
import { formatInTheaters, pickTrailer, trailerUrl } from '../detailContent';

const trailer: MovieVideo = {
  id: '1',
  key: 'abc123',
  name: 'Official Trailer',
  site: 'YouTube',
  type: 'Trailer',
  official: true,
};

describe('movie details', () => {
  it('formats a release date as an in-theaters line', () => {
    expect(formatInTheaters('2021-12-22')).toBe('In Theaters December 22, 2021');
  });

  it('prefers the official YouTube trailer', () => {
    const teaser: MovieVideo = { ...trailer, id: '2', key: 'teaser', type: 'Teaser', official: true };
    const unofficial: MovieVideo = { ...trailer, id: '3', key: 'fan', official: false };

    expect(pickTrailer([teaser, unofficial, trailer])?.key).toBe('abc123');
    expect(trailerUrl('abc123')).toBe('https://www.youtube.com/watch?v=abc123');
  });
});
