import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { z } from "zod";

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  let email = "";
  try {
    if (searchParams.email) {
      email = z.string().email().parse(searchParams.email);
    }
  } catch (error) {
    console.log(error);
  }

  return (
    <div className="flex-1 flex flex-col w-80 justify-center">
      <h2 className="text-xl mb-4">Reset Password</h2>
      <ResetPasswordForm initialEmail={email} />
    </div>
  );
}
