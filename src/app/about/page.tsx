export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1e3a8a] mb-4">O projekcie GitPrawo</h1>
        <p className="text-lg text-gray-700 mb-6">
          GitPrawo to otwarta platforma do monitorowania zmian w polskim prawie. Pozwala śledzić historię wersji aktów prawnych, porównywać zmiany oraz wizualizować proces legislacyjny w stylu znanym z systemów kontroli wersji.
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-6">
          <li>Wersjonowanie aktów prawnych</li>
          <li>Porównywanie zmian (diff)</li>
          <li>Wizualizacja procesu legislacyjnego</li>
          <li>Otwarte API (wkrótce)</li>
        </ul>
        <p className="text-gray-600 mb-2">
          Projekt jest rozwijany w duchu open source. Zapraszamy do współpracy!
        </p>
        <p className="text-gray-600">
          Kontakt: <a href="mailto:kontakt@gitprawo.pl" className="text-[#1e3a8a] underline">kontakt@gitprawo.pl</a>
        </p>
      </div>
    </div>
  );
}
