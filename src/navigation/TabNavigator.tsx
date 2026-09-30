import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, TABS } from '../enums/AppEnum';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { WatchScreen } from '../screens/WatchScreen';

export type RootTabParamList = {
  Dashboard: undefined;
  Watch: undefined;
  MediaLibrary: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function DashboardScreen() {
  return <PlaceholderScreen title="Dashboard" />;
}

function MediaLibraryScreen() {
  return <PlaceholderScreen title="Media Library" />;
}

function MoreScreen() {
  return <PlaceholderScreen title="More" />;
}

export function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName={TABS.WATCH}
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: COLORS.GREY,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: styles.label,
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: Math.max(insets.bottom, 12),
          height: 68,
          borderRadius: 28,
          backgroundColor: COLORS.DARK,
          borderTopWidth: 0,
          paddingTop: 6,
          paddingBottom: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        sceneStyle: {
          backgroundColor: COLORS.WHITE,
        },
      }}
    >
      <Tab.Screen
        name={TABS.DASHBOARD}
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dots-grid" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={TABS.WATCH}
        component={WatchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={TABS.MEDIA_LIBRARY}
        component={MediaLibraryScreen}
        options={{
          tabBarLabel: 'Media Library',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="file-tray-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={TABS.MORE}
        component={MoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = {
  label: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
  },
};
