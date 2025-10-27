import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ConversationPartner } from "../Interfaces";

// API za poruke
export const messageApi = createApi({
  reducerPath: "messageApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://localhost:7070/api/",
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Messages"],

  endpoints: (builder) => ({
    // Slanje poruke
    sendMessage: builder.mutation({
      query: (messageData) => ({
        url: "messages/send",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: messageData, // { receiverId or receiverEmail, content }
      }),
      invalidatesTags: ["Messages"],
    }),

    // Dohvatanje konverzacije izmedju dva korisnika
    getConversation: builder.query({
      query: (otherUserId: string) => ({
        url: `messages/conversation/${otherUserId}`,
        method: "GET",
      }),
      providesTags: ["Messages"],
    }),

    // Dohvatanje svih neprocitanih poruka za trenutnog korisnika
    getUnreadMessages: builder.query({
      query: () => ({
        url: "messages/unread",
        method: "GET",
      }),
      providesTags: ["Messages"],
    }),

    // Oznacavanje poruke kao procitane
    markAsRead: builder.mutation({
      query: (messageId: number) => ({
        url: `messages/${messageId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Messages"],
    }),

    // Dohvatanje svih konverzacija za trenutnog korisnika
    getAllConversations: builder.query<
      {
        statusCode: number;
        isSuccess: boolean;
        errorMessages: string[];
        result: ConversationPartner[];
      },
      void
    >({
      query: () => ({
        url: "messages/conversations",
        method: "GET",
      }),
    }),
  }),
});

// Export hook-ova
export const {
  useSendMessageMutation,
  useGetConversationQuery,
  useGetUnreadMessagesQuery,
  useMarkAsReadMutation,
  useGetAllConversationsQuery,
} = messageApi;

export default messageApi;
