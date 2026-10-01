import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState, type ReactNode } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getImageUrl } from '../api/images';
import { useGenreBrowse, useGenreMovies, useMovieSearch, useUpcomingMovies } from '../api/movieQueries';
import { type GenreCard, type Movie } from '../api/movies';
import { COLORS, GRADIENTS } from '../enums/AppEnum';
import type { RootStackParamList } from '../navigation/RootNavigator';
import {
  firstGenreName,
  GENRE_COPY,
  GENRE_MOVIE_COPY,
  getBrowseViewState,
  resultsFoundLabel,
  SEARCH_COPY,
  SEARCH_PLACEHOLDER,
  TOP_RESULTS_LABEL,
} from './genreBrowse';
import {
  getWatchViewState,
  MOVIE_PAGE_SIZE,
  uniqueMovies,
  useMoviePage,
  visibleMovies,
  WATCH_COPY,
} from './watchState';

const SEARCH_DELAY_MS = 300;

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

function MovieCard({
  movie,
  height,
  onPress,
}: {
  movie: Movie;
  height: number;
  onPress: (movie: Movie) => void;
}) {
  const imageUrl =
    getImageUrl(movie.backdrop_path, 'w780') ??
    getImageUrl(movie.poster_path, 'w500');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={movie.title}
      onPress={() => onPress(movie)}
      style={[styles.card, { height }]}
    >
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : null}
      <LinearGradient
        colors={GRADIENTS.CARD}
        style={styles.gradient}
      >
        <Text style={styles.cardTitle} numberOfLines={2}>
          {movie.title}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

function SearchResultRow({
  movie,
  genreName,
  onPress,
}: {
  movie: Movie;
  genreName: string;
  onPress: (movie: Movie) => void;
}) {
  const posterUrl = getImageUrl(movie.poster_path, 'w185');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={movie.title}
      onPress={() => onPress(movie)}
      style={styles.resultRow}
    >
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.resultPoster} />
      ) : (
        <View style={[styles.resultPoster, styles.resultPosterFallback]} />
      )}
      <View style={styles.resultCopy}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {movie.title}
        </Text>
        {genreName ? (
          <Text style={styles.resultGenre} numberOfLines={1}>
            {genreName}
          </Text>
        ) : null}
      </View>
      <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.BLUE} />
    </Pressable>
  );
}

function GenreTile({
  genre,
  width,
  height,
  onPress,
}: {
  genre: GenreCard;
  width: number;
  height: number;
  onPress: (genre: GenreCard) => void;
}) {
  const imageUrl = getImageUrl(genre.backdropPath, 'w500');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={genre.name}
      onPress={() => onPress(genre)}
      style={[styles.genreCard, { width, height }]}
    >
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : null}
      <LinearGradient
        colors={GRADIENTS.GENRE}
        style={styles.genreGradient}
      >
        <Text style={styles.genreTitle} numberOfLines={2}>
          {genre.name}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

