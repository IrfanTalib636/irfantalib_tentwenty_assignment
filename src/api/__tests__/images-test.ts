import { getImageUrl } from '../images';

describe('getImageUrl', () => {
  it('builds a TMDB CDN url from the file path returned by the API', () => {
    expect(getImageUrl('/abc.jpg', 'w780')).toBe(
      'https://image.tmdb.org/t/p/w780/abc.jpg',
    );
  });

  it('returns null when a movie has no image', () => {
    expect(getImageUrl(null)).toBeNull();
    expect(getImageUrl(undefined)).toBeNull();
  });
});
