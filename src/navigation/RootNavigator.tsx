import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MovieDetailsScreen } from '../screens/MovieDetailsScreen';
import { MovieTicketsScreen } from '../screens/MovieTicketsScreen';
import { TabNavigator } from './TabNavigator';

export type RootStackParamList = {
  Tabs: undefined;
  MovieDetails: { movieId: number };
  MovieTickets: { movieId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
      <Stack.Screen name="MovieTickets" component={MovieTicketsScreen} />
    </Stack.Navigator>
  );
}
