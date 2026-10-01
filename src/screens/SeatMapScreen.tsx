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
import { DETAIL_COPY, detailErrorMessage } from './detailContent';
import { SEAT_COPY, SEAT_ROW_MARKS, seatSessionLabel } from './seatSession';

const seatsImage = require('../assets/images/seatsImage.png');
const SEAT_MAP_GREY = '#E6E6EB';
const IMAGE_RATIO = 570 / 987;
const MIN_ZOOM = 1;
const MAX_ZOOM = 1.6;

type SeatRoute = RouteProp<RootStackParamList, 'SeatMap'>;
type SeatNavigation = NativeStackNavigationProp<RootStackParamList, 'SeatMap'>;

export function SeatMapScreen() {
  const navigation = useNavigation<SeatNavigation>();
  const route = useRoute<SeatRoute>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const details = useMovieDetails(route.params.movieId);
  const movie = details.data;
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [seatSelected, setSeatSelected] = useState(true);
  const [mapHeight, setMapHeight] = useState(0);
  const imageWidth = width * 0.9;
  const imageHeight = imageWidth * IMAGE_RATIO;
  const imageTop = Math.max((mapHeight - imageHeight) / 2, 0);
  const session = seatSessionLabel(route.params.date, route.params.time, route.params.hall);

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
            <Text style={styles.title} numberOfLines={1}>
              {movie?.title ?? 'Select seats'}
            </Text>
            <Text style={styles.session} numberOfLines={1}>
              {session}
            </Text>
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
          <View
            style={[styles.map, { minHeight: imageHeight }]}
            onLayout={(event) => setMapHeight(event.nativeEvent.layout.height)}
          >
            <Image
              accessibilityLabel="Seat map"
              source={seatsImage}
              resizeMode="contain"
              style={[
                styles.seats,
                {
                  top: imageTop,
                  left: (width - imageWidth) / 2,
                  width: imageWidth,
                  height: imageHeight,
                  transform: [{ scale: zoom }],
                },
              ]}
            />
            {SEAT_ROW_MARKS.map((mark, index) => (
              <Text
                key={mark}
                style={[styles.rowNumber, { top: imageTop + imageHeight * mark - 8 }]}
              >
                {index + 1}
              </Text>
            ))}
            <View style={styles.zoom}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={SEAT_COPY.zoomIn}
                onPress={() => setZoom((current) => Math.min(MAX_ZOOM, Number((current + 0.2).toFixed(2))))}
                style={styles.zoomButton}
              >
                <Ionicons name="add" size={16} color={COLORS.DARK} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={SEAT_COPY.zoomOut}
                onPress={() => setZoom((current) => Math.max(MIN_ZOOM, Number((current - 0.2).toFixed(2))))}
                style={styles.zoomButton}
              >
                <Ionicons name="remove" size={16} color={COLORS.DARK} />
              </Pressable>
            </View>
            <View style={styles.seatRule} />
          </View>

          <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.legend}>
              <View style={styles.legendColumn}>
                <LegendItem color={COLORS.YELLOW} label={SEAT_COPY.selected} />
                <LegendItem color={COLORS.PURPLE} label={SEAT_COPY.vip} />
              </View>
              <View style={styles.legendColumn}>
                <LegendItem color="#C5C5CB" label={SEAT_COPY.unavailable} />
                <LegendItem color={COLORS.BLUE} label={SEAT_COPY.regular} />
              </View>
            </View>

            {seatSelected ? (
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>{SEAT_COPY.seat}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={SEAT_COPY.removeSeat}
                  onPress={() => setSeatSelected(false)}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={16} color={COLORS.GREY} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.chipSpacer} />
            )}

            <View style={styles.checkout}>
              <View style={styles.total}>
                <Text style={styles.totalLabel}>{SEAT_COPY.total}</Text>
                <Text style={styles.totalPrice}>{seatSelected ? SEAT_COPY.price : SEAT_COPY.emptyPrice}</Text>
              </View>
              <Pressable accessibilityRole="button" style={styles.pay}>
                <Text style={styles.payLabel}>{SEAT_COPY.pay}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SEAT_MAP_GREY,
  },
  header: {
    backgroundColor: '#FFFFFF',
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
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.DARK,
    textAlign: 'center',
  },
  session: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: COLORS.BLUE,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    backgroundColor: SEAT_MAP_GREY,
  },
  bodyContent: {
    flexGrow: 1,
  },
  map: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: SEAT_MAP_GREY,
  },
  seats: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  rowNumber: {
    position: 'absolute',
    left: 2,
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.GREY,
  },
  zoom: {
    position: 'absolute',
    right: 16,
    bottom: 22,
    flexDirection: 'row',
    gap: 10,
  },
  zoomButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  seatRule: {
    position: 'absolute',
    left: '5%',
    bottom: 8,
    width: '90%',
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.GREY,
  },
  bottom: {
    backgroundColor: '#EFEFEF',
    paddingTop: 22,
  },
  legend: {
    flexDirection: 'row',
    gap: 28,
    paddingHorizontal: 28,
  },
  legendColumn: {
    flex: 1,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  legendLabel: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.DARK,
  },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    marginLeft: 28,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: 12,
    backgroundColor: '#E8E8EE',
  },
  chipSpacer: {
    height: 28,
  },
  chipLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: COLORS.DARK,
  },
  checkout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 22,
    paddingHorizontal: 24,
  },
  total: {
    width: 118,
    minHeight: 58,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
    backgroundColor: '#E8E8EE',
  },
  totalLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.GREY,
  },
  totalPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.DARK,
  },
  pay: {
    flex: 1,
    minHeight: 58,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BLUE,
  },
  payLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
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
