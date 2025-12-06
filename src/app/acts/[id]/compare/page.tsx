import { notFound } from 'next/navigation';
import Link from 'next/link';
import DiffViewer from '@/components/DiffViewer';
import { getDiff } from '@/lib/get_diff';
import { getActById, getVersionContent } from '@/lib/acts';
import AICompareFeedback from '@/components/AICompareFeedback';

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
    return null; // Lub notFound()
  }

  const fromVersion = act.versions.find((v) => v.id === fromId);
  const toVersion = act.versions.find((v) => v.id === toId);

  if (!fromVersion || !toVersion) {
    return null;
  }

  const [fromContent, toContent] = await Promise.all([
    getVersionContent(fromId),
    getVersionContent(toId),
  ]);

  if (!fromContent || !toContent) {
    return (
        <div className="container mx-auto px-4 py-8 text-center text-red-600">
            Nie udało się pobrać treści wersji do porównania.
        </div>
    );
  }

  const diffLines = getDiff(fromContent, toContent);

  // Obliczenia statystyk do wyświetlenia
  const addedCount = diffLines.filter((l) => l.type === 'added').length;
  const removedCount = diffLines.filter((l) => l.type === 'removed').length;
  const totalChanges = diffLines.filter((l) => l.type !== 'unchanged').length;

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

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">+{addedCount}</div>
          <div className="text-sm text-gray-600">Dodanych linii</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">-{removedCount}</div>
          <div className="text-sm text-gray-600">Usuniętych linii</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#1e3a8a]">{totalChanges}</div>
          <div className="text-sm text-gray-600">Łączna liczba zmian</div>
        </div>
      </div>

      {/* AI Summary (client-side, on demand) */}
      <div id="ai-summary" className="mt-8">
        <AICompareFeedback fromContent={fromContent} toContent={toContent} />
      </div>

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
    </div>
  );
}