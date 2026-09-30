import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getImageUrl } from '../api/images';
import { useUpcomingMovies } from '../api/movieQueries';
import { type Movie } from '../api/movies';
import { COLORS } from '../enums/AppEnum';

function MovieCard({ movie }: { movie: Movie }) {
  const imageUrl =
    getImageUrl(movie.backdrop_path, 'w780') ??
    getImageUrl(movie.poster_path, 'w500');

  return (
    <View style={styles.card}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : null}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.72)']}
        style={styles.gradient}
      >
        <Text style={styles.cardTitle} numberOfLines={2}>
          {movie.title}
        </Text>
      </LinearGradient>
    </View>
  );
}

export function WatchScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { data, isPending, isError, error, refetch, isRefetching } =
    useUpcomingMovies();
  const movies = data?.results ?? [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Watch</Text>
        <Ionicons name="search-outline" size={22} color={COLORS.DARK} />
      </View>

      {isPending ? (
        <ActivityIndicator color={COLORS.DARK} style={styles.status} />
      ) : isError ? (
        <View style={styles.status}>
          <Text style={styles.message}>
            {error instanceof Error ? error.message : 'Could not load movies.'}
          </Text>
          <Pressable onPress={() => refetch()} style={styles.retry}>
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(movie) => String(movie.id)}
          renderItem={({ item }) => <MovieCard movie={item} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: tabBarHeight + 24 },
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <Text style={styles.message}>No upcoming movies found.</Text>
          }
        />
      )}
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
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: COLORS.DARK,
  },
  list: {
    paddingHorizontal: 20,
  },
  separator: {
    height: 16,
  },
  card: {
    height: 180,
    borderRadius: 10,
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
    color: '#FFFFFF',
  },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  message: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.GREY,
    textAlign: 'center',
  },
  retry: {
    marginTop: 16,
  },
  retryLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.BLUE,
  },
});
