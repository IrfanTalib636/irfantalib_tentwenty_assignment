process.env.EXPO_PUBLIC_BASE_URL = 'https://api.themoviedb.org/3';

jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    // The package ships this mock as CommonJS.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
