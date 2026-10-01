import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMovieDetails } from '../api/movieQueries';
import { COLORS } from '../enums/AppEnum';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { DETAIL_COPY, detailErrorMessage, formatInTheaters } from './detailContent';
import { buildShowtimes, dayKey, formatDateChip, ticketDates, type Showtime } from './showtimes';

const seatMap = require('../assets/images/seatMap.png');

type TicketsRoute = RouteProp<RootStackParamList, 'MovieTickets'>;
type TicketsNavigation = NativeStackNavigationProp<RootStackParamList, 'MovieTickets'>;

export function MovieTicketsScreen() {
  const navigation = useNavigation<TicketsNavigation>();
  const route = useRoute<TicketsRoute>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const movieId = route.params.movieId;
  const details = useMovieDetails(movieId);
  const movie = details.data;
  const dates = ticketDates(new Date());
  const [selectedDay, setSelectedDay] = useState(dayKey(dates[0]));
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(null);
  const selectedDate = dates.find((date) => dayKey(date) === selectedDay) ?? dates[0];
  const showtimes = buildShowtimes(movieId, selectedDate);
  const activeShowtime =
    showtimes.find((showtime) => showtime.id === selectedShowtimeId) ?? showtimes[0];
  const cardWidth = Math.min(Math.max(width * 0.68, 220), 300);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={26} color={COLORS.DARK} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title} numberOfLines={2}>
              {movie?.title ?? 'Get Tickets'}
            </Text>
            {movie ? <Text style={styles.release}>{formatInTheaters(movie.release_date)}</Text> : null}
          </View>
        </View>
      </View>

      {details.isPending && !movie ? (
        <View style={styles.status} accessibilityRole="progressbar">
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
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {dates.map((date) => {
              const key = dayKey(date);
              const selected = key === selectedDay;
              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={formatDateChip(date)}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setSelectedDay(key);
                    setSelectedShowtimeId(null);
                  }}
                  style={[styles.dateChip, selected ? styles.dateChipSelected : null]}
                >
                  <Text style={[styles.dateChipLabel, selected ? styles.dateChipLabelSelected : null]}>
                    {formatDateChip(date)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.showtimeRow}
          >
            {showtimes.map((showtime) => (
              <ShowtimeCard
                key={showtime.id}
                showtime={showtime}
                width={cardWidth}
                selected={showtime.id === activeShowtime?.id}
                onPress={() => setSelectedShowtimeId(showtime.id)}
              />
            ))}
          </ScrollView>
        </ScrollView>
      ) : null}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          accessibilityRole="button"
          disabled={!movie || !activeShowtime}
          onPress={() => {
            if (!movie || !activeShowtime) {
              return;
            }

            navigation.navigate('SeatMap', {
              movieId: movie.id,
              date: selectedDay,
              time: activeShowtime.time,
              hall: activeShowtime.hall,
            });
          }}
          style={styles.selectSeats}
        >
          <Text style={styles.selectSeatsLabel}>Select Seats</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ShowtimeCard({
  showtime,
  width,
  selected,
  onPress,
}: {
  showtime: Showtime;
  width: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${showtime.time} ${showtime.hall}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.showtime, { width }]}
    >
      <View style={styles.showtimeHeading}>
        <Text style={styles.time}>{showtime.time}</Text>
        <Text style={styles.hall} numberOfLines={1}>
          {showtime.hall}
        </Text>
      </View>
      <View style={[styles.seatFrame, selected ? styles.seatFrameSelected : null]}>
        <Image source={seatMap} style={styles.seatMap} resizeMode="contain" />
      </View>
      <Text style={styles.priceLine}>
        <Text style={styles.priceMuted}>From </Text>
        <Text style={styles.priceStrong}>{showtime.price}$</Text>
        <Text style={styles.priceMuted}> or </Text>
        <Text style={styles.priceStrong}>{showtime.bonus} bonus</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    backgroundColor: COLORS.PURE_WHITE,
  },
  headerBar: {
    minHeight: 72,
    justifyContent: 'center',
    paddingHorizontal: 56,
    paddingBottom: 12,
  },
  backButton: {
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 12,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.DARK,
    textAlign: 'center',
  },
  release: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: COLORS.BLUE,
    textAlign: 'center',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 24,
  },
  sectionLabel: {
    marginTop: 12,
    marginBottom: 14,
    marginHorizontal: 24,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.DARK,
  },
  dateRow: {
    paddingHorizontal: 24,
    gap: 12,
  },
  dateChip: {
    minWidth: 72,
    height: 36,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.LIGHT_GREY,
  },
  dateChipSelected: {
    backgroundColor: COLORS.BLUE,
  },
  dateChipLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: COLORS.DARK,
  },
  dateChipLabelSelected: {
    color: COLORS.PURE_WHITE,
  },
  showtimeRow: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 16,
  },
  showtime: {
    gap: 10,
  },
  showtimeHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.DARK,
  },
  hall: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.GREY,
  },
  seatFrame: {
    height: 168,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BLUE_FAINT,
    padding: 10,
    justifyContent: 'center',
  },
  seatFrameSelected: {
    borderColor: COLORS.BLUE,
  },
  seatMap: {
    width: '100%',
    height: '100%',
  },
  priceLine: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  priceMuted: {
    color: COLORS.GREY,
  },
  priceStrong: {
    fontFamily: 'Poppins_500Medium',
    color: COLORS.BLUE,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  selectSeats: {
    height: 52,
    borderRadius: 10,
    backgroundColor: COLORS.BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectSeatsLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: COLORS.PURE_WHITE,
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
});
