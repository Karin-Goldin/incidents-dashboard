import { configureStore } from "@reduxjs/toolkit";
import filtersReducer from "./slices/filtersSlice";
import incidentsReducer from "./slices/incidentsSlice";
import authReducer from "./slices/authSlice";
import connectionReducer from "./slices/connectionSlice";
import { setStoreRef } from "@/services/api";

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    incidents: incidentsReducer,
    auth: authReducer,
    connection: connectionReducer,
  },
});

setStoreRef(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
