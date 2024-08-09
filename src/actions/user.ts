"use server";
import { createServerClient } from "@/lib/supabase/ServerClient";

export const getUserEmail = async (id: string) => {
  const supabase = createServerClient();
  return supabase.from("user_profiles").select("email").eq("id", id);
};
