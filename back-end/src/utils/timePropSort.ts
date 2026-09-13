import type { Ticket } from "shared-code";

export function timePropSort(
  timeProp: "createdAt" | "calledAt" | "startedAt" | "completedAt",
  isAscending: boolean = true,
) {
  const timePropExists = (
    ticket: Ticket,
  ): ticket is Ticket & {
    [K in typeof timeProp]: Date;
  } => ticket[timeProp] !== undefined;

  return (a: Ticket, b: Ticket) => {
    if (!timePropExists(a) && !timePropExists(b)) {
      return 0;
    }
    if (!timePropExists(a)) {
      return isAscending ? 1 : -1;
    }
    if (!timePropExists(b)) {
      return isAscending ? -1 : 1;
    }
    if (isAscending) {
      return a[timeProp].getTime() - b[timeProp].getTime();
    }
    return b[timeProp].getTime() - a[timeProp].getTime();
  };
}
