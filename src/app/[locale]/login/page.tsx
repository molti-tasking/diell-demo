import { getUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function Login() {
  const { data, error } = await getUser();
  console.log("Check user: ", data, error);
  if (!data?.user) {
    return redirect("/auth/login");
  } else {
    return redirect("/dashboard");
  }
}
