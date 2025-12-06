import PRDetail from '@/components/PRDetail';
import { cookies } from 'next/headers';
import Link from 'next/link';

interface PRPageProps {
  params: Promise<{ id: string }>;
}

export default async function PRPage({ params }: PRPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const userStr = cookieStore.get('user')?.value;
  const currentUserId = userStr ? JSON.parse(userStr).id : undefined;
  
  const { id } = await params;
  const prId = parseInt(id);

  if (isNaN(prId)) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600">
            Nieprawidłowy ID pull requesta
          </h1>
          <Link href="/pull-requests" className="text-blue-600 hover:underline">
            Wróć do listy PR-ów
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/pull-requests"
          className="text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Wróć do listy PR-ów
        </Link>

        <PRDetail prId={prId} token={token} currentUserId={currentUserId} />
      </div>
    </main>
  );
}
