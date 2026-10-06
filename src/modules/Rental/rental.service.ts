import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { TCreateRental } from "./rental.interface";
import { RentalStatus, UserRole } from "../../../generated/prisma/enums";

// Create Rental (Customer only)
const createRentalIntoDB = async (
  customerId: string,
  payload: TCreateRental,
) => {
  const { gearId, startDate, endDate } = payload;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError(400, "Invalid date format!");
  }

  if (start >= end) {
    throw new AppError(400, "End date must be after start date!");
  }

  // Calculate total rental days
  const diffTime = end.getTime() - start.getTime();

  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if Gear exists and is available
  const gear = await prisma.gear.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new AppError(404, "Gear not found!");
  }

  if (!gear.isAvailable) {
    throw new AppError(400, "This gear is currently unavailable for rent!");
  }

  // Calculate total rental amount
  const totalAmount = Number(gear.pricePerDay) * totalDays;

  // Create Rental Transaction
  const rental = await prisma.rental.create({
    data: {
      gearId,
      customerId,
      startDate: start,
      endDate: end,
      totalDays,
      totalAmount,
      status: RentalStatus.PENDING,
    },

    include: {
      gear: {
        select: {
          id: true,
          title: true,
          pricePerDay: true,
          location: true,
          images: true,
        },
      },

      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return rental;
};

// Get My Rentals
// Customer gets own rentals,
// Provider gets rentals of their gears,
// Admin gets all rentals
const getMyRentalsFromDB = async (userId: string, userRole: UserRole) => {
  let whereConditions: any = {};

  if (userRole === UserRole.CUSTOMER) {
    whereConditions = {
      customerId: userId,
    };
  } else if (userRole === UserRole.PROVIDER) {
    whereConditions = {
      gear: {
        providerId: userId,
      },
    };
  }

  const rentals = await prisma.rental.findMany({
    where: whereConditions,

    include: {
      gear: {
        select: {
          id: true,
          title: true,
          images: true,
          pricePerDay: true,
        },
      },

      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      payment: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return rentals;
};

// Get Single Rental Details
const getRentalByIdFromDB = async (
  rentalId: string,
  userId: string,
  userRole: UserRole,
) => {
  const rental = await prisma.rental.findUnique({
    where: {
      id: rentalId,
    },

    include: {
      gear: {
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },

      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      payment: true,
    },
  });

  if (!rental) {
    throw new AppError(404, "Rental booking not found!");
  }

  // Access Control:
  // Customer, Gear Provider, or Admin
  if (
    userRole !== UserRole.ADMIN &&
    rental.customerId !== userId &&
    rental.gear.providerId !== userId
  ) {
    throw new AppError(403, "You do not have permission to view this booking!");
  }

  return rental;
};

// Update Rental Status
// Provider or Admin
const updateRentalStatusInDB = async (
  rentalId: string,
  userId: string,
  userRole: UserRole,
  status: RentalStatus,
) => {
  const rental = await prisma.rental.findUnique({
    where: {
      id: rentalId,
    },

    include: {
      gear: true,
    },
  });

  if (!rental) {
    throw new AppError(404, "Rental booking not found!");
  }

  // Only Admin or the Provider owning the gear
  // can change rental status
  if (userRole !== UserRole.ADMIN && rental.gear.providerId !== userId) {
    throw new AppError(
      403,
      "You are not authorized to update this rental status!",
    );
  }

  const updatedRental = await prisma.rental.update({
    where: {
      id: rentalId,
    },

    data: {
      status,
    },

    include: {
      gear: true,
      customer: true,
    },
  });

  return updatedRental;
};

export const RentalServices = {
  createRentalIntoDB,
  getMyRentalsFromDB,
  getRentalByIdFromDB,
  updateRentalStatusInDB,
};
