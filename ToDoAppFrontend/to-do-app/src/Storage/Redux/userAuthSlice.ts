import { createSlice } from "@reduxjs/toolkit";
import type { userModel } from "../../Interfaces";

// Inicijalno stanje korisnika (kada nije logovan)
export const emptyUserState: userModel = {
    name: "",
    id: "",
    email: "",
    role: "",
    image: "",
    phoneNumber: ""
};

// Slice - komponenta Redux-a koja sadrzi reducer i akcije
// userAuthSlice - slice za autentifikaciju korisnika (cuva pod. o tren. ulogovanom korisniku u Redux store-u)
export const userAuthSlice = createSlice({
    name: "userAuth",
    initialState: emptyUserState,
    reducers: { // reducers - funkcije koje menjaju stanje (state) u Redux store-u
        // Kada se korisnik uloguje, sacuvaj njegove podatke u Redux store
        // dispatchujem (metod koji se koristi za slanje akcija ka reduceru)
        setLoggedInUser: (state, action) => {
            state.name = action.payload.name;
            state.id = action.payload.id;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.image = action.payload.image;
            state.phoneNumber = action.payload.phoneNumber;
        },
        logoutUser: () => {
            return emptyUserState;
        }
    },
});

export const { setLoggedInUser, logoutUser } = userAuthSlice.actions;
export const userAuthReducer = userAuthSlice.reducer;