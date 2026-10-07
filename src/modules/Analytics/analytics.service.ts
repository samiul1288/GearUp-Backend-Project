import { prisma } from "../../lib/prisma.js";
import { PaymentStatus, RentalStatus } from "../../../generated/prisma/enums.js";

const getMetaDataFromDB = async () => {
  // Parallel DB Queries for maximum efficiency
  const [
    totalUsers,
    totalGears,
    totalRentals,
    totalCompletedRentals,
    totalPendingRentals,
    totalEarningsResult,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.gear.count(),
    prisma.rental.count(),
    prisma.rental.count({ where: { status: RentalStatus.COMPLETED } }),
    prisma.rental.count({ where: { status: RentalStatus.PENDING } }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amount: true },
    }),
  ]);

  const totalEarnings = totalEarningsResult._sum.amount || 0;

  // Recent 5 Bookings Overview
  const recentRentals = await prisma.rental.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, email: true } },
      gear: { select: { title: true } },
    },
  });

  return {
    overview: {
      totalUsers,
      totalGears,
      totalRentals,
      totalCompletedRentals,
      totalPendingRentals,
      totalEarnings,
    },
    recentRentals,
  };
};

export const AnalyticsServices = {
  getMetaDataFromDB,
};
