import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

let configured = false;

export function setupQueryLifecycle() {
  if (configured) {
    return;
  }

  configured = true;

  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false);
    });
  });

  if (Platform.OS === 'web') {
    return;
  }

  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener('change', (status) => {
      handleFocus(status === 'active');
    });

    return () => subscription.remove();
  });
}
