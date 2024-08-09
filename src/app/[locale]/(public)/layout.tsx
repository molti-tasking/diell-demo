import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "./Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PublicHeader />
      <main className="w-full">{children}</main>
      <Footer />
    </>
  );
}
