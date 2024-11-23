import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';

const CommunicationWorksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/communication" className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ChevronLeft size={20} />
        <span>{t('backToProjects')}</span>
      </Link>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        {t('communicationWorks')} - {t('project')} {projectId}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        {t('communicationWorksDescription')}
      </p>
      {/* Add more content and functionality here */}
    </div>
  );
};

export default CommunicationWorksPage;