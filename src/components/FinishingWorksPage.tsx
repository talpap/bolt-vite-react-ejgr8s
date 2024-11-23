import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectList from './ProjectList';

const FinishingWorksPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('finishingWorks')}</h1>
        <ProjectList projectType="Finishing Works" />
      </main>
    </div>
  );
};

export default FinishingWorksPage;