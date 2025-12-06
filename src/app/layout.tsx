import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitPrawo - System Monitorowania Legislacji",
  description: "Platforma do śledzenia zmian w polskim prawie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" style={{ background: '#fff' }}>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body className="bg-white text-gray-900 antialiased" style={{ background: '#fff' }}>
        <header className="bg-[#1e3a8a] text-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="text-2xl font-bold">GitPrawo</div>
                <div className="hidden md:block text-sm text-blue-200">
                  System Monitorowania Legislacji
                </div>
              </Link>
              <nav className="flex space-x-6">
                <Link 
                  href="/" 
                  className="hover:text-blue-200 transition-colors"
                >
                  Akty prawne
                </Link>
                <Link 
                  href="/about" 
                  className="hover:text-blue-200 transition-colors"
                >
                  O projekcie
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-100 border-t border-gray-200 mt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
              <p>© 2025 GitPrawo - Otwarty system monitorowania legislacji</p>
                <div className="flex space-x-4 mt-2 md:mt-0">
                  <Link href="/about" className="hover:text-[#1e3a8a] transition-colors flex items-center">
                    O projekcie
                  </Link>
                  <a href="https://github.com/igorjakus/gitprawo" target="_blank" rel="noopener noreferrer" className="hover:text-[#1e3a8a] transition-colors flex items-center">
                    GitHub
                  </a>
                </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
