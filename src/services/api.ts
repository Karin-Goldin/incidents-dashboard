import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { websocketService } from "./websocketService";

const API_BASE_URL = "https://incident-platform.azurewebsites.net";

// Store reference to avoid circular dependency
// This will be set from store.ts after store is created
let storeRef: {
  dispatch: (action: { type: string; payload?: any }) => void;
} | null = null;

export const setStoreRef = (
  store: {
    dispatch: (action: { type: string; payload?: any }) => void;
  }
) => {
  storeRef = store;
};

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: Handle cookies for refresh token
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Don't add token to login/refresh endpoints
    const isAuthEndpoint =
      config.url?.includes("/api/auth/login") ||
      config.url?.includes("/api/auth/refresh");

    if (!isAuthEndpoint) {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip handling for auth endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes("/api/auth/login") ||
      originalRequest.url?.includes("/api/auth/refresh");

    // If 401 and not already retrying, try to refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            {},
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const accessToken =
            response.data.accessToken ||
            response.data.access_token ||
            response.data.token;
          if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
            // Update Redux store with new token if store is available
            if (storeRef) {
              // Use require to avoid circular dependency issues
              const { setToken } = require("@/store/slices/authSlice");
              storeRef.dispatch(setToken(accessToken));
            }

            // Disconnect WebSocket so it can reconnect with new token
            // The useEffect in App.tsx will automatically reconnect when token changes in Redux
            if (websocketService.isConnected()) {
              websocketService.disconnect();
            }

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // Update Redux store to logout user
        if (storeRef) {
          const { logout } = require("@/store/slices/authSlice");
          storeRef.dispatch(logout());
        }
        return Promise.reject(refreshError);
      }

      // No refresh token available, clear auth and logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Update Redux store to logout user
      if (storeRef) {
        const { logout } = require("@/store/slices/authSlice");
        storeRef.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
