import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import WorkReport from './WorkReport';
import RecentReports from './RecentReports';

const CommunicationWorksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/communication" className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ChevronLeft size={20} />
        <span>{t('Back to Projects')}</span>
      </Link>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        {t('Communication Works')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WorkReport projectId={projectId} />
        </div>
        <div>
          <RecentReports />
        </div>
      </div>
    </div>
  );
};

export default CommunicationWorksPage;