import { findPlayableTrailer, readTrailerPlayerSignal, trailerPlayerHtml, TRAILER_EMBED_ORIGIN } from '../trailerPlayer';

describe('trailer player', () => {
  it('builds an autoplaying player for a YouTube id', () => {
    const html = trailerPlayerHtml('abc12345');

    expect(html).toContain('https://www.youtube.com/embed/abc12345?autoplay=1');
    expect(html).toContain(`origin=${encodeURIComponent(TRAILER_EMBED_ORIGIN)}`);
    expect(html).toContain('referrerpolicy="strict-origin-when-cross-origin"');
    expect(html).toContain("post('ended')");
    expect(TRAILER_EMBED_ORIGIN).not.toContain('youtube.com');
  });

  it('rejects an id that cannot be embedded safely', () => {
    expect(trailerPlayerHtml('not a video')).toBeNull();
  });

  it('closes when the trailer ends and reports playback failures', () => {
    expect(readTrailerPlayerSignal('ended')).toBe('ended');
    expect(readTrailerPlayerSignal('error')).toBe('error');
    expect(readTrailerPlayerSignal('ready')).toBe('ready');
    expect(readTrailerPlayerSignal('other')).toBeNull();
  });

  it('skips a trailer YouTube will not embed', async () => {
    const fetchMock = jest.fn(async (input: string) => ({
      ok: !String(input).includes('blocked1'),
    }));
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(findPlayableTrailer(['blocked1', 'playable1'])).resolves.toBe('playable1');

    globalThis.fetch = originalFetch;
  });
});