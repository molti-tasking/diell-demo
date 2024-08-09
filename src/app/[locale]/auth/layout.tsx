import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { XIcon } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false } };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center bg-gray-50">
        <header className="px-8 md:px-16 py-6 flex flex-row justify-between items-center absolute left-0 right-0 top-0">
          <Link href="/" className="flex items-center">
            <Image
              src={"/company-logo.png"}
              width={100}
              height={100}
              alt="Company Logo"
            />
          </Link>
          <Link href="/">
            <Button
              variant={"ghost"}
              className="rounded-full aspect-square p-1"
            >
              <XIcon />
            </Button>
          </Link>
        </header>

        <main className="h-screen flex items-center justify-center">
          {children}
        </main>
      </div>
    </>
  );
}
