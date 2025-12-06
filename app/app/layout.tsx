import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minimal Blog",
  description: "A simple blog app built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800 antialiased">
        <header className="py-4 bg-gray-100 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold">GitPrawo</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="py-4 bg-gray-100 text-center">
          <p className="text-sm text-gray-600">© 2025 GitPrawo</p>
        </footer>
      </body>
    </html>
  );
}
