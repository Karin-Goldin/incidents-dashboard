import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { authService, type LoginCredentials } from "@/services/authService";

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: authService.isAuthenticated(),
  user: null,
  token: authService.getStoredToken(),
  isLoading: false,
  error: null,
};

// Async thunk for login
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return {
        token: response.accessToken,
        user: response.user || {
          id: "",
          username: credentials.username,
          email: "",
          role: "",
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      localStorage.setItem("accessToken", action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, setToken, clearError } = authSlice.actions;

export default authSlice.reducer;
