export const USER_ROLE = {
  TOTEM: "TOTEM",
  DESK: "DESK",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
