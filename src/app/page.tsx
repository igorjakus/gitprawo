import Link from 'next/link';
import { Act } from '../types';

// Mock data - later from database
const mockActs: Act[] = [
  {
    id: '1',
    title: 'Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny',
    shortTitle: 'Kodeks cywilny',
    type: 'ustawa',
    publishDate: '1964-04-23',
    effectiveDate: '1964-01-01',
    status: 'active',
    description: 'Podstawowy akt prawny regulujący stosunki cywilnoprawne w Polsce',
    versions: [
      {
        id: 'v3',
        version: 'v1.2.3',
        date: '2024-11-15',
        author: 'Sejm RP',
        commitMessage: 'Nowelizacja dotycząca umów elektronicznych',
        changes: 45,
        additions: 30,
        deletions: 15,
      },
      {
        id: 'v2',
        version: 'v1.2.2',
        date: '2024-06-10',
        author: 'Sejm RP',
        commitMessage: 'Aktualizacja przepisów o ochronie konsumentów',
        changes: 23,
        additions: 18,
        deletions: 5,
      },
      {
        id: 'v1',
        version: 'v1.2.1',
        date: '2024-01-01',
        author: 'Sejm RP',
        commitMessage: 'Poprawki techniczne i doprecyzowanie artykułów',
        changes: 12,
        additions: 8,
        deletions: 4,
      },
    ],
    legislativeStages: [
      {
        name: 'Projekt',
        status: 'completed',
        date: '2024-10-01',
      },
      {
        name: 'Komisja',
        status: 'completed',
        date: '2024-10-15',
      },
      {
        name: 'Sejm',
        status: 'completed',
        date: '2024-11-01',
      },
      {
        name: 'Senat',
        status: 'completed',
        date: '2024-11-10',
      },
      {
        name: 'Publikacja',
        status: 'completed',
        date: '2024-11-15',
      },
    ],
  },
  {
    id: '2',
    title: 'Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny',
    shortTitle: 'Kodeks karny',
    type: 'ustawa',
    publishDate: '1997-06-06',
    effectiveDate: '1997-09-01',
    status: 'active',
    description: 'Podstawowy akt prawny prawa karnego w Polsce',
    versions: [
      {
        id: 'v2',
        version: 'v2.1.0',
        date: '2024-09-20',
        author: 'Sejm RP',
        commitMessage: 'Zaostrzenie kar za przestępstwa w cyberprzestrzeni',
        changes: 67,
        additions: 52,
        deletions: 15,
      },
    ],
    legislativeStages: [
      {
        name: 'Projekt',
        status: 'completed',
        date: '2024-08-01',
      },
      {
        name: 'Komisja',
        status: 'completed',
        date: '2024-08-20',
      },
      {
        name: 'Sejm',
        status: 'in-progress',
        date: '2024-09-05',
      },
      {
        name: 'Senat',
        status: 'pending',
      },
      {
        name: 'Publikacja',
        status: 'pending',
      },
    ],
  },
  {
    id: '3',
    title: 'Ustawa z dnia 2 kwietnia 1997 r. - Konstytucja Rzeczypospolitej Polskiej',
    shortTitle: 'Konstytucja RP',
    type: 'konstytucja',
    publishDate: '1997-04-02',
    effectiveDate: '1997-10-17',
    status: 'active',
    description: 'Ustawa zasadnicza Rzeczypospolitej Polskiej',
    versions: [
      {
        id: 'v1',
        version: 'v1.0.0',
        date: '1997-04-02',
        author: 'Zgromadzenie Narodowe',
        commitMessage: 'Uchwalenie Konstytucji RP',
        changes: 243,
      },
    ],
    legislativeStages: [
      {
        name: 'Projekt',
        status: 'completed',
        date: '1997-01-15',
      },
      {
        name: 'ZN',
        status: 'completed',
        date: '1997-04-02',
        description: 'Uchwalona przez Zgromadzenie Narodowe',
      },
      {
        name: 'Referendum',
        status: 'completed',
        date: '1997-05-25',
        description: 'Przyjęta w referendum ogólnokrajowym',
      },
      {
        name: 'Publikacja',
        status: 'completed',
        date: '1997-07-16',
      },
    ],
  },
];

export default async function Home() {
  const acts = mockActs;

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
    <div className="container mx-auto px-4 py-8">
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Acts List */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Akty prawne</h2>
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
                    {update.date} • {update.version}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/updates"
              className="block mt-4 text-center text-sm text-[#3b82f6] hover:text-[#1e3a8a] font-medium"
            >
              Zobacz wszystkie zmiany →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
