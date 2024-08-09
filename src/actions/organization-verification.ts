"use server";

import { createServerClient } from "@/lib/supabase/ServerClient";
import { revalidatePath } from "next/cache";

export const verifyOrganization = async ({
  organizationId,
  verified,
}: {
  organizationId: string;

  verified: boolean;
}) => {
  const supabaseClient = createServerClient();
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  const res = await supabaseClient.from("organization_verified").upsert({
    organization_id: organizationId,
    verified: verified,
  });

  return res;
};
