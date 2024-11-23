import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Save, Edit } from 'lucide-react';
import { useUnitPlumbingData } from '../../hooks/useUnitPlumbingData';
import DetectionTab from './DetectionTab';
import FixingTab from './FixingTab';
import RemarkModal from '../common/RemarkModal';

const UnitPlumbingInspectionPage: React.FC = () => {
  const { projectId, buildingNumber, apartmentNumber } = useParams<{
    projectId: string;
    buildingNumber: string;
    apartmentNumber: string;
  }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Detection' | 'Fixing'>('Detection');
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [currentRemark, setCurrentRemark] = useState('');

  const {
    data,
    loading,
    error,
    updateData,
    isEditing,
    setIsEditing
  } = useUnitPlumbingData(projectId, buildingNumber, apartmentNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">{t('error')}: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    await updateData(data);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-500 hover:text-blue-600 mb-4"
      >
        <ChevronLeft size={20} />
        <span>{t('back')}</span>
      </button>

      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {t('apartment')} {apartmentNumber} - {t('building')} {buildingNumber}
      </h1>

      <div className="flex mb-6">
        <button
          onClick={() => setActiveTab('Detection')}
          className={`flex-1 py-2 px-4 ${
            activeTab === 'Detection'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } rounded-l transition-colors`}
        >
          {t('detection')}
        </button>
        <button
          onClick={() => setActiveTab('Fixing')}
          className={`flex-1 py-2 px-4 ${
            activeTab === 'Fixing'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } rounded-r transition-colors`}
        >
          {t('fixing')}
        </button>
      </div>

      {activeTab === 'Detection' && (
        <DetectionTab
          data={data}
          isEditing={isEditing}
          onUpdate={updateData}
        />
      )}

      {activeTab === 'Fixing' && (
        <FixingTab
          data={data}
          isEditing={isEditing}
          onUpdate={updateData}
        />
      )}

      <div className="mt-6">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Save className="inline-block mr-2" size={20} />
            {t('save')}
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <Edit className="inline-block mr-2" size={20} />
            {t('edit')}
          </button>
        )}
      </div>

      {showRemarkModal && (
        <RemarkModal
          isOpen={showRemarkModal}
          remark={currentRemark}
          onClose={() => setShowRemarkModal(false)}
          onChange={setCurrentRemark}
          onSave={() => {
            // Handle saving remark
            setShowRemarkModal(false);
            setCurrentRemark('');
          }}
        />
      )}
    </div>
  );
};

export default UnitPlumbingInspectionPage;