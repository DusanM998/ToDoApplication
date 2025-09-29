import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { toDoTaskModel } from "../../Interfaces";

interface TaskState {
  tasks: toDoTaskModel[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [] as toDoTaskModel[],
  isLoading: false,
  error: null,
};

export const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<toDoTaskModel[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<toDoTaskModel>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<toDoTaskModel>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index >= 0) state.tasks[index] = action.payload;
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
  },
});


export const {setTasks, addTask, updateTask, deleteTask} = taskSlice.actions;
export const taskReducer = taskSlice.reducer;