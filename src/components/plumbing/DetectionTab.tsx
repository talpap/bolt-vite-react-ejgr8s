import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, MessageSquare } from 'lucide-react';
import { Area, ApartmentData } from '../../types/plumbing';
import RemarkModal from '../common/RemarkModal';
import MediaUpload from '../common/MediaUpload';

interface Props {
  data: ApartmentData;
  isEditing: boolean;
  onUpdate: (data: ApartmentData) => void;
}

const DetectionTab: React.FC<Props> = ({ data, isEditing, onUpdate }) => {
  const { t } = useTranslation();
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [currentArea, setCurrentArea] = useState<string | null>(null);

  const handleStatusChange = (index: number, status: 'Passed' | 'Not Passed') => {
    const newAreas = [...data.areas];
    newAreas[index].status = status;

    if (status === 'Not Passed') {
      const newIssue = {
        id: Date.now().toString(),
        area: newAreas[index].name,
        description: `Issue in ${newAreas[index].name}`,
        status: 'Custom' as const,
        dateAdded: new Date(),
        remarks: [],
        media: [],
      };
      onUpdate({
        ...data,
        areas: newAreas,
        issues: [...data.issues, newIssue],
      });
    } else {
      onUpdate({
        ...data,
        areas: newAreas,
      });
    }
  };

  const handleAddRemark = (area: Area) => {
    setCurrentArea(area.name);
    setShowRemarkModal(true);
  };

  return (
    <div>
      {data.areas.map((area, index) => (
        <div key={area.name} className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
          <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">{area.name}</h3>
          <div className="flex items-center space-x-2">
            <select
              value={area.status || ''}
              onChange={(e) => handleStatusChange(index, e.target.value as 'Passed' | 'Not Passed')}
              disabled={!isEditing}
              className="border rounded p-2 bg-white dark:bg-gray-600 text-gray-800 dark:text-white"
            >
              <option value="">{t('selectStatus')}</option>
              <option value="Passed">{t('passed')}</option>
              <option value="Not Passed">{t('notPassed')}</option>
            </select>
            <button
              onClick={() => handleAddRemark(area)}
              disabled={!isEditing}
              className="p-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              <MessageSquare size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <MediaUpload
              area={area}
              isEditing={isEditing}
              onUpdate={(updatedArea) => {
                const newAreas = [...data.areas];
                newAreas[index] = updatedArea;
                onUpdate({ ...data, areas: newAreas });
              }}
            />
          </div>

          {area.remarks.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold text-gray-800 dark:text-white">{t('remarks')}:</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                {area.remarks.map((remark, idx) => (
                  <li key={idx}>{remark}</li>
                ))}
              </ul>
            </div>
          )}

          {area.media.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold text-gray-800 dark:text-white">{t('media')}:</h4>
              <div className="flex flex-wrap gap-2">
                {area.media.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-20 h-20"
                  >
                    <img
                      src={url}
                      alt={`${area.name} ${idx + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {showRemarkModal && currentArea && (
        <RemarkModal
          onClose={() => setShowRemarkModal(false)}
          onSave={(remark) => {
            const newAreas = [...data.areas];
            const areaIndex = newAreas.findIndex(a => a.name === currentArea);
            if (areaIndex !== -1) {
              newAreas[areaIndex].remarks.push(remark);
              onUpdate({ ...data, areas: newAreas });
            }
            setShowRemarkModal(false);
            setCurrentArea(null);
          }}
        />
      )}
    </div>
  );
};

export default DetectionTab;