import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { Issue } from '../../types/plumbing';
import RemarkModal from '../common/RemarkModal';
import MediaUpload from '../common/MediaUpload';

interface Props {
  issue: Issue;
  isEditing: boolean;
  onUpdate: (issue: Issue) => void;
}

const IssueCard: React.FC<Props> = ({ issue, isEditing, onUpdate }) => {
  const { t } = useTranslation();
  const [showRemarkModal, setShowRemarkModal] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
        {issue.area} - {issue.description}
      </h3>
      <div className="flex items-center space-x-2">
        <select
          value={issue.status}
          onChange={(e) => onUpdate({ ...issue, status: e.target.value as Issue['status'] })}
          disabled={!isEditing}
          className="border rounded p-2 bg-white dark:bg-gray-600 text-gray-800 dark:text-white"
        >
          <option value="Fixed">{t('fixed')}</option>
          <option value="Requires local Plumber">{t('requiresPlumber')}</option>
          <option value="Problem in Common Plumbing">{t('commonPlumbingIssue')}</option>
          <option value="Custom">{t('custom')}</option>
        </select>
        <button
          onClick={() => setShowRemarkModal(true)}
          disabled={!isEditing}
          className="p-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          <MessageSquare size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <MediaUpload
          area={issue}
          isEditing={isEditing}
          onUpdate={(updatedArea) => onUpdate({ ...issue, media: updatedArea.media })}
        />
      </div>

      {issue.remarks.length > 0 && (
        <div className="mt-2">
          <h4 className="font-semibold text-gray-800 dark:text-white">{t('remarks')}:</h4>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
            {issue.remarks.map((remark, idx) => (
              <li key={idx}>{remark}</li>
            ))}
          </ul>
        </div>
      )}

      {issue.media.length > 0 && (
        <div className="mt-2">
          <h4 className="font-semibold text-gray-800 dark:text-white">{t('media')}:</h4>
          <div className="flex flex-wrap gap-2">
            {issue.media.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-20 h-20"
              >
                <img
                  src={url}
                  alt={`${issue.area} ${idx + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {showRemarkModal && (
        <RemarkModal
          onClose={() => setShowRemarkModal(false)}
          onSave={(remark) => {
            onUpdate({
              ...issue,
              remarks: [...issue.remarks, remark],
            });
            setShowRemarkModal(false);
          }}
        />
      )}
    </div>
  );
};

export default IssueCard;