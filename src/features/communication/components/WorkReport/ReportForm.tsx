import React from 'react';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import { WorkReport } from '../../types';

interface Props {
  report: WorkReport | null;
  onChange: (description: string) => void;
  onSave: (status: 'draft' | 'submitted') => void;
}

const ReportForm: React.FC<Props> = ({ report, onChange, onSave }) => {
  const { t } = useTranslation();

  if (!report) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {t('Work Description')}
      </h3>
      
      <textarea
        value={report.description}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-32 p-2 border rounded mb-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={t('Describe the work performed...')}
      />

      <div className="flex justify-end">
        <button
          onClick={() => onSave('draft')}
          className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          <Save size={20} className="mr-2" />
          {t('Save Draft')}
        </button>
      </div>
    </div>
  );
};

export default ReportForm;