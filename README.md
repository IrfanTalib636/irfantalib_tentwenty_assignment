# moviesNature

Expo SDK 57 app for browsing movies from The Movie Database (TMDB). This file records the setup completed so far, in order.

## 1. Environment variables

Installed `@expo/env` **2.4.3**, the version already used by Expo SDK 57.

Added a root `.env` file. The API base URL is:

```
EXPO_PUBLIC_BASE_URL=https://api.themoviedb.org/3
```

Expo only inlines variables that start with `EXPO_PUBLIC_` into the app, so the original `BASE_URL` name was changed to `EXPO_PUBLIC_BASE_URL`.

## 2. HTTP client

Installed `axios` **1.20.0**.

Created `src/api/apiClient.ts`:

- Reads `EXPO_PUBLIC_BASE_URL`.
- Sets a 15 second timeout and JSON headers.
- Request interceptor attaches TMDB auth (see step 7).
- Response interceptor turns failed requests into an `ApiError` with the HTTP status and the server message.

## 3. Response caching

Installed `@tanstack/react-query` **5.104.0**, which supports React 19.

Created `src/api/queryClient.ts`. Queries stay fresh for 5 minutes and stay in memory for 30 minutes, so the same screen does not call the API again while the data is still fresh.

`App.js` is wrapped in `QueryClientProvider`.

## 4. Poppins and linear gradient

Installed packages compatible with SDK 57:

- `@expo-google-fonts/poppins` **0.4.1**
- `expo-font` **57.0.4**
- `expo-splash-screen` **57.0.9**
- `expo-linear-gradient` **57.0.2**

`src/fonts/usePoppins.ts` loads every Poppins weight from Thin (100) through Black (900), including italics. `App.js` keeps the splash screen up until those fonts are ready.

Use a face by its family name, for example `Poppins_400Regular` or `Poppins_700Bold`.

`expo-linear-gradient` is used on the movie cards so the title sits on a dark fade.

## 5. Colors

Added `COLORS` in `src/enums/AppEnum.ts`:

| Name | Value |
| --- | --- |
| `DARK` | `rgba(46,39,57,1)` |
| `WHITE` | `rgba(246,246,250,1)` |
| `GREY` | `rgba(130,125,136,1)` |
| `BLUE` | `rgba(97,195,242,1)` |
| `LIGHT_GREY` | `rgba(219,219,223,1)` |
| `TEAL` | `rgba(21,210,188,1)` |
| `PINK` | `rgba(226,108,165,1)` |
| `PURPLE` | `rgba(86,76,163,1)` |
| `YELLOW` | `rgba(205,157,15,1)` |

## 6. Bottom tabs and the Watch screen

Installed React Navigation for SDK 57:

- `@react-navigation/native` **7.5.0**
- `@react-navigation/bottom-tabs` **7.20.0**
- `react-native-screens` **4.26.0**
- `react-native-safe-area-context` **5.7.0**
- `@expo/vector-icons` **15.0.2**

`src/navigation/TabNavigator.tsx` creates four tabs:

- Dashboard
- Watch (opens first)
- Media Library
- More

The tab bar is a floating dark bar using `COLORS.DARK`. Dashboard, Media Library, and More are placeholder screens. Watch is implemented in `src/screens/WatchScreen.tsx`:

- Header title “Watch” and a search icon.
- Upcoming movies from `GET /movie/upcoming`.
- Each movie is a rounded backdrop card with the title over a gradient.
- Pull to refresh. Results are cached by React Query.

## 7. TMDB authentication

TMDB application auth is not a user login. Every movie request must identify the app. The official options are documented in the [getting started guide](https://developer.themoviedb.org/docs/getting-started) and [application authentication](https://developer.themoviedb.org/docs/authentication-application):

- Preferred: API Read Access Token, sent as `Authorization: Bearer <token>`.
- Alternative: API key, sent as the `api_key` query parameter.

The request interceptor in `src/api/apiClient.ts` does that automatically. If both values are set, the bearer token is used. If neither is set, the request is not sent.

API modules:

- `src/api/movies.ts` — upcoming, detail, videos, images, and search. Paths are relative to the base URL, which already includes `/3`.
- `src/api/images.ts` — builds `https://image.tmdb.org/t/p/{size}/{file_path}`. Image URLs do not use the API key.
- `src/api/movieQueries.ts` — React Query hooks for those calls.

To get a key, sign in on a desktop browser, open [TMDB API settings](https://www.themoviedb.org/settings/api), request a developer key, and copy the **API Read Access Token**. Add it to `.env`:

```
EXPO_PUBLIC_TMDB_ACCESS_TOKEN=your_read_access_token
```

Restart with a clean cache so Expo inlines the new value:

```
npx expo start --clear
```

Do not commit the token. It is readable inside the app bundle, which is expected for a TMDB client key.

## Run the app

```
npx expo start
```
