const VIDEO_ID = /^[\w-]{6,20}$/;

/** Page origin sent to YouTube. It must be this app, not youtube.com. */
export const TRAILER_EMBED_ORIGIN = 'https://com.irfanfaizi.moviesNature';

export type TrailerPlayerSignal = 'ready' | 'ended' | 'error';

export function readTrailerPlayerSignal(message: string): TrailerPlayerSignal | null {
  if (message === 'ready' || message === 'ended' || message === 'error') {
    return message;
  }

  return null;
}

export function trailerPlayerHtml(videoId: string) {
  if (!VIDEO_ID.test(videoId)) {
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&enablejsapi=1&origin=${encodeURIComponent(TRAILER_EMBED_ORIGIN)}`;

  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body { margin: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
      iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <iframe
      id="player"
      src="${embedUrl}"
      allow="autoplay; encrypted-media; fullscreen"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
    <script>
      var frame = document.getElementById('player');
      function post(message) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(message);
      }
      function command(func, args) {
        frame.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: func,
          args: args,
          id: 'player'
        }), '*');
      }
      frame.addEventListener('load', function () {
        frame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'player' }), '*');
        command('addEventListener', ['onReady']);
        command('addEventListener', ['onStateChange']);
        command('addEventListener', ['onError']);
        command('playVideo', []);
        post('ready');
      });
      window.addEventListener('message', function (event) {
        var data = event.data;
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (error) { return; }
        }
        if (!data || !data.event) return;
        if (data.event === 'onStateChange' && data.info === 0) post('ended');
        if (data.event === 'onError') post('error');
      });
    </script>
  </body>
</html>`;
}

export async function findPlayableTrailer(videoIds: string[]) {
  const ids = videoIds.filter((id) => VIDEO_ID.test(id)).slice(0, 12);

  for (const id of ids) {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
      );
      if (response.ok) {
        return id;
      }
    } catch {
      return id;
    }
  }

  return null;
}
