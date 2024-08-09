"use server";

import { createServerClient } from "@/lib/supabase/ServerClient";
import { Database } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";

export type ProductSearchParams = Partial<{ category: string }>;

export type Product = Database["public"]["Tables"]["product"]["Row"];
/**
 * This function should return all products that match certain search criteria.
 * It should be availabe publicly to all users.
 *
 * @param coordinates { latitude: number; longitude: number; }
 * @returns list of all products
 */
export const getProducts = async (search: ProductSearchParams) => {
  const supabaseClient = createServerClient();
  console.log("We ignore search params for the moment: ", search);

  return await supabaseClient.from("product").select();
};

/**
 * This function should return all products that match the slug.
 * It should only return one single product as it is a unique property of the product.
 * It should be availabe publicly to all users.
 *
 * @param input_slug Slug to search by
 * @returns list of products
 */
export const getProductBySlug = async (input_slug: string) => {
  const supabaseClient = createServerClient();
  return await supabaseClient
    .from("product")
    .select()
    .eq("slug", input_slug)
    .single();
};

/**
 * This function should return one products by id.
 * It should be availabe publicly to all users.
 *
 * @param product_id Id of product
 * @returns list of products
 */
export const getProductById = async (product_id: string) => {
  const supabaseClient = createServerClient();
  return await supabaseClient
    .from("product")
    .select()
    .eq("id", product_id)
    .single();
};

/**
 * This function should return all products of the given id.
 *
 *
 * @param organizationId Organization that "owns" the products
 * @returns list of products
 */
export const getProductsByOrg = async (organizationId: string) => {
  const supabaseClient = createServerClient();
  return await supabaseClient
    .from("product")
    .select()
    .eq("organization_id", organizationId);
};

export const createProduct = async ({
  ...values
}: Database["public"]["Tables"]["product"]["Insert"]) => {
  const supabaseClient = createServerClient();
  const res = await supabaseClient
    .from("product")
    .insert({ ...values })
    .select("id");

  revalidatePath("/dashboard");
  return res;
};
