import PRList from '@/components/PRList';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyToken, isExpert } from '@/lib/auth';

export default async function PullRequestsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? verifyToken(token) : null;
  const canCreatePR = user ? isExpert(user) : false;

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
          {canCreatePR ? (
            <div className="flex gap-3">
              <Link
                href="/propozycje-zmian/new"
                className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                + Nowa propozycja zmian
              </Link>
              <Link
                href="/acts/new"
                className="inline-block bg-gray-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                + Dodaj akt prawny
              </Link>
            </div>
          ) : (
            <p className="text-amber-700 bg-amber-50 p-4 rounded">
              {!user ? (
                <>
                  <Link href="/login" className="font-medium hover:underline">
                    Zaloguj się
                  </Link>{' '}
                  aby utworzyć propozycję zmian (dostępne tylko dla ekspertów)
                </>
              ) : (
                <span>Tworzenie propozycji zmian jest dostępne tylko dla ekspertów</span>
              )}
            </p>
          )}
        </div>

        <PRList 
          token={token} 
          currentUserId={user?.id}
          userRole={user?.role}
        />
      </div>
    </main>
  );
}
