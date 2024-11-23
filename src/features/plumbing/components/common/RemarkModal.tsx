import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  remark: string;
  onClose: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
}

const RemarkModal: React.FC<Props> = ({
  isOpen,
  remark,
  onClose,
  onChange,
  onSave,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          {t('addRemark')}
        </h2>
        <textarea
          value={remark}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-32 p-2 border rounded mb-4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
          placeholder={t('enterRemarkHere')}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemarkModal;