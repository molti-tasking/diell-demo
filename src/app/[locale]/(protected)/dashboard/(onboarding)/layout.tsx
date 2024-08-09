import UserAccountButton from "@/components/UserAccountButton";
import { Link } from "@/navigation";
import Image from "next/image";

type Params = {
  children: React.ReactNode;
};
export default async function Layout({ children }: Params) {
  return (
    <>
      <header className="md:absolute md:w-none w-full left-0 top-0 right-0">
        <div className="flex flex-row justify-between container w-full py-4">
          <Link href="#" className="flex">
            <Image
              src={"/company-logo.png"}
              width={100}
              height={100}
              alt="Company Logo"
            />
          </Link>
          <UserAccountButton />
        </div>
      </header>
      <div className="h-full flex flex-col items-center justify-center flex-1">
        {children}
      </div>
    </>
  );
}
