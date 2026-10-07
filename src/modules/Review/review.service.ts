import { prisma } from "../../lib/prisma.js";

import AppError from "../../errors/AppError.js";

import { TCreateReview, TUpdateReview } from "./review.interface.js";

// Create Review (Customer only)
const createReviewIntoDB = async (userId: string, payload: TCreateReview) => {
  const { gearId, rentalId, rating, comment } = payload;

  // Check if gear exists
  const gear = await prisma.gear.findUnique({
    where: {
      id: gearId,
    },
  });

  if (!gear) {
    throw new AppError(404, "Gear not found!");
  }

  // Check if rental exists
  const rental = await prisma.rental.findUnique({
    where: {
      id: rentalId,
    },
  });

  if (!rental) {
    throw new AppError(404, "Rental not found!");
  }

  // Check if rental belongs to this customer
  if (rental.customerId !== userId) {
    throw new AppError(403, "You can only review your own rental!");
  }

  // Check if rental belongs to this gear
  if (rental.gearId !== gearId) {
    throw new AppError(400, "This rental does not belong to this gear!");
  }

  // Check if this rental has already been reviewed
  const existingReview = await prisma.review.findUnique({
    where: {
      rentalId,
    },
  });

  if (existingReview) {
    throw new AppError(400, "You have already reviewed this rental!");
  }

  // Create Review
  const review = await prisma.review.create({
    data: {
      userId,
      gearId,
      rentalId,
      rating,
      comment: comment ?? "",
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },

      gear: {
        select: {
          id: true,
          title: true,
        },
      },

      rental: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          totalDays: true,
          totalAmount: true,
        },
      },
    },
  });

  return review;
};

// Get All Reviews for a Specific Gear
const getGearReviewsFromDB = async (gearId: string) => {
  // Check if gear exists
  const gear = await prisma.gear.findUnique({
    where: {
      id: gearId,
    },
  });

  if (!gear) {
    throw new AppError(404, "Gear not found!");
  }

  const reviews = await prisma.review.findMany({
    where: {
      gearId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },

      rental: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          totalDays: true,
          totalAmount: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
};

// Update Own Review
const updateReviewInDB = async (
  reviewId: string,
  userId: string,
  payload: TUpdateReview,
) => {
  // Find review
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new AppError(404, "Review not found!");
  }

  // Check ownership
  if (review.userId !== userId) {
    throw new AppError(403, "You can only edit your own reviews!");
  }

  // Update Review
  const updatedReview = await prisma.review.update({
    where: {
      id: reviewId,
    },

    data: payload,

    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },

      gear: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return updatedReview;
};

// Delete Review (Review Owner or Admin)
const deleteReviewFromDB = async (
  reviewId: string,
  userId: string,
  userRole: string,
) => {
  // Find review
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new AppError(404, "Review not found!");
  }

  // Check authorization
  if (userRole !== "ADMIN" && review.userId !== userId) {
    throw new AppError(403, "You are not authorized to delete this review!");
  }

  // Delete Review
  const deletedReview = await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  return deletedReview;
};

export const ReviewServices = {
  createReviewIntoDB,
  getGearReviewsFromDB,
  updateReviewInDB,
  deleteReviewFromDB,
};
