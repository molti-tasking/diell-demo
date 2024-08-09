import "./legal-statement.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="container py-16 legal-statement">{children}</div>;
}
