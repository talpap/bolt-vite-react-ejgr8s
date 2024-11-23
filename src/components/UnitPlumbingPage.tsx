import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectList from './ProjectList';

const UnitPlumbingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        {t('unitPlumbing')}
      </h1>
      <ProjectList projectType="Unit Plumbing" />
    </div>
  );
};

export default UnitPlumbingPage;