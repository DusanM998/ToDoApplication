import { configureStore } from "@reduxjs/toolkit";
import { userAuthReducer } from "./userAuthSlice";
import authApi from "../../apis/authApi";
import { taskApi } from "../../apis/taskApi";
import { taskReducer } from "./tasksSlice";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["userAuthStore", "taskStore"], // sta hoces da sacuvas
};

const rootReducer = combineReducers({
  userAuthStore: userAuthReducer,
  taskStore: taskReducer,
  [authApi.reducerPath]: authApi.reducer,
  [taskApi.reducerPath]: taskApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store - mesto za cuvanje stanja cele aplikacije (kombinacija svih slice-ova)
const store = configureStore({
  reducer: persistedReducer,
   // Dodaje middleware (funkcije koje se izvrsavaju izmedju akcije i reducer-a) za RTK Query (omogucava keširanje, invalidaciju i osvezavanje podataka)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
        .concat(authApi.middleware)
        .concat(taskApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);

export default store;
