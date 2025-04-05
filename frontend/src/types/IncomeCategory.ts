export type IncomeCategory = {
  _id: string;
  name: string;
};

export type IncomeCategoryResponse = {
  categories: IncomeCategory[];
};
