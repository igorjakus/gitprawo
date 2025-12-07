import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyToken, isAdmin } from '@/lib/auth';
import { db } from '@/lib/database';
import PRManageForm from '@/components/PRManageForm';

export default async function ManagePRPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || !isAdmin(user)) {
    redirect('/login');
  }

  const { id } = await params;
  const prId = parseInt(id);

  // Fetch PR details
  const prResult = await db.query(`
    SELECT 
      pr.id, pr.title, pr.status, pr.is_public,
      u.first_name || ' ' || u.last_name as author_name,
      a.short_title as act_title
    FROM pull_requests pr
    JOIN users u ON pr.author_id = u.id
    JOIN acts a ON pr.act_id = a.id
    WHERE pr.id = $1
  `, [prId]);

  if (prResult.rows.length === 0) {
    redirect('/admin/pull-requests');
  }

  const pr = prResult.rows[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Zarządzanie propozycją</h1>
        <p className="text-gray-600">ID: {prId} • {pr.title}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <PRManageForm
          pr={{
            id: pr.id,
            title: pr.title,
            status: pr.status,
            isPublic: pr.is_public,
            actTitle: pr.act_title,
            authorName: pr.author_name,
          }}
        />
      </div>

      <div className="mt-6">
        <Link
          href="/admin/pull-requests"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Powrót do listy propozycji
        </Link>
      </div>
    </div>
  );
}
