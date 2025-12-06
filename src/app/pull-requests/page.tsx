import PRList from '@/components/PRList';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function PullRequestsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Projekty zmian prawnych
          </h1>
          <p className="text-gray-600">
            Przeglądaj i komentuj zmiany w aktach prawnych
          </p>
        </div>

        <div className="mb-6">
          {token ? (
            <Link
              href="/pull-requests/new"
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              + Nowy pull request
            </Link>
          ) : (
            <p className="text-amber-700 bg-amber-50 p-4 rounded">
              <Link href="/login" className="font-medium hover:underline">
                Zaloguj się
              </Link>{' '}
              aby utworzyć pull request (dostępne tylko dla ekspertów)
            </p>
          )}
        </div>

        <PRList token={token} />
      </div>
    </main>
  );
}
