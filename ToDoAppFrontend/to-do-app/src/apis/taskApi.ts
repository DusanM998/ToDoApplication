import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type toDoTaskModel from "../Interfaces/toDoTaskModel";

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://localhost:7070/api/tasks",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Tasks"],
  endpoints: (builder) => ({
    getTasks: builder.query<toDoTaskModel[], void>({
      query: () => "",
      transformResponse: (response: { result: toDoTaskModel[] }) =>
        response.result,
      providesTags: ["Tasks"],
    }),
    createTask: builder.mutation<toDoTaskModel, Partial<toDoTaskModel>>({
      query: (task) => ({
        url: "",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTask: builder.mutation<toDoTaskModel, Partial<toDoTaskModel>>({
      query: ({ id, ...rest }) => ({
        url: `/${id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),
    getFilteredTasks: builder.query<toDoTaskModel[],{search?: string;isCompleted?: boolean;dueDateFrom?: string;dueDateTo?: string;pageNumber?: number;pageSize?: number;}>({
      query: ({
        search,
        isCompleted,
        dueDateFrom,
        dueDateTo,
        pageNumber = 1,
        pageSize = 10,
      }) => {
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (isCompleted !== undefined)
          params.append("isCompleted", String(isCompleted));
        if (dueDateFrom) params.append("dueDateFrom", dueDateFrom);
        if (dueDateTo) params.append("dueDateTo", dueDateTo);
        params.append("pageNumber", String(pageNumber));
        params.append("pageSize", String(pageSize));

        return {
          url: `/filter?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: toDoTaskModel[]) => response,
      providesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetFilteredTasksQuery
} = taskApi;
