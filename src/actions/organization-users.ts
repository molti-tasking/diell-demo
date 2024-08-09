"use server";

import { createServerClient } from "@/lib/supabase/ServerClient";
import { Database } from "@/lib/supabase/types";

export type OrganizationMember = {
  user_id: string;
  account_role: Database["public"]["Enums"]["account_role"];
  name: string;
  email: string;
};
export const getOrganizationMembers = async (organization_id: string) => {
  const supabase = createServerClient();
  return supabase.rpc<
    "get_organization_members",
    {
      Args: {
        organization_id: string;
        results_limit?: number | undefined;
        results_offset?: number | undefined;
      };
      Returns: OrganizationMember[];
    }
  >("get_organization_members", {
    organization_id,
  });
};

export const removeUserFromOrganization = async (
  user_id: string,
  organization_id: string
) => {
  const supabase = createServerClient();
  return supabase.rpc("remove_organization_member", {
    organization_id,
    user_id,
  });
};
