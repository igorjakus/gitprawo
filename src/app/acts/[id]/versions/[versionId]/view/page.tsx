import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { getActById, getVersionContent } from '@/lib/acts';

export default async function ActVersionViewPage({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>;
}) {
  const { id, versionId } = await params;
  const act = await getActById(id);
  
  if (!act) {
    notFound();
  }

  const version = act.versions.find((v) => v.id === versionId);
  if (!version) {
    notFound();
  }

  const content = await getVersionContent(versionId);
  if (!content) {
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
        <Link href={`/acts/${act.id}`} className="hover:text-[#1e3a8a]">
          {act.shortTitle}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Wersja {version.version}</span>
      </nav>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {act.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {version.version}
              </span>
              <span>{version.date}</span>
              <span>{version.author}</span>
            </div>
          </div>
          <a
            href={`/api/acts/${act.id}/versions/${version.id}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            download
          >
            Pobierz oryginał
          </a>
        </div>

        <div className="prose prose-blue max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
