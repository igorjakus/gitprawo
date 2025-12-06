import { notFound } from 'next/navigation';
import Link from 'next/link';
import LegislativeTrain from '../../../components/LegislativeTrain';
import VersionHistory from '../../../components/VersionHistory';
import { getActById } from '../../../lib/acts';

export default async function ActPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const act = await getActById(id);

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
                    : act.status === 'draft'
                      ? 'text-yellow-700 bg-yellow-50'
                      : 'text-gray-700 bg-gray-50'
                }`}
              >
                {act.status === 'active' ? 'Aktywny' : act.status === 'draft' ? 'Projekt' : 'Archiwalny'}
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
            {act.versions[0] ? (
              <a
                href={`/api/acts/${act.id}/versions/${act.versions[0].id}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                download
              >
                Eksportuj
              </a>
            ) : (
              <button
                className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded cursor-not-allowed"
                disabled
              >
                Eksportuj
              </button>
            )}
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
