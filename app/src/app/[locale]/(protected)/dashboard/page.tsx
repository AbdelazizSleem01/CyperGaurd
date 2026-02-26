import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { DashboardClient } from '../../../../components/dashboard/DashboardClient';
import { CardSkeleton } from '../../../../components/ui/ThemeToggle';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });
  return {
    title: t('title'),
    description: t('subtitle'),
  } satisfies Metadata;
}

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} rows={2} />
            ))}
          </div>
        }
      >
        <DashboardClient />
      </Suspense>
    </div>
  );
}
