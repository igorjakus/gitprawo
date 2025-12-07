import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyToken, isAdmin } from '@/lib/auth';
import { db } from '@/lib/database';
import ActEditForm from '@/components/ActEditForm';

export default async function EditActPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || !isAdmin(user)) {
    redirect('/login');
  }

  const { id } = await params;
  const actId = parseInt(id);

  // Fetch act details
  const actResult = await db.query(
    'SELECT * FROM acts WHERE id = $1',
    [actId]
  );

  if (actResult.rows.length === 0) {
    redirect('/admin/acts');
  }

  const act = actResult.rows[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edycja aktu prawnego</h1>
        <p className="text-gray-600">ID: {actId} • {act.short_title}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ActEditForm
          act={{
            id: act.id,
            title: act.title,
            shortTitle: act.short_title,
            type: act.type,
            publishDate: act.publish_date,
            journalNumber: act.journal_number,
            status: act.status,
            legislativeStages: act.legislative_stages || [],
          }}
        />
      </div>

      <div className="mt-6">
        <Link
          href="/admin/acts"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Powrót do listy aktów
        </Link>
      </div>
    </div>
  );
}
