import React from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, MessageSquare, X, Trash2 } from 'lucide-react';
import { Area, ApartmentData } from '../../types';

interface DetectionTabProps {
  data: ApartmentData;
  isEditing: boolean;
  onUpdate: (data: ApartmentData) => void;
}

const DetectionTab: React.FC<DetectionTabProps> = ({ data, isEditing, onUpdate }) => {
  const { t } = useTranslation();

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
        issues: data.issues.filter(issue => issue.area !== newAreas[index].name),
      });
    }
  };

  const handleAddRemark = (areaName: string, remark: string) => {
    const newAreas = [...data.areas];
    const areaIndex = newAreas.findIndex(area => area.name === areaName);
    
    if (areaIndex !== -1) {
      newAreas[areaIndex].remarks.push(remark);
      onUpdate({ ...data, areas: newAreas });
    }
  };

  const handleDeleteRemark = (areaName: string, remarkIndex: number) => {
    const newAreas = [...data.areas];
    const areaIndex = newAreas.findIndex(area => area.name === areaName);
    
    if (areaIndex !== -1) {
      newAreas[areaIndex].remarks = newAreas[areaIndex].remarks.filter((_, idx) => idx !== remarkIndex);
      onUpdate({ ...data, areas: newAreas });
    }
  };

  const handleMediaUpload = (areaName: string, file: File) => {
    // Implement media upload logic here
    console.log('Media upload for', areaName, file);
  };

  return (
    <div className="space-y-4">
      {data.areas.map((area, index) => (
        <div key={area.name} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">{area.name}</h3>
          
          <div className="flex items-center space-x-2">
            <select
              value={area.status || ''}
              onChange={(e) => handleStatusChange(index, e.target.value as 'Passed' | 'Not Passed')}
              disabled={!isEditing}
              className="p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="">{t('selectStatus')}</option>
              <option value="Passed">{t('passed')}</option>
              <option value="Not Passed">{t('notPassed')}</option>
            </select>

            <button
              onClick={() => handleAddRemark(area.name, '')}
              disabled={!isEditing}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <MessageSquare className="text-gray-600 dark:text-gray-300" size={20} />
            </button>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleMediaUpload(area.name, e.target.files[0])}
              disabled={!isEditing}
              className="hidden"
              id={`media-${index}`}
            />
            <label
              htmlFor={`media-${index}`}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
            >
              <Camera className="text-gray-600 dark:text-gray-300" size={20} />
            </label>
          </div>

          {area.remarks.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('remarks')}</h4>
              <ul className="space-y-2">
                {area.remarks.map((remark, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-gray-800 dark:text-gray-200">{remark}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteRemark(area.name, idx)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {area.media.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('media')}</h4>
              <div className="grid grid-cols-4 gap-2">
                {area.media.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt="" className="w-full h-24 object-cover rounded" />
                    {isEditing && (
                      <button
                        onClick={() => {/* Implement media delete */}}
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
      ))}
    </div>
  );
};

export default DetectionTab;