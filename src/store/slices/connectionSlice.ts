import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

interface ConnectionState {
  status: ConnectionStatus;
  lastUpdate: number;
  latency: number;
}

const initialState: ConnectionState = {
  status: "connected",
  lastUpdate: 0,
  latency: 45,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.status = action.payload;
    },
    setLastUpdate: (state, action: PayloadAction<number>) => {
      state.lastUpdate = action.payload;
    },
    incrementLastUpdate: (state) => {
      state.lastUpdate += 1;
    },
    setLatency: (state, action: PayloadAction<number>) => {
      state.latency = action.payload;
    },
  },
});

export const {
  setStatus,
  setLastUpdate,
  incrementLastUpdate,
  setLatency,
} = connectionSlice.actions;

export default connectionSlice.reducer;

