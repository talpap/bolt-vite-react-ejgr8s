import React from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, X } from 'lucide-react';
import { uploadPhoto } from '../../utils';

interface Props {
  projectId: string | undefined;
  photos: string[];
  onChange: (photos: string[]) => void;
}

const PhotoUpload: React.FC<Props> = ({ projectId, photos, onChange }) => {
  const { t } = useTranslation();

  const handleUpload = async (file: File) => {
    if (!projectId) return;

    try {
      const url = await uploadPhoto(projectId, file);
      onChange([...photos, url]);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  const handleRemove = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {t('Photos')}
      </h3>
      
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          className="hidden"
          id="photo-upload"
          multiple
        />
        <label
          htmlFor="photo-upload"
          className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-gray-300 dark:border-gray-600"
        >
          <Camera className="mr-2 text-gray-600 dark:text-gray-300" size={20} />
          <span className="text-gray-600 dark:text-gray-300">{t('Upload Photos')}</span>
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title={t('Remove Photo')}
            >
              <X size={16} />
            </button>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg" />
          </div>
        ))}
      </div>

      {photos.length > 0 && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {t('Click on a photo to view full size')}
        </p>
      )}
    </div>
  );
};

export default PhotoUpload;