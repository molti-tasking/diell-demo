import { z } from "zod";

export const productCategories = z.enum([
  "emergency",
  "cardiology",
  // assume further categories here
]);

export type ProductCategoryType = z.infer<typeof productCategories>;
