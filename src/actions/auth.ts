"use server";

import { createServerClient } from "@/lib/supabase/ServerClient";
import { INVITATION_TOKEN_KEY } from "@/lib/util/invitation";
import { headers } from "next/headers";

type AuthParams = {
  email: string;
  password: string;
};

export const signInWithPassword = async ({ email, password }: AuthParams) => {
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.log("Sign in error: ", error);
    const { code, name, message, status, cause } = error;
    return {
      data: null,
      error: { code, name, message, status, cause },
    };
  }

  return {
    data: data,
    error: null,
  };
};

export const signUpWithPassword = async ({
  email,
  password,
  invitationToken,
}: AuthParams & { invitationToken?: string }) => {
  const origin = headers().get("origin");
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      ...(invitationToken && {
        data: { [INVITATION_TOKEN_KEY]: invitationToken },
      }),
    },
  });

  console.log("Sign up server res: ", data, error);

  if (error) {
    console.log("Error: ", error);
    const { code, name, message, status, cause } = error;
    return {
      data: null,
      error: { code, name, message, status, cause },
    };
  }

  return {
    data: data,
    error: null,
  };
};

export const resendConfirmationMail = async (email: string) => {
  const origin = headers().get("origin");
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  console.log("Resend confirmation mail res: ", data, error);

  if (error) {
    console.log("Error: ", error);
    const { code, name, message, status, cause } = error;
    return {
      data: null,
      error: { code, name, message, status, cause },
    };
  }

  return {
    data: data,
    error: null,
  };
};

export const resetPassword = async (email: string) => {
  const supabase = createServerClient();
  const origin = headers().get("origin");
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/set-new-password`,
  });
  if (error) {
    console.log("Reset password error: ", error);
    const { code, name, message, status, cause } = error;
    return {
      data: null,
      error: { code, name, message, status, cause },
    };
  }

  return {
    data: data,
    error: null,
  };
};

export const setNewPassword = async (code: string, password: string) => {
  const supabase = createServerClient();

  try {
    const res = await supabase.auth.exchangeCodeForSession(code);
    console.log("Exchanged code for: ", res);
  } catch (error) {
    console.log("Failed with generation of session: ", error);
  }

  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.log("Error: ", error);
    const { code, name, message, status, cause } = error;
    return {
      data: null,
      error: { code, name, message, status, cause },
    };
  }

  return {
    data: data,
    error: null,
  };
};

export const signOut = async () => {
  const supabase = createServerClient();
  return await supabase.auth.signOut();
};

export const getUser = async () => {
  const supabase = createServerClient();
  return await supabase.auth.getUser();
};

export const removeInvitationToken = async () => {
  const supabase = createServerClient();
  const user = await supabase.auth.getUser();

  const user_metadata = user.data.user?.user_metadata;

  if (user_metadata?.[INVITATION_TOKEN_KEY]) {
    return supabase.auth.updateUser({
      data: { [INVITATION_TOKEN_KEY]: null },
    });
  } else {
    console.log("No invitation token found in user metadata.");
  }
};

export const getIsAdmin = async () => {
  const supabase = createServerClient();
  return await supabase.rpc("get_is_admin");
};
