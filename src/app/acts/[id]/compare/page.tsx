import { notFound } from 'next/navigation';
import Link from 'next/link';
import DiffViewer from '@/components/DiffViewer';
import { getDiff } from '@/lib/get_diff';
import { getActById, getVersionContent } from '@/lib/acts';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id: actId } = await params;
  const resolvedSearchParams = await searchParams;
  const fromId = Array.isArray(resolvedSearchParams.from)
    ? resolvedSearchParams.from[0]
    : resolvedSearchParams.from;
  const toId = Array.isArray(resolvedSearchParams.to)
    ? resolvedSearchParams.to[0]
    : resolvedSearchParams.to;

  if (!fromId || !toId) {
    notFound();
  }

  const act = await getActById(actId);

  if (!act) {
    notFound();
  }

  const fromVersion = act.versions.find((v) => v.id === fromId);
  const toVersion = act.versions.find((v) => v.id === toId);

  if (!fromVersion || !toVersion) {
    notFound();
  }

  const [fromContent, toContent] = await Promise.all([
    getVersionContent(fromId),
    getVersionContent(toId),
  ]);

  if (!fromContent || !toContent) {
    notFound();
  }

  const diffLines = getDiff(fromContent, toContent);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-[#1e3a8a]">
          Strona główna
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/acts/${actId}`} className="hover:text-[#1e3a8a]">
          {act.shortTitle || act.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Porównanie wersji</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Porównanie wersji
        </h1>
        <p className="text-gray-600">
          Porównanie zmian między wersjami{' '}
          <span className="font-mono font-semibold">{fromVersion.version}</span>{' '}
          i{' '}
          <span className="font-mono font-semibold">{toVersion.version}</span>
        </p>
      </div>

      {/* Diff Viewer */}
      <DiffViewer
        fromVersion={fromVersion.version}
        toVersion={toVersion.version}
        fromDate={fromVersion.date}
        toDate={toVersion.date}
        lines={diffLines}
      />

      {/* Actions */}
      <div className="mt-6 flex justify-between items-center">
        <Link
          href={`/acts/${actId}`}
          className="text-sm text-[#3b82f6] hover:text-[#1e3a8a] font-medium"
        >
          ← Powrót do aktu prawnego
        </Link>
        <div className="flex space-x-3">
          <a
            href={`/api/acts/${actId}/versions/${toVersion.id}?view=true`}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded hover:bg-[#3b82f6] transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zobacz pełny tekst
          </a>
          <a
            href={`/api/acts/${actId}/versions/${toVersion.id}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            download
          >
            Pobierz
          </a>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            +{diffLines.filter((l) => l.type === 'added').length}
          </div>
          <div className="text-sm text-gray-600">Dodanych linii</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            -{diffLines.filter((l) => l.type === 'removed').length}
          </div>
          <div className="text-sm text-gray-600">Usuniętych linii</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#1e3a8a]">
            {diffLines.filter((l) => l.type !== 'unchanged').length}
          </div>
          <div className="text-sm text-gray-600">Łączna liczba zmian</div>
        </div>
      </div>
    </div>
  );
}
