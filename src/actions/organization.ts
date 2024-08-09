"use server";

import { createServerClient } from "@/lib/supabase/ServerClient";
import { ExtractType } from "@/lib/util/types";
import { revalidatePath } from "next/cache";

export const getOrganization = async (id: string) => {
  const supabase = createServerClient();
  return supabase.from("organization").select().eq("id", id).single();
};

export type Organization = ExtractType<ReturnType<typeof getOrganizations>>;

/**
 * Should only be availabe for a user that is part of organizations.
 *
 * @returns A list of all organizations a user is part of
 */
export const getOrganizations = async () => {
  const supabase = createServerClient();
  return await supabase.from("organization").select(
    `*,
    organization_verified(verified)`
  );
};

export const createOrganization = async ({ name }: { name: string }) => {
  const supabase = createServerClient();
  revalidatePath("/dashboard");
  return await supabase.from("organization").insert({ name }).select("id");
};

export const addUserToOrganization = async (
  user_id: string,
  organization_id: string
) => {
  const supabase = createServerClient();
  return supabase
    .from("organization_user")
    .insert({ account_role: "owner", organization_id, user_id });
};

export const deleteOrganization = async (organizationId: string) => {
  const supabaseClient = createServerClient();
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return await supabaseClient
    .from("organization")
    .delete()
    .eq("id", organizationId);
};
