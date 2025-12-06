import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DiffLine } from '../../../../types';
import DiffViewer from '../../../../components/DiffViewer';
import { getDiff } from '../../../../lib/get_diff';

const mockVersionData = {
  v1: { 
    version: 'v1.2.1', 
    date: '2024-01-01', 
    title: 'Poprawki techniczne',
    content: `Art. 1. [Podstawy stosunków cywilnoprawnych]
Kodeks cywilny normuje stosunki cywilnoprawne między osobami fizycznymi i prawnymi.

Art. 2. [Zasada ochrony konsumenta]
§ 1. Konsument jest chroniony na zasadach określonych w niniejszym kodeksie.
§ 2. Przez konsumenta rozumie się osobę fizyczną.

Art. 3. [Zdolność prawna]
Każdy człowiek od chwili urodzenia ma zdolność prawną.`
  },
  v2: { 
    version: 'v1.2.2', 
    date: '2024-06-10', 
    title: 'Ochrona konsumentów',
    content: `Art. 1. [Podstawy stosunków cywilnoprawnych]
Kodeks cywilny normuje stosunki cywilnoprawne między osobami fizycznymi i prawnymi.

Art. 2. [Zasada ochrony konsumenta]
§ 1. Konsument podlega szczególnej ochronie prawnej zgodnie z przepisami niniejszego kodeksu oraz regulacjami UE.
§ 2. Przez konsumenta rozumie się osobę fizyczną dokonującą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.

Art. 3. [Zdolność prawna]
Każdy człowiek od chwili urodzenia ma zdolność prawną.

Art. 15. [Umowy elektroniczne]
§ 1. Umowa zawarta drogą elektroniczną jest ważna, jeżeli strony postanowiły tak uczynić.

Art. 16. [Forma szczególna]
Czynność prawna wymaga formy szczególnej tylko wtedy, gdy przepis prawa tak stanowi.`
  },
  v3: { 
    version: 'v1.2.3', 
    date: '2024-11-15', 
    title: 'Umowy elektroniczne',
    content: `Art. 1. [Podstawy stosunków cywilnoprawnych]
Kodeks cywilny normuje stosunki cywilnoprawne między osobami fizycznymi i prawnymi.

Art. 2. [Zasada ochrony konsumenta]
§ 1. Konsument podlega szczególnej ochronie prawnej zgodnie z przepisami niniejszego kodeksu oraz regulacjami UE.
§ 2. Przez konsumenta rozumie się osobę fizyczną dokonującą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.

Art. 3. [Zdolność prawna]
Każdy człowiek od chwili urodzenia ma zdolność prawną.

Art. 15. [Umowy elektroniczne]
§ 1. Umowa zawarta drogą elektroniczną jest równoważna z umową zawartą w formie pisemnej, chyba że przepis szczególny stanowi inaczej.
§ 2. Za moment zawarcia umowy drogą elektroniczną uznaje się moment, w którym oferta doszła do oferenta w sposób umożliwiający zapoznanie się z jej treścią.

Art. 15a. [Podpis elektroniczny]
§ 1. Dokument w postaci elektronicznej opatrzony kwalifikowanym podpisem elektronicznym jest równoważny z dokumentem w postaci papierowej opatrzonym podpisem własnoręcznym.
§ 2. Dokument elektroniczny może być również uwierzytelniony za pomocą innych środków identyfikacji elektronicznej, jeżeli zapewniają one porównywalny poziom bezpieczeństwa.

Art. 16. [Forma szczególna]
Czynność prawna wymaga formy szczególnej tylko wtedy, gdy przepis prawa tak stanowi.`
  },
};

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
  const fromId = resolvedSearchParams.from as string | undefined;
  const toId = resolvedSearchParams.to as string | undefined;

  if (!fromId || !toId) {
    notFound();
  }

  // Get version data
  const fromVersion = mockVersionData[fromId as keyof typeof mockVersionData];
  const toVersion = mockVersionData[toId as keyof typeof mockVersionData];

  if (!fromVersion || !toVersion) {
    notFound();
  }

  // Get diff data
  const diffLines = getDiff(fromVersion.content, toVersion.content);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-[#1e3a8a]">
          Strona główna
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/acts/${actId}`} className="hover:text-[#1e3a8a]">
          Kodeks cywilny
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
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
            Eksportuj diff
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded hover:bg-[#3b82f6] transition-colors">
            Zobacz pełny tekst
          </button>
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
