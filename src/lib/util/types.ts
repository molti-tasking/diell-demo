import { PostgrestSingleResponse } from "@supabase/supabase-js";

// Utility type to extract the type
export type ExtractType<T> = T extends Promise<
  PostgrestSingleResponse<(infer U)[]>
>
  ? U
  : never;
