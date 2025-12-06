export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1e3a8a] mb-6">O projekcie GitPrawo</h1>
        
        <p className="text-lg text-gray-700 mb-6">
          GitPrawo to innowacyjna platforma do transparentnego monitorowania zmian w polskim prawie, 
          łącząca mechanizmy systemów kontroli wersji z procesem legislacyjnym.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Czym jest GitPrawo?</h2>
        <p className="text-gray-700 mb-6">
          Inspirowani "Legislative Train Schedule" Parlamentu Europejskiego, stworzyliśmy system który:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-8 space-y-2">
          <li>Pokazuje pełną <strong>historię wersji aktów prawnych</strong> w stylu Git</li>
          <li>Umożliwia <strong>porównywanie zmian</strong> (diff) między wersjami</li>
          <li>Wprowadza <strong>Pull Requesty dla prawa</strong> – propozycje zmian z komentarzami</li>
          <li>Wspiera <strong>AI-powered feedback</strong> sprawdzający prostotę języka (B2), ortografię i klarowność</li>
          <li>Wizualizuje <strong>proces legislacyjny</strong> w czytelnej formie</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Kluczowe funkcje</h2>
        
        <div className="space-y-6 mb-8">
          <div className="border-l-4 border-[#3b82f6] pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🔄 Wersjonowanie aktów prawnych</h3>
            <p className="text-gray-700">
              Każda zmiana w prawie jest rejestrowana jako commit. Możesz przeglądać historię, 
              porównywać wersje i śledzić ewolucję przepisów w czasie.
            </p>
          </div>

          <div className="border-l-4 border-[#3b82f6] pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Pull Requesty prawne</h3>
            <p className="text-gray-700">
              Eksperci mogą tworzyć propozycje zmian (PR), dyskutować nad nimi, 
              dodawać komentarze i śledzić status akceptacji – jak w GitHub.
            </p>
          </div>

          <div className="border-l-4 border-[#3b82f6] pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🤖 Wsparcie AI (Gemini)</h3>
            <p className="text-gray-700">
              Automatyczna ocena tekstów prawnych pod kątem prostoty języka (poziom B2), 
              spójności, błędów ortograficznych i klarowności – jak code review, ale dla prawa.
            </p>
          </div>

          <div className="border-l-4 border-[#3b82f6] pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 System uprawnień</h3>
            <p className="text-gray-700">
              Trzy role: Admin, Ekspert, Użytkownik. Każdy może przeglądać i komentować. 
              Eksperci tworzą Pull Requesty. Admini zarządzają systemem.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Technologia</h2>
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
            <li><strong>Frontend:</strong> Next.js 16, React 19, Tailwind CSS</li>
            <li><strong>Backend:</strong> Next.js API Routes</li>
            <li><strong>Baza danych:</strong> PostgreSQL (Neon)</li>
            <li><strong>AI:</strong> Google Gemini 2.5 Flash Lite</li>
            <li><strong>Autentykacja:</strong> JWT + bcrypt</li>
            <li><strong>Deployment:</strong> Vercel</li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dalsze plany</h2>
        <ul className="list-disc pl-6 text-gray-700 mb-8 space-y-2">
          <li>Wizualizacja "Legislative Train" – ścieżka legislacyjna dla każdego aktu</li>
          <li>Tłumacz AI: przekład urzędniczego języka na prosty język obywatelski</li>
          <li>Newsletter z miesięcznymi zmianami w prawie</li>
          <li>Chatbot asystent prawny (edukacyjny, zachowawczy)</li>
          <li>Publiczne konsultacje przez Issues/Komentarze</li>
          <li>Otwarte API dla deweloperów</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Misja</h2>
        <p className="text-gray-700 mb-6">
          Wspieramy <strong>upraszczanie języka legislacyjnego</strong> zgodnie z dyrektywami europejskimi. 
          Wierzymy, że prawo powinno być przejrzyste, dostępne i zrozumiałe dla każdego obywatela.
        </p>

        <div className="bg-blue-50 border-l-4 border-[#1e3a8a] p-4 mb-8">
          <p className="text-sm text-gray-700">
            <strong>Disclaimer:</strong> Aplikacja jest prototypem (PoC). Prezentowane treści prawne mają charakter poglądowy. 
            Jedynym źródłem prawa w RP jest Dziennik Ustaw. AI pełni funkcję edukacyjną, nie stanowi porady prawnej.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Zespół</h2>
        <p className="text-gray-700 mb-4">
          Projekt jest rozwijany w duchu open source. Zapraszamy do współpracy!
        </p>
        <p className="text-gray-600">
          <strong>Kontakt:</strong><br />
          <a href="mailto:igorjakus@protonmail.com" className="text-[#1e3a8a] hover:underline">igorjakus@protonmail.com</a>
          <span className="mx-2">•</span>
          <a href="mailto:goralska.aneta.pl@gmail.com" className="text-[#1e3a8a] hover:underline">goralska.aneta.pl@gmail.com</a>
          <span className="mx-2">•</span>
          <a href="mailto:berlickihubert@gmail.com" className="text-[#1e3a8a] hover:underline">berlickihubert@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
