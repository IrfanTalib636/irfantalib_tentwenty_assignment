import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MovieDetailsScreen } from '../screens/MovieDetailsScreen';
import { MovieTicketsScreen } from '../screens/MovieTicketsScreen';
import { SeatMapScreen } from '../screens/SeatMapScreen';
import { TabNavigator } from './TabNavigator';

export type RootStackParamList = {
  Tabs: undefined;
  MovieDetails: { movieId: number };
  MovieTickets: { movieId: number };
  SeatMap: { movieId: number; date: string; time: string; hall: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
      <Stack.Screen name="MovieTickets" component={MovieTicketsScreen} />
      <Stack.Screen name="SeatMap" component={SeatMapScreen} />
    </Stack.Navigator>
  );
}
