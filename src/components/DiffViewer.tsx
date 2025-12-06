import { DiffLine } from '../types';

interface DiffViewerProps {
  fromVersion: string;
  toVersion: string;
  fromDate: string;
  toDate: string;
  lines: DiffLine[];
}

export default function DiffViewer({
  fromVersion,
  toVersion,
  fromDate,
  toDate,
  lines,
}: DiffViewerProps) {
  const additions = lines.filter((l) => l.type === 'added').length;
  const deletions = lines.filter((l) => l.type === 'removed').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Diff Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-sm text-gray-600">Od:</span>
              <span className="ml-2 font-mono text-sm font-semibold text-[#1e3a8a]">
                {fromVersion}
              </span>
              <span className="ml-2 text-xs text-gray-500">{fromDate}</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <span className="text-sm text-gray-600">Do:</span>
              <span className="ml-2 font-mono text-sm font-semibold text-[#1e3a8a]">
                {toVersion}
              </span>
              <span className="ml-2 text-xs text-gray-500">{toDate}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-600 font-medium">+{additions}</span>
            <span className="text-red-600 font-medium">-{deletions}</span>
            <span className="text-gray-600">
              {additions + deletions} zmian
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm font-medium text-white bg-[#1e3a8a] rounded">
            Unified
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
            Split
          </button>
        </div>
      </div>

      {/* Diff Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {lines.map((line, index) => (
              <tr
                key={index}
                className={`
                  ${line.type === 'added' ? 'diff-line-added' : ''}
                  ${line.type === 'removed' ? 'diff-line-removed' : ''}
                  ${line.type === 'unchanged' ? 'diff-line-unchanged' : ''}
                `}
              >
                <td className="px-2 py-1 text-right text-gray-500 select-none w-12 border-r border-gray-200">
                  {line.lineNumber}
                </td>
                <td className="px-2 py-1 w-8">
                  {line.type === 'added' && (
                    <span className="text-green-600 font-bold">+</span>
                  )}
                  {line.type === 'removed' && (
                    <span className="text-red-600 font-bold">-</span>
                  )}
                  {line.type === 'unchanged' && (
                    <span className="text-gray-400"> </span>
                  )}
                </td>
                <td className="px-2 py-1 whitespace-pre-wrap break-words">
                  {line.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lines.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Brak różnic między wybranymi wersjami
        </div>
      )}
    </div>
  );
}
