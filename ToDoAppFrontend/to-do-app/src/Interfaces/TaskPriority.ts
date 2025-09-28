export const TaskPriority = {
  Low: 1,
  Normal: 2,
  High: 3,
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];