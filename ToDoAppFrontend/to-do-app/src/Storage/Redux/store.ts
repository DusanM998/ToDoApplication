import { configureStore } from "@reduxjs/toolkit";
import { userAuthReducer } from "./userAuthSlice";
import authApi from "../../apis/authApi";
import { taskApi } from "../../apis/taskApi";

// Store - mesto za cuvanje stanja cele aplikacije (kombinacija svih slice-ova)
const store = configureStore({
  reducer: {
    userAuthStore: userAuthReducer,
    [authApi.reducerPath]: authApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
  },
   // Dodaje middleware (funkcije koje se izvrsavaju izmedju akcije i reducer-a) za RTK Query (omogucava keširanje, invalidaciju i osvezavanje podataka)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
        .concat(authApi.middleware)
        .concat(taskApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
