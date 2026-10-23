import { USER_ROLE } from "./USER_ROLE";

export const TEST_TOTEM_ACCOUNT = {
  subject: "totem-main",
  password: "pwd",
  role: USER_ROLE.TOTEM,
};

export const TEST_DESK_1_ACCOUNT = {
  subject: "desk-1",
  password: "pwd",
  role: USER_ROLE.DESK,
  deskId: "Desk 1",
};

export const TEST_DESK_2_ACCOUNT = {
  subject: "desk-2",
  password: "pwd",
  role: USER_ROLE.DESK,
  deskId: "Desk 2",
};

export const TEST_ACCOUNTS = [
  TEST_TOTEM_ACCOUNT,
  TEST_DESK_1_ACCOUNT,
  TEST_DESK_2_ACCOUNT,
];
