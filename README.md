# moviesNature

A portrait-and-landscape movie client built with Expo SDK 57 and React Native’s New Architecture. It browses upcoming titles from TMDB, opens a detail screen with an in-app trailer, and walks through ticket times into a seat map. Booking and payment stop at the UI: the assessment asked for layout, states, and precision there, not a checkout.

## Brief

The work was specified as four screens. Each one had to cover loading, empty, and error, and none of them was allowed to hand the user a blank view.

**Watch.** The home tab lists upcoming movies. A search control replaces that list with a two-column genre grid. Typing shows top results; submitting the query shows a counted result list. Both lists reveal ten titles at a time and load the next ten as the user reaches the end.

**Movie detail.** Selecting a title opens the film, its genres, and its overview, with tickets and a trailer. The trailer plays full screen inside the app, starts on its own, returns to the detail screen when it finishes, and can be dismissed at any point.

**Tickets.** Get Tickets opens the selected film with a horizontal date strip and four or five showtimes for that day. Times scroll sideways. The selected time is visually distinct. Select Seats continues into the map.

**Seat map.** A layout-only screen: the theatre image, row numbers, a legend, the current selection, and a total. No booking, no persistence, and no payment.

## How it was built

I started with the data layer, because every screen reads the same cache. TMDB is called through one Axios client. The base URL and read token come from `EXPO_PUBLIC_` variables, and the client attaches the bearer token itself. React Query holds the results for five minutes, keeps them for a day, and writes them to AsyncStorage. Queries use `networkMode: 'offlineFirst'` and refetch when the connection returns, so a failed refresh still shows the last saved list instead of an empty screen.

Navigation is a native stack over bottom tabs. Watch is the initial tab. Dashboard, Media Library, and More are explicit placeholders so the tab bar matches the product shell without pretending those sections are finished. Detail, tickets, and the seat map are stack screens pushed from Watch.

Lists do not render a TMDB page as-is. The API returns twenty rows, and the same film can appear on more than one page. The UI keeps a window of ten, dedupes by id, and asks for the next page only after the loaded rows are used up. A fast fling cannot request the same page twice, which is what was producing duplicate React keys. Search, genre browse, and the upcoming list share that window.

The trailer does not leave the app. YouTube will not play inside `expo-video`, and scraping a stream is the wrong trade. The player is the official iframe, hosted in a WebView whose referrer is this app rather than `youtube.com`. YouTube rejects an embed that claims to be YouTube, and some official trailers simply cannot be embedded. Before opening the player, the app asks YouTube’s oEmbed endpoint which key will play, and skips the ones that will not. When the iframe reports that playback ended, the modal closes. A close control and the Android back gesture do the same thing. If nothing can be played, the detail screen says so.

Showtimes are generated locally from the movie and the selected day. The same inputs always produce the same four or five times, halls, and prices, so the screen is stable without a ticketing API the brief did not provide. The seat map then shows that choice: date, time, and hall in the header, the seat image centred at 90% of the width, and row numbers fixed to the left edge. Zoom and the selected-seat chip are view state only. Proceed to pay does not navigate.

Colour is not scattered through styles. Every value used by a screen, the tab bar, or the trailer page lives in `src/enums/AppEnum.ts` and is imported from there.

## Screens and modules

| Surface | Module | Data |
| --- | --- | --- |
| Watch, search, genres | `src/screens/WatchScreen.tsx` | `GET /movie/upcoming`, `/search/movie`, `/genre/movie/list`, `/discover/movie` |
| Detail and trailer | `src/screens/MovieDetailsScreen.tsx`, `trailerPlayer.ts` | `GET /movie/{id}`, `/videos` |
| Tickets | `src/screens/MovieTicketsScreen.tsx`, `showtimes.ts` | Movie detail, plus a stable local schedule |
| Seat map | `src/screens/SeatMapScreen.tsx` | Movie detail for the title; the map itself is `src/assets/images/seatsImage.png` |

Shared list behaviour is in `src/screens/watchState.ts`. Copy and view-state decisions for search and genres are in `src/screens/genreBrowse.ts`. Image URLs are built in `src/api/images.ts` and do not carry the API token.

## Run

Create `.env` in the project root. Expo only inlines names that start with `EXPO_PUBLIC_`.

```
EXPO_PUBLIC_BASE_URL=https://api.themoviedb.org/3
EXPO_PUBLIC_TMDB_ACCESS_TOKEN=your_read_access_token
```

The token is a TMDB read access token, sent as `Authorization: Bearer`. Request one from the TMDB API settings page. Do not commit it. Restart with a clean cache after changing `.env`:

```
npx expo start --clear
```

A development build is required for the in-app trailer, because `react-native-webview` is a native module:

```
npx expo run:android
npx expo run:ios
```

Check the project before calling it done:

```
npm test
npx expo lint
npx tsc --noEmit
```

Tests sit next to the code in `__tests__` and describe behaviour: view states, the ten-item window, trailer signals, ticket navigation, and the seat summary.
