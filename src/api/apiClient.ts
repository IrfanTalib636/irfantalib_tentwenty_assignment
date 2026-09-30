import {
  create,
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

const baseURL = process.env.EXPO_PUBLIC_BASE_URL;

if (!baseURL) {
  throw new Error(
    'EXPO_PUBLIC_BASE_URL is missing. Set it in the root .env file.',
  );
}

type ErrorBody = {
  status_message?: string;
  message?: string;
};

export class ApiError extends Error {
  readonly status?: number;
  readonly data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient: AxiosInstance = create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN?.trim();
    const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim();

    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set('Accept', 'application/json');

    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
      return config;
    }

    if (apiKey) {
      config.params = {
        ...config.params,
        api_key: apiKey,
      };
      return config;
    }

    throw new ApiError(
      'TMDB credentials are missing. Set EXPO_PUBLIC_TMDB_ACCESS_TOKEN or EXPO_PUBLIC_TMDB_API_KEY in the root .env file.',
    );
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    const message =
      error.response?.data?.status_message ??
      error.response?.data?.message ??
      error.message;

    return Promise.reject(
      new ApiError(message, error.response?.status, error.response?.data),
    );
  },
);
