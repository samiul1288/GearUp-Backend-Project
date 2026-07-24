export type TCreateCategory = {
  name: string;
  description?: string;
  icon?: string;
};

export type TUpdateCategory = Partial<TCreateCategory>;
