import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { apiResponse, Group, GroupMessage } from "../Interfaces";
import type { CreateGroupDTO } from "../Interfaces/createGroupDTO";

export const groupApi = createApi({
  reducerPath: "groupApi",
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
  tagTypes: ["Groups", "GroupMessages"],

  endpoints: (builder) => ({
    // Kreiranje nove grupe
    createGroup: builder.mutation<apiResponse<Group>, CreateGroupDTO>({
      query: (groupData) => ({
        url: "groups/create",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: groupData,
      }),
      transformResponse: (response: any) => ({
        data: {
          statusCode: response.statusCode,
          isSuccess: response.isSuccess,
          errorMessage: response.errorMessages,
          result: response.result,
        },
      }),
      invalidatesTags: ["Groups"],
    }),

    // Dohvatanje svih grupa trenutnog korisnika
    getMyGroups: builder.query<apiResponse<Group[]>, void>({
      query: () => ({
        url: "groups/my-groups",
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        data: {
          statusCode: response.statusCode,
          isSuccess: response.isSuccess,
          errorMessage: response.errorMessages,
          result: response.result,
        },
      }),
      providesTags: ["Groups"],
    }),

    // Slanje poruke u grupu (po emailu ili ID-u)
    sendGroupMessage: builder.mutation<
      apiResponse<GroupMessage>,
      { groupIdentifier: string; content: string }
    >({
      query: ({ groupIdentifier, content }) => {
        const formData = new FormData();
        formData.append("Content", content);

        return {
          url: `groups/${groupIdentifier}/send`,
          method: "POST",
          body: formData,
          // ne stavljam Content-Type, browser ga sam postavlja
        };
      },
      invalidatesTags: ["GroupMessages"],
    }),

    // Dohvatanje svih poruka u grupi
    getGroupMessages: builder.query<apiResponse<GroupMessage[]>, number>({
      query: (groupId) => ({
        url: `groups/${groupId}/messages`,
        method: "GET",
      }),
      providesTags: ["GroupMessages"],
    }),
    // Uklanjanje clana iz grupe (admin moze da ukloni clana ili da clan samostalno napusti grupu)
    removeMember: builder.mutation<
      apiResponse<any>,
      { groupId: number; memberId: string }
    >({
      query: ({ groupId, memberId }) => ({
        url: `groups/${groupId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Groups"],
    }),

    //Brisanje grupe - samo admin moze da obrise grupu
    deleteGroup: builder.mutation<apiResponse<any>, number>({
      query: (groupId) => ({
        url: `groups/${groupId}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => ({
        data: {
          statusCode: response.statusCode,
          isSuccess: response.isSuccess,
          errorMessage: response.errorMessages,
          result: response.result,
        },
      }),
      invalidatesTags: ["Groups"],
    }),
  }),
});

// Export hook-ova
export const {
  useCreateGroupMutation,
  useGetMyGroupsQuery,
  useSendGroupMessageMutation,
  useGetGroupMessagesQuery,
  useRemoveMemberMutation,
  useDeleteGroupMutation,
} = groupApi;

export default groupApi;
