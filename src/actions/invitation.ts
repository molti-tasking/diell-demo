"use server";
import { createServerClient } from "@/lib/supabase/ServerClient";
import { Database } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { removeInvitationToken } from "./auth";

type Functions = Database["public"]["Functions"];
type AccountRole = Database["public"]["Enums"]["account_role"];

type CreateInvitation = {
  Args: Functions["create_invitation"]["Args"];
  Returns: { token: string };
};
const createInvitation = async (organizationId: string) => {
  const supabaseClient = createServerClient();

  return await supabaseClient.rpc<"create_invitation", CreateInvitation>(
    "create_invitation",
    {
      account_role: "owner",
      invitation_type: "one_time",
      organization_id: organizationId,
    }
  );
};
export const createInvitationLink = async (organizationId: string) => {
  const origin = headers().get("origin");
  const { data, error } = await createInvitation(organizationId);
  if (!data?.token || error) {
    if (error) {
      console.log("Error with sending invitation: ", error);
      return { error: "No token: " + String(error) };
    }
  }
  const link = `${origin}/dashboard/claim-invitation?invitationToken=${data.token}`;
  return { data: { link } };
};

type GetOrganizationInvitations = {
  Args: Functions["get_organization_invitations"]["Args"];
  Returns: {
    account_role: AccountRole;
    created_at: string;
    invitation_type: string;
    invitation_id: string;
  }[];
};
export const getOrganizationInvitations = async (organization_id: string) => {
  const supabaseClient = createServerClient();
  return await supabaseClient.rpc<
    "get_organization_invitations",
    GetOrganizationInvitations
  >("get_organization_invitations", { organization_id });
};

export const deleteInvitation = async (invitation_id: string) => {
  const supabaseClient = createServerClient();
  revalidatePath("/dashboard");
  return await supabaseClient.rpc("delete_invitation", {
    invitation_id,
  });
};

type LookupInvitation = {
  Args: Functions["lookup_invitation"]["Args"];
  Returns: { active: boolean; account_name: string };
};
export const lookupInvitation = async (token: string) => {
  const supabaseClient = createServerClient();
  revalidatePath("/dashboard");
  return await supabaseClient.rpc<"lookup_invitation", LookupInvitation>(
    "lookup_invitation",
    {
      lookup_invitation_token: token,
    }
  );
};

type AcceptInvitation = {
  Args: Functions["accept_invitation"]["Args"];
  Returns: { organization_id: string; account_role: AccountRole };
};
export const acceptInvitation = async (token: string) => {
  revalidatePath("/dashboard");
  const supabaseClient = createServerClient();
  const res = await supabaseClient.rpc<"accept_invitation", AcceptInvitation>(
    "accept_invitation",
    {
      lookup_invitation_token: token,
    }
  );
  if (!res.error) {
    const removeRes = await removeInvitationToken();
    if (removeRes?.error) {
      console.log("Error removing invitation token: ", removeRes.error);
    }
  }

  return res;
};

export const sendInviteLink = async (
  organizationId: string,
  organizationName: string,
  emailRecipients: string[]
) => {
  const origin = headers().get("origin");
  const res = await Promise.all(
    emailRecipients.map(async (recipient) => {
      const { data, error } = await createInvitation(organizationId);
      if (!data?.token || error) {
        if (error) console.log("Error with sending invitation: ", error);
        return { error: "No token: " + String(error) };
      }
      const link = `${origin}/dashboard/claim-invitation?invitationToken=${data.token}`;

      console.log(
        "Send email with link: " + link,
        " to recipient: " + recipient + " for org: " + organizationName
      );
    })
  );
  console.log("All Res: ", res);
  return "SUCCESS";
};
