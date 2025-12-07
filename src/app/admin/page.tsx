import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyToken, isAdmin } from '@/lib/auth';
import { db } from '@/lib/database';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || !isAdmin(user)) {
    redirect('/login');
  }

  // Fetch statistics
  const actsResult = await db.query('SELECT COUNT(*) as count FROM acts');
  const usersResult = await db.query('SELECT COUNT(*) as count FROM users');
  const prsResult = await db.query('SELECT COUNT(*) as count FROM pull_requests');
  const openPrsResult = await db.query("SELECT COUNT(*) as count FROM pull_requests WHERE status = 'open'");

  const stats = {
    totalActs: parseInt(actsResult.rows[0].count),
    totalUsers: parseInt(usersResult.rows[0].count),
    totalPRs: parseInt(prsResult.rows[0].count),
    openPRs: parseInt(openPrsResult.rows[0].count),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel Administratora</h1>
        <p className="text-gray-600">Zarządzanie systemem GitPrawo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-blue-600">{stats.totalActs}</div>
          <div className="text-sm text-gray-600 mt-1">Aktów prawnych</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-green-600">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600 mt-1">Użytkowników</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-purple-600">{stats.totalPRs}</div>
          <div className="text-sm text-gray-600 mt-1">Propozycji zmian</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-orange-600">{stats.openPRs}</div>
          <div className="text-sm text-gray-600 mt-1">Otwartych propozycji</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/acts"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Akty prawne</h3>
              <p className="text-sm text-gray-600">Zarządzaj aktami prawnymi</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-green-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Użytkownicy</h3>
              <p className="text-sm text-gray-600">Zarządzaj użytkownikami i rolami</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/pull-requests"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-purple-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Propozycje zmian</h3>
              <p className="text-sm text-gray-600">Przegląd i moderacja</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Powrót do strony głównej
        </Link>
      </div>
    </div>
  );
}
