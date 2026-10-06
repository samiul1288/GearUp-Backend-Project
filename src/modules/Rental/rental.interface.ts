import { RentalStatus } from "../../../generated/prisma/enums";

export type TCreateRental = {
  gearId: string;
  startDate: string; // ISO date string e.g., "2026-09-01"
  endDate: string; // ISO date string e.g., "2026-09-05"
};

export type TUpdateRentalStatus = {
  status: RentalStatus;
};
