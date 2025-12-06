import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-[#1e3a8a] mb-2">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Strona nie znaleziona</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Przepraszamy, strona którą szukasz nie istnieje lub została przeniesiona.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full">
          <p className="text-gray-700 mb-6">
            Przejdź do jednej z poniższych stron:
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="px-6 py-3 text-center text-white bg-[#1e3a8a] rounded hover:bg-[#3b82f6] transition-colors font-medium"
            >
              Strona główna
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 text-center text-[#1e3a8a] bg-blue-50 rounded border border-[#1e3a8a] hover:bg-blue-100 transition-colors font-medium"
            >
              O projekcie
            </Link>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-600">
          <p>Błąd: Strona nie istnieje</p>
          <p className="mt-2">
            Jeśli myślisz, że to błąd, skontaktuj się z nami:{' '}
            <a href="mailto:igorjakus@protonmail.com" className="text-[#1e3a8a] hover:underline">
              igorjakus@protonmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
