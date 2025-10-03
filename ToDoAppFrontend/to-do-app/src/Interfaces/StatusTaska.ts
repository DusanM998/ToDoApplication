export const StatusTaska = {
  Pending: 1,
  Completed: 2,
  Overdue: 3,
} as const;

export type StatusTaska = (typeof StatusTaska)[keyof typeof StatusTaska];

// type koristim kada radim sa primitive vrednostima