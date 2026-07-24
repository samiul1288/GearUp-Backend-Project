export type TCreateCategory = {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
};

export type TUpdateCategory = Partial<TCreateCategory>;
