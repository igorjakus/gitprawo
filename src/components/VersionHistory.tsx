import Link from 'next/link';
import { ActVersion } from '../types';

interface VersionHistoryProps {
  actId: string;
  versions: ActVersion[];
}

export default function VersionHistory({ actId, versions }: VersionHistoryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Historia Wersji</h3>
        <span className="text-sm text-gray-500">{versions.length} wersji</span>
      </div>

      <div className="space-y-3">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-[#3b82f6] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-semibold text-[#1e3a8a]">
                    {version.version}
                  </span>
                  {index === 0 && (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                      Aktualna
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-900">{version.commitMessage}</p>
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{version.author}</span>
                  <span>•</span>
                  <span>{version.date}</span>
                  <span>•</span>
                  <span className="flex items-center space-x-2">
                    {version.additions !== undefined && (
                      <span className="text-green-600">+{version.additions}</span>
                    )}
                    {version.deletions !== undefined && (
                      <span className="text-red-600">-{version.deletions}</span>
                    )}
                    {version.additions === undefined && version.deletions === undefined && (
                      <span>{version.changes} zmian</span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Link
                  href={`/acts/${actId}/versions/${version.id}/view`}
                  className="px-3 py-1 text-xs font-medium text-[#1e3a8a] bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                >
                  Pokaż
                </Link>
                {index > 0 && (
                  <Link
                    href={`/acts/${actId}/compare?from=${versions[index].id}&to=${versions[index - 1].id}`}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    Porównaj
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {versions.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-[#3b82f6] hover:text-[#1e3a8a] font-medium">
            Zobacz wszystkie wersje →
          </button>
        </div>
      )}
    </div>
  );
}
