export const SD_Roles = {
  ADMIN: "admin",
  CUSTOMER: "customer",
} as const;

export type SD_Roles = typeof SD_Roles[keyof typeof SD_Roles];