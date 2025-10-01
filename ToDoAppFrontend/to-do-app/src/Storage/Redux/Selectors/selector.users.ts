import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export const getLoggedUser = createSelector((state: RootState) =>
    state.userAuthStore;
);