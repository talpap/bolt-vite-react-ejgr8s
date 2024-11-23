import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectList from '../../common/components/ProjectList';

const CommunicationPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        {t('communication')}
      </h1>
      <ProjectList projectType="Communication" />
    </div>
  );
};

export default CommunicationPage;