export function WatchScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { width, height } = useWindowDimensions();
  const netInfo = useNetInfo();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const query = useUpcomingMovies();
  const upcomingPage = useMoviePage('upcoming');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [selectedGenreId, setSelectedGenreId] = useState(0);
  const debouncedQuery = useDebouncedValue(searchText.trim(), SEARCH_DELAY_MS);
  const searchPage = useMoviePage(debouncedQuery);
  const genres = useGenreBrowse(searchOpen);
  const genreMovies = useGenreMovies(searchOpen ? selectedGenreId : 0);
  const genrePage = useMoviePage(selectedGenreId);
  const search = useMovieSearch(searchOpen ? debouncedQuery : '');
  const loadedMovies = uniqueMovies(query.data?.pages?.flatMap((page) => page.results) ?? []);
  const isLandscape = width > height;
  const columns = width >= 700 ? 2 : 1;
  const cardHeight = isLandscape ? 160 : 180;
  const listWidth = Math.min(width, 960);
  const genreCardWidth = (listWidth - 40 - 12) / 2;
  const genreCardHeight = isLandscape ? 96 : 108;
  const trimmedSearch = searchText.trim();
  const loadedSearchMovies = uniqueMovies(
    search.data?.pages?.flatMap((page) => page.results) ?? [],
  );
  const loadedGenreMovies = uniqueMovies(
    genreMovies.data?.pages?.flatMap((page) => page.results) ?? [],
  );
  const searchTotal =
    debouncedQuery === trimmedSearch ? (search.data?.pages[0]?.total_results ?? null) : null;
  const offline = netInfo.isConnected === false;
  const view = getWatchViewState({
    movies: visibleMovies(loadedMovies, upcomingPage.visibleCount),
    isPending: query.isPending,
    isPaused: query.fetchStatus === 'paused',
    isError: query.isError,
    isOffline: offline,
    error: query.error,
  });
  const genreView = getBrowseViewState({
    items: genres.data ?? [],
    isPending: genres.isPending,
    isPaused: genres.fetchStatus === 'paused',
    isError: genres.isError,
    isOffline: offline,
    error: genres.error,
    copy: GENRE_COPY,
  });
  const genreMovieView = getBrowseViewState({
    items: visibleMovies(loadedGenreMovies, genrePage.visibleCount),
    isPending: genreMovies.isPending,
    isPaused: genreMovies.fetchStatus === 'paused',
    isError: genreMovies.isError,
    isOffline: offline,
    error: genreMovies.error,
    copy: GENRE_MOVIE_COPY,
  });
  const searchView = getBrowseViewState({
    items:
      debouncedQuery === trimmedSearch
        ? visibleMovies(loadedSearchMovies, searchPage.visibleCount)
        : [],
    isPending: debouncedQuery !== trimmedSearch || search.isPending,
    isPaused: search.fetchStatus === 'paused',
    isError: search.isError,
    isOffline: offline,
    error: search.error,
    copy: SEARCH_COPY,
  });

  function openMovie(movie: Movie) {
    navigation.navigate('MovieDetails', { movieId: movie.id });
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchText('');
    setSearchSubmitted(false);
    setSelectedGenreId(0);
  }

  function submitSearch() {
    if (!trimmedSearch) {
      return;
    }

    setSearchSubmitted(true);
    setSelectedGenreId(0);
    Keyboard.dismiss();
  }

  const listPadding = { paddingBottom: tabBarHeight + 24 };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {searchSubmitted ? (
        <View style={styles.resultsHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => setSearchSubmitted(false)}
            hitSlop={8}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={26} color={COLORS.DARK} />
          </Pressable>
          <Text style={styles.resultsTitle}>
            {searchTotal == null ? 'Results' : resultsFoundLabel(searchTotal)}
          </Text>
        </View>
      ) : searchOpen ? (
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.GREY} />
            <TextInput
              value={searchText}
              onChangeText={(value) => {
                setSearchText(value);
                setSearchSubmitted(false);
                setSelectedGenreId(0);
              }}
              onSubmitEditing={submitSearch}
              placeholder={SEARCH_PLACEHOLDER}
              placeholderTextColor={COLORS.GREY}
              style={styles.searchInput}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="go"
              accessibilityLabel="Search movies"
              underlineColorAndroid={COLORS.TRANSPARENT}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close search"
              onPress={closeSearch}
              hitSlop={8}
            >
              <Ionicons name="close" size={18} color={COLORS.GREY} />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Watch</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search"
            onPress={() => setSearchOpen(true)}
            style={styles.searchButton}
          >
            <Ionicons accessible={false} name="search-outline" size={22} color={COLORS.DARK} />
          </Pressable>
        </View>
      )}

      <LinearGradient
        colors={[COLORS.LIGHT_GREY, COLORS.LIGHT_GREY_FADE]}
        style={styles.body}
      >
      {searchOpen && trimmedSearch.length > 0 ? (
        <View style={styles.listFrame}>
          {searchSubmitted ? null : (
            <View style={styles.topResults}>
              <Text style={styles.topResultsLabel}>{TOP_RESULTS_LABEL}</Text>
              <View style={styles.topResultsRule} />
            </View>
          )}
          <BrowseStatus
            view={searchView}
            loadingLabel={SEARCH_COPY.loading}
            onRetry={() => {
              void search.refetch();
            }}
            renderReady={(movies) => (
              <FlatList
                data={movies}
                keyExtractor={(movie) => String(movie.id)}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <SearchResultRow
                    movie={item}
                    genreName={firstGenreName(item.genre_ids, genres.data ?? [])}
                    onPress={openMovie}
                  />
                )}
                contentContainerStyle={[styles.resultsList, listPadding]}
                ItemSeparatorComponent={() => <View style={styles.resultSeparator} />}
                showsVerticalScrollIndicator={false}
                initialNumToRender={MOVIE_PAGE_SIZE}
                maxToRenderPerBatch={MOVIE_PAGE_SIZE}
                onEndReachedThreshold={0.4}
                onEndReached={() => {
                  searchPage.revealMore({
                    loadedCount: loadedSearchMovies.length,
                    hasNextPage: Boolean(search.hasNextPage),
                    isFetching: search.isFetchingNextPage,
                    fetchNext: () => search.fetchNextPage(),
                  });
                }}
                ListFooterComponent={
                  search.isFetchingNextPage ? (
                    <ActivityIndicator color={COLORS.DARK} style={styles.footer} />
                  ) : null
                }
              />
            )}
          />
        </View>
      ) : null}

      {searchOpen && trimmedSearch.length === 0 && selectedGenreId > 0 ? (
        <BrowseStatus
          view={genreMovieView}
          loadingLabel={GENRE_MOVIE_COPY.loading}
          onRetry={() => {
            void genreMovies.refetch();
          }}
          renderReady={(movies) => (
            <MovieList
              movies={movies}
              notice={genreMovieView.status === 'ready' ? genreMovieView.notice : null}
              columns={1}
              cardHeight={cardHeight}
              listPadding={listPadding}
              onPress={openMovie}
              onEndReached={() => {
                genrePage.revealMore({
                  loadedCount: loadedGenreMovies.length,
                  hasNextPage: Boolean(genreMovies.hasNextPage),
                  isFetching: genreMovies.isFetchingNextPage,
                  fetchNext: () => genreMovies.fetchNextPage(),
                });
              }}
              fetchingMore={genreMovies.isFetchingNextPage}
            />
          )}
        />
      ) : null}

      {searchOpen && trimmedSearch.length === 0 && selectedGenreId === 0 ? (
        <BrowseStatus
          view={genreView}
          loadingLabel={GENRE_COPY.loading}
          onRetry={() => {
            void genres.refetch();
          }}
          renderReady={(items) => (
            <View style={styles.listFrame}>
              {genreView.status === 'ready' && genreView.notice ? (
                <Text style={styles.notice}>{genreView.notice}</Text>
              ) : null}
              <FlatList
                data={items}
                keyExtractor={(genre) => String(genre.id)}
                numColumns={2}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <GenreTile
                    genre={item}
                    width={genreCardWidth}
                    height={genreCardHeight}
                    onPress={(genre) => setSelectedGenreId(genre.id)}
                  />
                )}
                columnWrapperStyle={styles.genreRow}
                contentContainerStyle={[styles.list, listPadding]}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        />
      ) : null}

      {!searchOpen && view.status === 'loading' ? (
        <View style={styles.status} accessibilityRole="progressbar">
          <ActivityIndicator color={COLORS.DARK} />
          <Text style={styles.message}>{WATCH_COPY.loading}</Text>
        </View>
      ) : null}

      {!searchOpen && view.status === 'error' ? (
        <View style={styles.status}>
          <Text style={styles.message}>{view.message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => query.refetch()}
            style={styles.retry}
          >
            <Text style={styles.retryLabel}>{WATCH_COPY.retry}</Text>
          </Pressable>
        </View>
      ) : null}

      {!searchOpen && view.status === 'empty' ? (
        <View style={styles.status}>
          <Text style={styles.message}>{view.message}</Text>
        </View>
      ) : null}

      {!searchOpen && view.status === 'ready' ? (
        <View style={styles.listFrame}>
          {view.notice ? (
            <Text style={styles.notice}>{view.notice}</Text>
          ) : null}
          <FlatList
            key={columns}
            data={view.movies}
            keyExtractor={(movie) => String(movie.id)}
            numColumns={columns}
            renderItem={({ item }) => (
              <MovieCard movie={item} height={cardHeight} onPress={openMovie} />
            )}
            columnWrapperStyle={columns > 1 ? styles.row : undefined}
            contentContainerStyle={[styles.list, listPadding]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            initialNumToRender={MOVIE_PAGE_SIZE}
            maxToRenderPerBatch={MOVIE_PAGE_SIZE}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              upcomingPage.revealMore({
                loadedCount: loadedMovies.length,
                hasNextPage: Boolean(query.hasNextPage),
                isFetching: query.isFetchingNextPage,
                fetchNext: () => query.fetchNextPage(),
              });
            }}
            ListFooterComponent={
              query.isFetchingNextPage ? (
                <ActivityIndicator color={COLORS.DARK} style={styles.footer} />
              ) : null
            }
            refreshing={query.isRefetching && !query.isPending}
            onRefresh={() => {
              upcomingPage.reset();
              void query.refetch();
            }}
          />
        </View>
      ) : null}
      </LinearGradient>
    </View>
  );
}

