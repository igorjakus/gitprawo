import Link from 'next/link';
import { getAllActs } from '../lib/acts';
import { cookies } from 'next/headers';
import { verifyToken, isExpert } from '../lib/auth';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? verifyToken(token) : null;
  const canCreateAct = user ? isExpert(user) : false;
  const acts = await getAllActs();
  
  // Stats
  const activeActs = acts.filter((act) => act.status === 'active').length;
  const totalVersions = acts.reduce((sum, act) => sum + act.versions.length, 0);
  const recentUpdates = acts
    .flatMap((act) =>
      act.versions.map((v) => ({
        ...v,
        actTitle: act.shortTitle,
        actId: act.id,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-2">GitPrawo</h1>
        <p className="text-xl text-blue-100 mb-4">
          System monitorowania zmian w polskim prawie
        </p>
        <p className="text-blue-200 max-w-2xl">
          Śledź historię zmian aktów prawnych, porównuj wersje i monitoruj proces
          legislacyjny w czasie rzeczywistym.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Acts List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Akty prawne</h2>
            {canCreateAct && (
              <Link
                href="/acts/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                + Dodaj akt prawny
              </Link>
            )}
          </div>
          <div className="space-y-4">
            {acts.map((act) => (
              <Link
                key={act.id}
                href={`/acts/${act.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-[#3b82f6] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 text-xs font-medium text-[#1e3a8a] bg-blue-50 rounded">
                        {act.type.toUpperCase()}
                      </span>
                      {act.status === 'active' && (
                        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded">
                          Aktywny
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {act.shortTitle}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{act.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Publikacja: {act.publishDate}</span>
                      <span>•</span>
                      <span>{act.versions.length} wersji</span>
                      <span>•</span>
                      <span>
                        Ostatnia zmiana:{' '}
                        {act.versions[0]?.date || 'brak danych'}
                      </span>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400 ml-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Updates Sidebar */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ostatnie zmiany
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {recentUpdates.map((update) => (
                <div
                  key={`${update.actId}-${update.id}`}
                  className="border-l-2 border-[#3b82f6] pl-3"
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {update.actTitle}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {update.commitMessage}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {update.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats at Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-[#1e3a8a]">{activeActs}</div>
          <div className="text-sm text-gray-600 mt-1">Aktywnych aktów prawnych</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-[#1e3a8a]">{totalVersions}</div>
          <div className="text-sm text-gray-600 mt-1">Wersji w systemie</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-[#1e3a8a]">
            {recentUpdates.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Ostatnich aktualizacji</div>
        </div>
      </div>
    </div>
  );
}
