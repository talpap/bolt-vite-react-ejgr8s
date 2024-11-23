import React from 'react';
import { useTranslation } from 'react-i18next';

const WorkLogsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('workLogs')}</h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('pageContent', { page: t('workLogs') })}
        </p>
      </main>
    </div>
  );
};

export default WorkLogsPage;