import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyToken, isAdmin } from '@/lib/auth';
import { db } from '@/lib/database';

export default async function AdminPullRequestsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || !isAdmin(user)) {
    redirect('/login');
  }

  const prsResult = await db.query(`
    SELECT 
      pr.id, pr.title, pr.status, pr.is_public, pr.created_at,
      u.first_name || ' ' || u.last_name as author_name,
      a.short_title as act_title
    FROM pull_requests pr
    JOIN users u ON pr.author_id = u.id
    JOIN acts a ON pr.act_id = a.id
    ORDER BY pr.created_at DESC
  `);

  const prs = prsResult.rows;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Zarządzanie propozycjami zmian</h1>
        <p className="text-gray-600">Lista wszystkich propozycji (w tym prywatnych)</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tytuł
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akt prawny
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Widoczność
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data utworzenia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prs.map((pr) => (
              <tr key={pr.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pr.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {pr.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {pr.act_title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {pr.author_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    pr.status === 'open' 
                      ? 'bg-green-100 text-green-800'
                      : pr.status === 'merged'
                      ? 'bg-blue-100 text-blue-800'
                      : pr.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {pr.status === 'open' ? 'Otwarta' : 
                     pr.status === 'merged' ? 'Złączona' :
                     pr.status === 'draft' ? 'Szkic' : 'Zamknięta'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {pr.is_public ? (
                    <span className="text-green-600">Publiczna</span>
                  ) : (
                    <span className="text-orange-600">Prywatna</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(pr.created_at).toLocaleDateString('pl-PL')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    href={`/propozycje-zmian/${pr.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Szczegóły
                  </Link>
                  <Link
                    href={`/admin/pull-requests/${pr.id}/manage`}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    Zarządzaj
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link
          href="/admin"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Powrót do panelu
        </Link>
      </div>
    </div>
  );
}
