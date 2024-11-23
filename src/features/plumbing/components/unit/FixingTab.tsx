import React from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, MessageSquare } from 'lucide-react';
import { ApartmentData } from '../../types';

interface Props {
  data: ApartmentData;
  setData: (data: ApartmentData) => void;
  isEditing: boolean;
  onAddRemark: (areaName: string) => void;
}

const FixingTab: React.FC<Props> = ({ data, setData, isEditing, onAddRemark }) => {
  const { t } = useTranslation();

  const handleStatusChange = (issueId: string, status: 'Fixed' | 'Requires local Plumber' | 'Problem in Common Plumbing' | 'Custom') => {
    const newIssues = data.issues.map(issue =>
      issue.id === issueId ? { ...issue, status } : issue
    );
    setData({ ...data, issues: newIssues });
  };

  return (
    <div className="space-y-4">
      {data.issues.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          {t('noIssuesFound')}
        </p>
      ) : (
        data.issues.map((issue) => (
          <div key={issue.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
              {issue.area} - {issue.description}
            </h3>
            <div className="flex items-center space-x-2">
              <select
                value={issue.status}
                onChange={(e) => handleStatusChange(
                  issue.id,
                  e.target.value as 'Fixed' | 'Requires local Plumber' | 'Problem in Common Plumbing' | 'Custom'
                )}
                disabled={!isEditing}
                className="p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
              >
                <option value="Fixed">{t('fixed')}</option>
                <option value="Requires local Plumber">{t('requiresLocalPlumber')}</option>
                <option value="Problem in Common Plumbing">{t('problemInCommonPlumbing')}</option>
                <option value="Custom">{t('custom')}</option>
              </select>
              <button
                onClick={() => onAddRemark(issue.area)}
                disabled={!isEditing}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <MessageSquare className="text-gray-600 dark:text-gray-300" size={20} />
              </button>
              <label className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
                <Camera className="text-gray-600 dark:text-gray-300" size={20} />
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>

            {issue.remarks.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('remarks')}</h4>
                <ul className="space-y-1">
                  {issue.remarks.map((remark, idx) => (
                    <li key={idx} className="text-gray-600 dark:text-gray-400">• {remark}</li>
                  ))}
                </ul>
              </div>
            )}

            {issue.media.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('media')}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {issue.media.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`${issue.area} ${idx + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default FixingTab;