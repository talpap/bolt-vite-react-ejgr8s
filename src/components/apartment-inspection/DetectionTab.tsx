import React from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, MessageSquare, X, Trash2 } from 'lucide-react';
import { Area } from './types';

interface DetectionTabProps {
  areas: Area[];
  isEditing: boolean;
  onStatusChange: (index: number, status: 'Passed' | 'Not Passed') => void;
  onAddRemark: (areaName: string) => void;
  onDeleteRemark: (areaName: string, remark: string) => void;
  onMediaUpload: (file: File, areaName: string) => void;
  onDeleteMedia: (areaName: string, mediaUrl: string) => void;
}

const DetectionTab: React.FC<DetectionTabProps> = ({
  areas,
  isEditing,
  onStatusChange,
  onAddRemark,
  onDeleteRemark,
  onMediaUpload,
  onDeleteMedia,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      {areas.map((area, index) => (
        <div key={area.name} className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
          <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">{area.name}</h3>
          <div className="flex items-center mb-2">
            <select
              value={area.status || ''}
              onChange={(e) => onStatusChange(index, e.target.value as 'Passed' | 'Not Passed')}
              disabled={!isEditing}
              className="mr-2 p-2 border rounded text-gray-800 bg-white dark:bg-gray-600 dark:text-white"
            >
              <option value="">{t('selectStatus')}</option>
              <option value="Passed">{t('passed')}</option>
              <option value="Not Passed">{t('notPassed')}</option>
            </select>
            <button
              onClick={() => onAddRemark(area.name)}
              disabled={!isEditing}
              className="mr-2 p-2 bg-gray-200 dark:bg-gray-600 rounded"
            >
              <MessageSquare size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => e.target.files && onMediaUpload(e.target.files[0], area.name)}
              disabled={!isEditing}
              className="hidden"
              id={`media-upload-${index}`}
            />
            <label htmlFor={`media-upload-${index}`} className="p-2 bg-gray-200 dark:bg-gray-600 rounded cursor-pointer">
              <Camera size={20} className="text-gray-600 dark:text-gray-300" />
            </label>
          </div>

          {area.remarks.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold text-gray-800 dark:text-white">{t('remarks')}:</h4>
              <ul className="space-y-2">
                {area.remarks.map((remark, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-600 p-2 rounded">
                    <span className="text-gray-700 dark:text-gray-200">{remark}</span>
                    {isEditing && (
                      <button
                        onClick={() => onDeleteRemark(area.name, remark)}
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

          {area.media.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold text-gray-800 dark:text-white">{t('media')}:</h4>
              <div className="flex flex-wrap gap-2">
                {area.media.map((mediaUrl, idx) => (
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
                        onClick={() => onDeleteMedia(area.name, mediaUrl)}
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