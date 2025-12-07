'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateActFormProps {
  token: string;
  userId: number;
}

export default function CreateActForm({ token }: CreateActFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  const defaultStages = [
    { name: 'Prekonsultacje', status: 'pending' as 'pending' | 'completed' },
    { name: 'Projekt rządowy', status: 'pending' as 'pending' | 'completed' },
    { name: 'Sejm', status: 'pending' as 'pending' | 'completed' },
    { name: 'Senat', status: 'pending' as 'pending' | 'completed' },
    { name: 'Prezydent', status: 'pending' as 'pending' | 'completed' },
    { name: 'Publikacja', status: 'pending' as 'pending' | 'completed' },
  ];

  const [stages, setStages] = useState(defaultStages);
  const [formData, setFormData] = useState({
    title: '',
    shortTitle: '',
    type: 'ustawa' as 'ustawa' | 'rozporządzenie' | 'konstytucja',
    publishDate: '',
    journalNumber: '',
    contentMd: '',
    commitMessage: '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      setError('Proszę wybrać plik Markdown (.md lub .markdown)');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFormData({ ...formData, contentMd: content });
      setError(null);
    };
    reader.onerror = () => {
      setError('Błąd podczas wczytywania pliku');
    };
    reader.readAsText(file);
  };

  const toggleStage = (index: number) => {
    const newStages = [...stages];
    const isCompleting = newStages[index].status === 'pending';

    if (isCompleting) {
      // Mark this and all previous stages as completed
      for (let i = 0; i <= index; i++) {
        newStages[i].status = 'completed';
      }
    } else {
      // Mark this and all following stages as pending
      for (let i = index; i < newStages.length; i++) {
        newStages[i].status = 'pending';
      }
    }

    setStages(newStages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.title || !formData.shortTitle || !formData.publishDate || !formData.contentMd) {
        throw new Error('Wypełnij wszystkie wymagane pola');
      }

      const response = await fetch('/api/acts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          legislativeStages: stages,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Nie udało się utworzyć aktu prawnego');
      }

      const result = await response.json();
      router.push(`/acts/${result.actId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Podstawowe informacje</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pełny tytuł aktu *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="np. Ustawa z dnia 6 czerwca 1997 r. - Kodeks karny"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Krótki tytuł *
          </label>
          <input
            type="text"
            value={formData.shortTitle}
            onChange={(e) => setFormData({ ...formData, shortTitle: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="np. Kodeks karny"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ aktu *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'ustawa' | 'rozporządzenie' | 'konstytucja' })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ustawa">Ustawa</option>
              <option value="rozporządzenie">Rozporządzenie</option>
              <option value="konstytucja">Konstytucja</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data publikacji *
            </label>
            <input
              type="date"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numer Dziennika Ustaw
          </label>
          <input
            type="text"
            value={formData.journalNumber}
            onChange={(e) => setFormData({ ...formData, journalNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="np. Dz.U. 1997 nr 88 poz. 553"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Etapy legislacyjne</h2>
        <p className="text-sm text-gray-600 mb-4">
          Kliknij na etap, aby zaznaczyć go jako ukończony. Zaznaczenie etapu automatycznie zaznaczy wszystkie wcześniejsze etapy.
        </p>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={() => toggleStage(index)}
                className={`
                  px-6 py-3 rounded-md font-medium text-sm min-w-[140px] transition-all
                  ${stage.status === 'completed' 
                    ? 'bg-green-100 text-green-800 border-2 border-green-600' 
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
                  }
                `}
              >
                <div className="flex items-center justify-center space-x-2">
                  {stage.status === 'completed' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-semibold">{stage.name}</span>
                </div>
              </button>

              {index < stages.length - 1 && (
                <svg
                  className="w-6 h-6 text-gray-400 mx-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Treść aktu</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Załącz plik Markdown *
          </label>
          <div className="mt-1">
            <input
              type="file"
              accept=".md,.markdown"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                file:cursor-pointer cursor-pointer"
            />
          </div>
          {fileName && (
            <p className="mt-2 text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Wczytano: {fileName}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Plik powinien zawierać treść aktu prawnego w formacie Markdown (.md lub .markdown)
          </p>
        </div>

        {formData.contentMd && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Podgląd treści
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-xs overflow-auto max-h-60">
              {formData.contentMd.substring(0, 1000)}
              {formData.contentMd.length > 1000 && '...'}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Wczytano {formData.contentMd.length} znaków
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opis wersji początkowej
          </label>
          <input
            type="text"
            value={formData.commitMessage}
            onChange={(e) => setFormData({ ...formData, commitMessage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="np. Wersja pierwotna z publikacji w Dzienniku Ustaw"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Tworzenie...' : 'Utwórz akt prawny'}
        </button>
      </div>
    </form>
  );
}
