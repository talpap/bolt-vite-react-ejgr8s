import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectList from '../../common/components/ProjectList';

const ElectricalWorksPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('electricalWorks')}</h1>
      <ProjectList projectType="Electrical Works" />
    </div>
  );
};

export default ElectricalWorksPage;