import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../enums/AppEnum';

export function PlaceholderScreen({ title }: { title: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.empty}>
        <Text style={styles.message}>Nothing here yet.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  title: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: COLORS.DARK,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  message: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.GREY,
    textAlign: 'center',
  },
});