function BrowseStatus<T>({
  view,
  loadingLabel,
  onRetry,
  renderReady,
}: {
  view: ReturnType<typeof getBrowseViewState<T>>;
  loadingLabel: string;
  onRetry: () => void;
  renderReady: (items: T[]) => ReactNode;
}) {
  if (view.status === 'loading') {
    return (
      <View style={styles.status} accessibilityRole="progressbar">
        <ActivityIndicator color={COLORS.DARK} />
        <Text style={styles.message}>{loadingLabel}</Text>
      </View>
    );
  }

  if (view.status === 'error') {
    return (
      <View style={styles.status}>
        <Text style={styles.message}>{view.message}</Text>
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryLabel}>{WATCH_COPY.retry}</Text>
        </Pressable>
      </View>
    );
  }

  if (view.status === 'empty') {
    return (
      <View style={styles.status}>
        <Text style={styles.message}>{view.message}</Text>
      </View>
    );
  }

  return renderReady(view.items);
}

function MovieList({
  movies,
  notice,
  columns,
  cardHeight,
  listPadding,
  onPress,
  onEndReached,
  fetchingMore,
}: {
  movies: Movie[];
  notice: string | null;
  columns: number;
  cardHeight: number;
  listPadding: { paddingBottom: number };
  onPress: (movie: Movie) => void;
  onEndReached: () => void;
  fetchingMore: boolean;
}) {
  return (
    <View style={styles.listFrame}>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      <FlatList
        data={movies}
        keyExtractor={(movie) => String(movie.id)}
        numColumns={columns}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <MovieCard movie={item} height={cardHeight} onPress={onPress} />
        )}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
        contentContainerStyle={[styles.list, listPadding]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={MOVIE_PAGE_SIZE}
        maxToRenderPerBatch={MOVIE_PAGE_SIZE}
        onEndReachedThreshold={0.4}
        onEndReached={onEndReached}
        ListFooterComponent={
          fetchingMore ? <ActivityIndicator color={COLORS.DARK} style={styles.footer} /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: COLORS.DARK,
    paddingLeft: 8,
  },
  searchButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: COLORS.DARK,
  },
  topResults: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topResultsLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.DARK,
    marginBottom: 12,
  },
  topResultsRule: {
    height: 1,
    backgroundColor: COLORS.DARK_FAINT,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resultSeparator: {
    height: 18,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  resultPoster: {
    width: 104,
    height: 76,
    borderRadius: 8,
    backgroundColor: COLORS.DARK,
  },
  resultPosterFallback: {
    backgroundColor: COLORS.DARK,
  },
  resultCopy: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.DARK,
  },
  resultGenre: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.GREY,
  },
  body: {
    flex: 1,
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.CHIP,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.DARK,
    paddingVertical: 0,
  },
  listFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  row: {
    gap: 16,
  },
  genreRow: {
    gap: 12,
  },
  separator: {
    height: 16,
  },
  footer: {
    marginTop: 16,
  },
  card: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.DARK,
  },
  genreCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.DARK,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  cardTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: COLORS.PURE_WHITE,
  },
  genreGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  genreTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.PURE_WHITE,
  },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  message: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.GREY,
    textAlign: 'center',
  },
  notice: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.DARK,
  },
  retry: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  retryLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.BLUE,
  },
});
