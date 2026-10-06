export type TCreateGear = {
  title: string;
  description: string;
  pricePerDay: number;
  location: string;
  images?: string[];
  categoryId: string;
};

export type TUpdateGear = Partial<TCreateGear>;

export type TGearFilterOptions = {
  searchTerm?: string;
  categoryId?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
};
