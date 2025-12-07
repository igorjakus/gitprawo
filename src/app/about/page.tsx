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
          Inspirowani <a className="text-[#1e3a8a] hover:underline" href="https://www.europarl.europa.eu/legislative-train/schedule" target="_blank" rel="noopener noreferrer">Legislative Train Schedule</a> Parlamentu Europejskiego, stworzyliśmy system który:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-8 space-y-2">
          <li>Pokazuje pełną <strong>historię wersji aktów prawnych</strong> z czytelnym śledzeniem zmian</li>
          <li>Umożliwia <strong>porównywanie zmian</strong> między wersjami</li>
          <li>Wprowadza <strong>propozycje zmian</strong> – wnioski legislacyjne z komentarzami</li>
          <li>Wspiera <strong>ocenę językową AI</strong> sprawdzającą prostotę języka (B2), ortografię i klarowność</li>
          <li>Dodaje <strong>AI-owe podsumowania różnic</strong> między wersjami, by szybko zrozumieć zmiany prostym językiem</li>
          <li>Wizualizuje <strong>proces legislacyjny</strong> w czytelnej formie</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Kluczowe funkcje</h2>
        
        <div className="space-y-6 mb-8">
          <div className="border-l-4 border-[#3b82f6] pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🔄 Wersjonowanie aktów prawnych</h3>
            <p className="text-gray-700">
              Każda zmiana w prawie jest rejestrowana w systemie. Możesz przeglądać historię, 
              porównywać wersje i śledzić ewolucję przepisów w czasie.
            </p>
          </div>

          <div className="border-l-4 border-[#3b82f6] pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🚂 Legislative Train</h3>
            <p className="text-gray-700">
              Interaktywna oś legislacyjna pokazuje etapy procesu (prekonsultacje → rząd → Sejm/Senat → prezydent)
              dla każdego aktu, z podglądem statusów i dat.
            </p>
          </div>

          <div className="border-l-4 border-[#3b82f6] pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Propozycje zmian</h3>
            <p className="text-gray-700">
              Eksperci mogą tworzyć propozycje zmian, dyskutować nad nimi, 
              dodawać komentarze i śledzić status akceptacji.
            </p>
          </div>

          <div className="border-l-4 border-[#3b82f6] pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💬 Komentarze i głosowanie</h3>
            <p className="text-gray-700">
              Komentowanie propozycji jest już dostępne, a użytkownicy mogą głosować w prosty sposób (👍 / 👎),
              co ułatwia szybki feedback społeczności.
            </p>
          </div>

          <div className="border-l-4 border-[#3b82f6] pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🤖 Ocena jakości propozycji (AI)</h3>
            <p className="text-gray-700">
              Automatyczna ocena tekstów prawnych pod kątem prostoty języka (poziom B2), 
              spójności, błędów ortograficznych i klarowności – jak code review, ale dla prawa.
            </p>
          </div>

          <div className="border-l-4 border-[#3b82f6] pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Podsumowania zmian (AI)</h3>
            <p className="text-gray-700">
              Generujemy krótkie podsumowania różnic między wersjami, aby łatwiej zrozumieć
              wpływ zmian prostym językiem.
            </p>
          </div>

          <div className="border-l-4 border-[#3b82f6] pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 System uprawnień</h3>
            <p className="text-gray-700">
              Trzy role: Administrator, Ekspert, Użytkownik. Każdy może przeglądać i komentować. 
              Eksperci tworzą propozycje zmian. Administratorzy zarządzają systemem.
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
          <li>Tłumacz AI: przekład urzędniczego języka na prosty język obywatelski</li>
          <li>Newsletter z miesięcznymi zmianami w prawie</li>
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
