import React from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, MessageSquare, X, Trash2, ArrowUpDown } from 'lucide-react';
import { Issue } from './types';

interface FixingTabProps {
  issues: Issue[];
  isEditing: boolean;
  filterStatus: string | null;
  sortBy: 'area' | 'date';
  onFilterChange: (status: string | null) => void;
  onSortChange: (sort: 'area' | 'date') => void;
  onStatusChange: (issueId: string, status: Issue['status']) => void;
  onAddRemark: (areaName: string) => void;
  onDeleteRemark: (areaName: string, remark: string) => void;
  onMediaUpload: (file: File, areaName: string) => void;
  onDeleteMedia: (areaName: string, mediaUrl: string) => void;
}

const FixingTab: React.FC<FixingTabProps> = ({
  issues,
  isEditing,
  filterStatus,
  sortBy,
  onFilterChange,
  onSortChange,
  onStatusChange,
  onAddRemark,
  onDeleteRemark,
  onMediaUpload,
  onDeleteMedia,
}) => {
  const { t } = useTranslation();

  const filteredAndSortedIssues = issues
    .filter(issue => !filterStatus || issue.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'area') {
        return a.area.localeCompare(b.area);
      } else {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <label htmlFor="filterStatus" className="mr-2 text-gray-800 dark:text-gray-200">
            {t('filterByStatus')}:
          </label>
          <select
            id="filterStatus"
            value={filterStatus || ''}
            onChange={(e) => onFilterChange(e.target.value || null)}
            className="p-2 border rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
          >
            <option value="">{t('all')}</option>
            <option value="Fixed">{t('fixed')}</option>
            <option value="Requires local Plumber">{t('requiresLocalPlumber')}</option>
            <option value="Problem in Common Plumbing">{t('problemInCommonPlumbing')}</option>
            <option value="Custom">{t('custom')}</option>
          </select>
        </div>
        <div className="flex items-center">
          <ArrowUpDown className="mr-2 text-gray-400" size={20} />
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'area' | 'date')}
            className="p-2 border rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
          >
            <option value="area">{t('area')}</option>
            <option value="date">{t('dateAdded')}</option>
          </select>
        </div>
      </div>

      {filteredAndSortedIssues.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">{t('noIssuesFound')}</p>
      ) : (
        filteredAndSortedIssues.map((issue) => (
          <div key={issue.id} className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
              {issue.area}: {issue.description}
            </h3>
            <div className="flex items-center mb-2">
              <select
                value={issue.status}
                onChange={(e) => onStatusChange(issue.id, e.target.value as Issue['status'])}
                disabled={!isEditing}
                className="mr-2 p-2 border rounded text-gray-800 bg-white dark:bg-gray-600 dark:text-white"
              >
                <option value="Fixed">{t('fixed')}</option>
                <option value="Requires local Plumber">{t('requiresLocalPlumber')}</option>
                <option value="Problem in Common Plumbing">{t('problemInCommonPlumbing')}</option>
                <option value="Custom">{t('custom')}</option>
              </select>
              <button
                onClick={() => onAddRemark(issue.area)}
                disabled={!isEditing}
                className="mr-2 p-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                <MessageSquare size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => e.target.files && onMediaUpload(e.target.files[0], issue.area)}
                disabled={!isEditing}
                className="hidden"
                id={`issue-media-upload-${issue.id}`}
              />
              <label
                htmlFor={`issue-media-upload-${issue.id}`}
                className="p-2 bg-gray-200 dark:bg-gray-600 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                <Camera size={20} className="text-gray-600 dark:text-gray-300" />
              </label>
            </div>

            {issue.remarks.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold text-gray-800 dark:text-white">{t('remarks')}:</h4>
                <ul className="space-y-2">
                  {issue.remarks.map((remark, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-600 p-2 rounded">
                      <span className="text-gray-700 dark:text-gray-200">{remark}</span>
                      {isEditing && (
                        <button
                          onClick={() => onDeleteRemark(issue.area, remark)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {issue.media.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold text-gray-800 dark:text-white">{t('media')}:</h4>
                <div className="flex flex-wrap gap-2">
                  {issue.media.map((mediaUrl, idx) => (
                    <div key={idx} className="relative group">
                      <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={mediaUrl}
                          alt={`Media ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      </a>
                      {isEditing && (
                        <button
                          onClick={() => onDeleteMedia(issue.area, mediaUrl)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
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