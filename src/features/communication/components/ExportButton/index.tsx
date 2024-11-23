import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { WorkReport } from '../../types';
import { exportToPDF, exportToCSV } from '../../utils/export';

interface Props {
  report: WorkReport;
  type: 'pdf' | 'csv';
}

const ExportButton: React.FC<Props> = ({ report, type }) => {
  const { t } = useTranslation();

  const handleExport = async () => {
    try {
      if (type === 'pdf') {
        await exportToPDF(report);
      } else {
        await exportToCSV(report);
      }
    } catch (error) {
      console.error(`Error exporting to ${type.toUpperCase()}:`, error);
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      <Download size={20} className="mr-2" />
      {t(`Export as ${type.toUpperCase()}`)}
    </button>
  );
};

export default ExportButton;