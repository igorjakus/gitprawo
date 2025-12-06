import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Act } from '../../../types';
import LegislativeTrain from '../../../components/LegislativeTrain';
import VersionHistory from '../../../components/VersionHistory';

// Mock data - same as in page.tsx
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

async function getAct(id: string): Promise<Act | null> {
  // Later: fetch from database
  const act = mockActs.find((a) => a.id === id);
  return act || null;
}

export default async function ActPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const act = await getAct(id);

  if (!act) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-[#1e3a8a]">
          Strona główna
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{act.shortTitle}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="px-3 py-1 text-sm font-medium text-[#1e3a8a] bg-blue-50 rounded">
                {act.type.toUpperCase()}
              </span>
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${
                  act.status === 'active'
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-700 bg-gray-50'
                }`}
              >
                {act.status === 'active' ? 'Aktywny' : act.status}
              </span>
              <span className="text-sm text-gray-500">
                Wersja {act.versions[0]?.version || 'N/A'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {act.shortTitle}
            </h1>
            <p className="text-gray-600 mb-4">{act.title}</p>
            <p className="text-gray-700 mb-4">{act.description}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Data publikacji:</span>{' '}
                {act.publishDate}
              </div>
              {act.effectiveDate && (
                <>
                  <span>•</span>
                  <div>
                    <span className="font-medium">Data wejścia w życie:</span>{' '}
                    {act.effectiveDate}
                  </div>
                </>
              )}
              <span>•</span>
              <div>
                <span className="font-medium">Wersje:</span> {act.versions.length}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded hover:bg-[#3b82f6] transition-colors">
              Zobacz pełny tekst
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
              Eksportuj
            </button>
          </div>
        </div>
      </div>

      {/* Legislative Train */}
      <div className="mb-6">
        <LegislativeTrain stages={act.legislativeStages} />
      </div>

      {/* Version History */}
      <VersionHistory actId={act.id} versions={act.versions} />

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#1e3a8a]">
            {act.versions.length}
          </div>
          <div className="text-sm text-gray-600">Wersji</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            +
            {act.versions.reduce(
              (sum, v) => sum + (v.additions || 0),
              0
            )}
          </div>
          <div className="text-sm text-gray-600">Dodanych linii</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            -
            {act.versions.reduce(
              (sum, v) => sum + (v.deletions || 0),
              0
            )}
          </div>
          <div className="text-sm text-gray-600">Usuniętych linii</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#1e3a8a]">
            {act.legislativeStages.filter((s) => s.status === 'completed')
              .length}
            /{act.legislativeStages.length}
          </div>
          <div className="text-sm text-gray-600">Etapów ukończonych</div>
        </div>
      </div>
    </div>
  );
}
