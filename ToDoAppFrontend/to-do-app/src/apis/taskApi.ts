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
    getAllTasks: builder.query<toDoTaskModel[], void>({
      query: () => ({ url: "/all", method: "GET" }), // poziva backend GET /api/tasks/all
      transformResponse: (response: { result: toDoTaskModel[] }) =>
        response.result,
      providesTags: ["Tasks"],
    }),
    getTasks: builder.query<toDoTaskModel[], void>({
      query: () => "",
      transformResponse: (response: { result: toDoTaskModel[] }) =>
        response.result,
      providesTags: ["Tasks"],
    }),
    getTaskById: builder.query<toDoTaskModel, number>({
      query: (id) => `/${id}`,
      transformResponse: (response: { result: toDoTaskModel }) =>
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
    getFilteredTasks: builder.query<
      {
        data: toDoTaskModel[];
        pagination: {
          CurrentPage: number;
          PageSize: number;
          TotalRecords: number;
          TotalPages: number;
        } | null;
      },
      {
        search?: string;
        status?: number;
        dueDateFrom?: string;
        dueDateTo?: string;
        category?: string;
        priority?: number;
        pageNumber?: number;
        pageSize?: number;
      }
    >({
      query: ({
        search,
        status,
        dueDateFrom,
        dueDateTo,
        category,
        priority,
        pageNumber = 1,
        pageSize = 10,
      }) => {
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (status !== undefined) params.append("status", String(status));
        if (dueDateFrom) params.append("dueDateFrom", dueDateFrom);
        if (dueDateTo) params.append("dueDateTo", dueDateTo);
        if (category) params.append("category", category);
        if (priority !== undefined) params.append("priority", String(priority));
        params.append("pageNumber", String(pageNumber));
        params.append("pageSize", String(pageSize));

        return {
          url: `/filter?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: toDoTaskModel[], meta) => {
        const paginationHeader = meta?.response?.headers.get("X-Pagination");
        const pagination = paginationHeader
          ? JSON.parse(paginationHeader)
          : null;

        return {
          data: response,
          pagination,
        };
      },
      providesTags: ["Tasks"],
    }),
    getCategories: builder.query<string[], string>({
      query: (userId) => ({
        url: `/categories?userId=${userId}`,
        method: "GET",
      }),
      providesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetAllTasksQuery,
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetFilteredTasksQuery,
  useGetCategoriesQuery,
} = taskApi;
