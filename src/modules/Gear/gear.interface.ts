export type TCreateGear = {
  title: string;
  description: string;
  pricePerDay: number;
  location: string;
  images?: string[];
  brand?: string;
  categoryId: string;
};

export type TUpdateGear = Partial<TCreateGear>;

export type TGearFilterOptions = {
  searchTerm?: string;
  categoryId?: string;
  location?: string;
  brand?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  isAvailable?: boolean | string;
};
