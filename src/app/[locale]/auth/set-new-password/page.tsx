import { SetNewPasswordForm } from "@/components/auth/SetNewPasswordForm";

export default async function SetNewPassword({
  searchParams,
}: {
  searchParams: { code?: string; error_description?: string };
}) {
  if (searchParams.error_description) {
    return (
      <div className="flex-1 flex flex-col w-80 justify-center">
        {searchParams.error_description}
      </div>
    );
  }

  if (!searchParams.code) {
    // const profile = await getUser();
    // console.log(profile);
    // if (profile) {
    //   return (
    //     <div className="flex-1 flex flex-col w-80 justify-center">
    //       <pre>{JSON.stringify(profile, null, 2)}</pre>
    //       <SetNewPasswordForm />
    //     </div>
    //   );
    // }

    return (
      <div className="flex-1 flex flex-col w-80 justify-center">
        Oh no... Reset Code is missing!!!
      </div>
    );
  }
  try {
    // const profile = await getUser();
    // if (!!profile) {
    //   <div className="flex-1 flex flex-col w-80 justify-center">
    //     <SetNewPasswordForm />
    //   </div>;
    // }
    // const auth = await authenticateWithCode(searchParams.code);
    // console.log(auth);
    // if (auth.data) {
    //   redirect("/auth/set-new-password");
    // }
    return (
      <div className="flex-1 flex flex-col w-80 justify-center">
        <h2 className="text-xl mb-4">Set new password</h2>
        <SetNewPasswordForm code={searchParams.code} />
      </div>
    );
  } catch (error) {
    console.log(error);
    return (
      <div className="flex-1 flex flex-col w-80 justify-center">
        Code expired
      </div>
    );
  }
}
