export type TCreateReview = {
  gearId: string;
  rentalId: string;
  rating: number; // 1 to 5
  comment?: string;
};

export type TUpdateReview = Partial<Omit<TCreateReview, "gearId" | "rentalId">>;
