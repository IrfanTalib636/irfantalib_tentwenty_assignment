import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getImageUrl } from '../api/images';
import { useMovieDetails, useMovieVideos } from '../api/movieQueries';
import { COLORS } from '../enums/AppEnum';
import type { RootStackParamList } from '../navigation/RootNavigator';
import {
  DETAIL_COPY,
  detailErrorMessage,
  formatInTheaters,
  GENRE_COLORS,
  pickTrailer,
  trailerUrl,
} from './movieDetails';

type DetailsRoute = RouteProp<RootStackParamList, 'MovieDetails'>;
type DetailsNavigation = NativeStackNavigationProp<RootStackParamList, 'MovieDetails'>;

export function MovieDetailsScreen() {
  const navigation = useNavigation<DetailsNavigation>();
  const route = useRoute<DetailsRoute>();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const movieId = route.params.movieId;
  const details = useMovieDetails(movieId);
  const videos = useMovieVideos(movieId);
  const [trailerError, setTrailerError] = useState<string | null>(null);
  const movie = details.data;
  const heroHeight = width > height ? Math.max(height * 0.72, 320) : Math.min(height * 0.62, 520);
  const trailer = pickTrailer(videos.data ?? []);

  useEffect(() => {
    if (movie) {
      console.log('Movie details', movie);
    }
  }, [movie]);

  useEffect(() => {
    if (videos.data) {
      console.log('Movie videos', videos.data);
    }
  }, [videos.data]);

  async function openTrailer() {
    if (!trailer) {
      setTrailerError('No trailer is available for this movie.');
      return;
    }

    setTrailerError(null);
    await Linking.openURL(trailerUrl(trailer.key));
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      {details.isPending && !movie ? (
        <View style={styles.status}>
          <ActivityIndicator color={COLORS.DARK} />
          <Text style={styles.statusText}>{DETAIL_COPY.loading}</Text>
        </View>
      ) : null}

      {details.isError && !movie ? (
        <View style={styles.status}>
          <Text style={styles.statusText}>{detailErrorMessage(details.error)}</Text>
          <Pressable accessibilityRole="button" onPress={() => details.refetch()} style={styles.retry}>
            <Text style={styles.retryLabel}>{DETAIL_COPY.retry}</Text>
          </Pressable>
        </View>
      ) : null}

      {movie ? (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} bounces={false}>
          <View style={[styles.hero, { height: heroHeight }]}>
            {getImageUrl(movie.backdrop_path, 'w780') || getImageUrl(movie.poster_path, 'w500') ? (
              <Image
                source={{
                  uri:
                    getImageUrl(movie.backdrop_path, 'w780') ??
                    getImageUrl(movie.poster_path, 'w500') ??
                    undefined,
                }}
                style={styles.heroImage}
              />
            ) : (
              <View style={[styles.heroImage, styles.heroFallback]} />
            )}
            <LinearGradient
              colors={['rgba(0,0,0,0.82)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0)']}
              locations={[0, 0.55, 1]}
              pointerEvents="none"
              style={[styles.heroTopScrim, { height: insets.top + 88 }]}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
              locations={[0, 0.45, 1]}
              pointerEvents="none"
              style={styles.heroScrim}
            />
            <View style={[styles.heroHeader, { paddingTop: insets.top + 8 }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => navigation.goBack()}
                hitSlop={8}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.heroTitle}>{DETAIL_COPY.header}</Text>
            </View>
            <View style={styles.heroActions}>
              {movie.title ? <Text style={styles.movieName}>{movie.title}</Text> : null}
              <Text style={styles.release}>{formatInTheaters(movie.release_date)}</Text>
              <View style={styles.tickets}>
                <Text style={styles.ticketsLabel}>{DETAIL_COPY.tickets}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void openTrailer();
                }}
                style={styles.trailer}
              >
                <Ionicons name="play" size={14} color="#FFFFFF" />
                <Text style={styles.trailerLabel}>{DETAIL_COPY.trailer}</Text>
              </Pressable>
              {trailerError ? <Text style={styles.trailerError}>{trailerError}</Text> : null}
            </View>
          </View>

          <View style={styles.sheet}>
            <Text style={styles.sectionTitle}>{DETAIL_COPY.genres}</Text>
            <View style={styles.genres}>
              {movie.genres.length === 0 ? (
                <Text style={styles.body}>No genres listed.</Text>
              ) : (
                movie.genres.map((genre, index) => (
                  <View
                    key={genre.id}
                    style={[styles.chip, { backgroundColor: GENRE_COLORS[index % GENRE_COLORS.length] }]}
                  >
                    <Text style={styles.chipLabel}>{genre.name}</Text>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>{DETAIL_COPY.overview}</Text>
            <Text style={styles.body}>
              {movie.overview.trim() ? movie.overview : DETAIL_COPY.noOverview}
            </Text>
          </View>
        </ScrollView>
      ) : null}

      {!movie ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={[styles.backAlone, { top: insets.top + 8 }]}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.DARK} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  statusText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.GREY,
    textAlign: 'center',
  },
  retry: {
    minHeight: 44,
    justifyContent: 'center',
  },
  retryLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.BLUE,
  },
  backAlone: {
    position: 'absolute',
    left: 16,
  },
  hero: {
    backgroundColor: COLORS.DARK,
    justifyContent: 'space-between',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
  },
  heroFallback: {
    backgroundColor: COLORS.DARK,
  },
  heroTopScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '68%',
  },
  heroHeader: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#FFFFFF',
  },
  heroActions: {
    paddingHorizontal: 36,
    paddingBottom: 56,
    gap: 14,
  },
  movieName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  release: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tickets: {
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketsLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
  },
  trailer: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  trailerLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
  },
  trailerError: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sheet: {
    marginTop: -28,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    minHeight: 280,
  },
  sectionTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.DARK,
    marginBottom: 12,
    marginTop: 8,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  body: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.GREY,
  },
});
