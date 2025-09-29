import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// createApi - f-ja za kreiranje API slice-a (Rexux komponenta za komunikaciju sa backend-om)
const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    // fetchBaseQuery - f-ja za kreiranje HTTP requesta
    baseUrl: "https://localhost:7070/api/",
    credentials: "include", // salje cookies sa svakim zahtevom
    prepareHeaders: (headers) => {
      // Automatski dodaje token u header svakog zahteva ako je korisnik ulogovan
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["AuthApi"],
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      //mutation - operacije koje menjaju podatke (POST, PUT, DELETE, PATCH)
      query: (userData) => ({
        // ovde mi query predstavlja objekat sa svim informacijama o HTTP zahtevu
        url: "auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["AuthApi"],
    }),
    loginUser: builder.mutation({
      query: (userCredentials) => ({
        url: "auth/login",
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: userCredentials,
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
    }),
    getUserByUserId: builder.query({
      //query su operacije koje se koriste za preuzimanje podataka sa servera
      query: (id) => ({
        url: `auth/${id}`,
      }),
      providesTags: ["AuthApi"],
    }),
    updateUserDetails: builder.mutation({
      query: ({ data, id }) => ({
        url: "auth/" + id,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AuthApi"],
    }),
    verifyPassword: builder.mutation({
      query: (userCredentials) => ({
        url: "auth/verify-password",
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: userCredentials,
      }),
    }),
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: "auth/refresh-token",
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(refreshToken),
      }),
    }),
    resetPasswordRequest: builder.mutation({
      query: (emailData) => ({
        url: "auth/forgot-password",
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: emailData,
      }),
    }),
    confirmResetPassword: builder.mutation({
      query: (resetData) => ({
        url: "auth/reset-password",
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: resetData,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: "auth/me",
        method: "GET",
      }),
      providesTags: ["AuthApi"],
    }),
    getAllUsers: builder.query({
    query: () => ({
      url: "auth/allUsers",
      method: "GET",
    }),
    providesTags: ["AuthApi"],
  }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetUserByUserIdQuery,
  useUpdateUserDetailsMutation,
  useVerifyPasswordMutation,
  useRefreshTokenMutation,
  useResetPasswordRequestMutation,
  useConfirmResetPasswordMutation,
  useGetCurrentUserQuery,
  useGetAllUsersQuery
} = authApi;

export default authApi;
