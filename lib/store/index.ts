import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/lib/api/baseApi";
import applicationReducer from "./applicationSlice";
import authReducer from "./authSlice";

// Import feature APIs so their endpoints are registered before the store is used
import "@/lib/api/authApi";
import "@/lib/api/applicationApi";
import "@/lib/api/documentsApi";
import "@/lib/api/adminApi";
import "@/lib/api/utilsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    application: applicationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
