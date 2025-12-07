import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyToken, isAdmin } from '@/lib/auth';
import { db } from '@/lib/database';
import UserEditForm from '@/components/UserEditForm';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || !isAdmin(user)) {
    redirect('/login');
  }

  const { id } = await params;
  const userId = parseInt(id);

  // Fetch user details
  const userResult = await db.query(
    'SELECT id, login, first_name, last_name, role FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    redirect('/admin/users');
  }

  const targetUser = userResult.rows[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edycja użytkownika</h1>
        <p className="text-gray-600">ID: {userId} • {targetUser.first_name} {targetUser.last_name}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <UserEditForm
          user={{
            id: targetUser.id,
            login: targetUser.login,
            firstName: targetUser.first_name,
            lastName: targetUser.last_name,
            role: targetUser.role,
          }}
        />
      </div>

      <div className="mt-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Powrót do listy użytkowników
        </Link>
      </div>
    </div>
  );
}
