import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ChevronLeft, Camera, MessageSquare, Save, Edit } from 'lucide-react';

interface Area {
  name: string;
  status: 'Passed' | 'Not Passed' | null;
  remarks: string[];
  media: string[];
}

interface Issue {
  id: string;
  area: string;
  description: string;
  status: 'Not Fixed' | 'Fixed' | 'Requires Attention';
  dateAdded: Date;
  remarks: string[];
  media: string[];
}

interface ApartmentData {
  areas: Area[];
  issues: Issue[];
}

const ApartmentFinishingWorks: React.FC = () => {
  const { projectId, buildingNumber, apartmentNumber } = useParams<{ projectId: string; buildingNumber: string; apartmentNumber: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Detection' | 'Fixing'>('Detection');
  const [apartmentData, setApartmentData] = useState<ApartmentData>({
    areas: [
      { name: 'Living Room', status: null, remarks: [], media: [] },
      { name: 'Kitchen', status: null, remarks: [], media: [] },
      { name: 'Master Bedroom', status: null, remarks: [], media: [] },
      { name: 'Bedroom 2', status: null, remarks: [], media: [] },
      { name: 'Bedroom 3', status: null, remarks: [], media: [] },
      { name: 'Main Bathroom', status: null, remarks: [], media: [] },
      { name: 'En-suite Bathroom', status: null, remarks: [], media: [] },
      { name: 'Balcony', status: null, remarks: [], media: [] },
      { name: 'Flooring', status: null, remarks: [], media: [] },
      { name: 'Walls and Ceiling', status: null, remarks: [], media: [] },
    ],
    issues: [],
  });
  const [isEditing, setIsEditing] = useState(true);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [currentRemarkArea, setCurrentRemarkArea] = useState<string | null>(null);
  const [currentRemark, setCurrentRemark] = useState('');

  useEffect(() => {
    const fetchApartmentData = async () => {
      if (!projectId || !buildingNumber || !apartmentNumber) return;

      try {
        const apartmentRef = doc(db, `projects/${projectId}/buildings/${buildingNumber}/apartments`, apartmentNumber);
        const apartmentDoc = await getDoc(apartmentRef);

        if (apartmentDoc.exists()) {
          setApartmentData(apartmentDoc.data() as ApartmentData);
        }
      } catch (error) {
        console.error('Error fetching apartment data:', error);
      }
    };

    fetchApartmentData();
  }, [projectId, buildingNumber, apartmentNumber]);

  const handleStatusChange = (index: number, status: 'Passed' | 'Not Passed') => {
    const newAreas = [...apartmentData.areas];
    newAreas[index].status = status;
    setApartmentData({ ...apartmentData, areas: newAreas });
  };

  const handleAddRemark = (areaName: string) => {
    setCurrentRemarkArea(areaName);
    setShowRemarkModal(true);
  };

  const handleSaveRemark = () => {
    if (currentRemarkArea && currentRemark) {
      const newAreas = [...apartmentData.areas];
      const areaIndex = newAreas.findIndex(area => area.name === currentRemarkArea);
      if (areaIndex !== -1) {
        newAreas[areaIndex].remarks.push(currentRemark);
        setApartmentData({ ...apartmentData, areas: newAreas });
      }
      setShowRemarkModal(false);
      setCurrentRemarkArea(null);
      setCurrentRemark('');
    }
  };

  const handleMediaUpload = async (file: File, areaIndex: number) => {
    if (!projectId || !buildingNumber || !apartmentNumber) return;

    try {
      const fileRef = ref(storage, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      const newAreas = [...apartmentData.areas];
      newAreas[areaIndex].media.push(downloadURL);
      setApartmentData({ ...apartmentData, areas: newAreas });

      console.log('Media uploaded successfully');
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };

  const handleSave = async () => {
    if (!projectId || !buildingNumber || !apartmentNumber) return;

    try {
      const apartmentRef = doc(db, `projects/${projectId}/buildings/${buildingNumber}/apartments`, apartmentNumber);
      await setDoc(apartmentRef, apartmentData, { merge: true });

      // Update apartment status in the project document
      const hasIssues = apartmentData.areas.some(area => area.status === 'Not Passed');
      const statusRef = doc(db, `projects/${projectId}/apartmentStatuses`, buildingNumber);
      await setDoc(statusRef, {
        apartments: {
          [apartmentNumber]: hasIssues ? 'issues_found' : 'all_clear'
        }
      }, { merge: true });

      setIsEditing(false);
      console.log('Apartment data saved successfully');
    } catch (error) {
      console.error('Error saving apartment data:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ChevronLeft size={20} />
        <span>{t('back')}</span>
      </button>
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        {t('apartment')} {apartmentNumber} - {t('building')} {buildingNumber} - {t('finishingWorks')}
      </h1>
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 ${activeTab === 'Detection' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('Detection')}
        >
          {t('detection')}
        </button>
        <button
          className={`flex-1 py-2 ${activeTab === 'Fixing' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('Fixing')}
        >
          {t('fixing')}
        </button>
      </div>
      {activeTab === 'Detection' && (
        <div>
          {apartmentData.areas.map((area, index) => (
            <div key={area.name} className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">{area.name}</h3>
              <div className="flex items-center mb-2">
                <select
                  value={area.status || ''}
                  onChange={(e) => handleStatusChange(index, e.target.value as 'Passed' | 'Not Passed')}
                  disabled={!isEditing}
                  className="mr-2 p-2 border rounded text-gray-800 bg-white dark:bg-gray-600 dark:text-white"
                >
                  <option value="">{t('selectStatus')}</option>
                  <option value="Passed">{t('passed')}</option>
                  <option value="Not Passed">{t('notPassed')}</option>
                </select>
                <button
                  onClick={() => handleAddRemark(area.name)}
                  disabled={!isEditing}
                  className="mr-2 p-2 bg-gray-200 dark:bg-gray-600 rounded"
                >
                  <MessageSquare size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files && handleMediaUpload(e.target.files[0], index)}
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
                  <div className="flex flex-wrap">
                    {area.media.map((mediaUrl, idx) => (
                      <a key={idx} href={mediaUrl} target="_blank" rel="noopener noreferrer" className="mr-2 mb-2">
                        <img src={mediaUrl} alt={`Media ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {activeTab === 'Fixing' && (
        <div>
          {apartmentData.issues.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">{t('noIssuesFound')}</p>
          ) : (
            apartmentData.issues.map((issue) => (
              <div key={issue.id} className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">{issue.area}: {issue.description}</h3>
                <div className="flex items-center mb-2">
                  <select
                    value={issue.status}
                    onChange={(e) => {
                      const updatedIssues = apartmentData.issues.map(i => 
                        i.id === issue.id ? {...i, status: e.target.value as Issue['status']} : i
                      );
                      setApartmentData({ ...apartmentData, issues: updatedIssues });
                    }}
                    disabled={!isEditing}
                    className="mr-2 p-2 border rounded text-gray-800 bg-white dark:bg-gray-600 dark:text-white"
                  >
                    <option value="Not Fixed">Not Fixed</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Requires Attention">Requires Attention</option>
                  </select>
                  <button
                    onClick={() => handleAddRemark(issue.area)}
                    disabled={!isEditing}
                    className="mr-2 p-2 bg-gray-200 dark:bg-gray-600 rounded"
                  >
                    <MessageSquare size={20} className="text-gray-600 dark:text-gray-300" />
                  </button>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files && handleMediaUpload(e.target.files[0], apartmentData.areas.findIndex(a => a.name === issue.area))}
                    disabled={!isEditing}
                    className="hidden"
                    id={`issue-media-upload-${issue.id}`}
                  />
                  <label htmlFor={`issue-media-upload-${issue.id}`} className="p-2 bg-gray-200 dark:bg-gray-600 rounded cursor-pointer">
                    <Camera size={20} className="text-gray-600 dark:text-gray-300" />
                  </label>
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
                    <div className="flex flex-wrap">
                      {issue.media.map((mediaUrl, idx) => (
                        <a key={idx} href={mediaUrl} target="_blank" rel="noopener noreferrer" className="mr-2 mb-2">
                          <img src={mediaUrl} alt={`Media ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      <div className="mt-4">
        {isEditing ? (
          <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
            <Save size={20} className="inline-block mr-2" />
            {t('save')}
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
            <Edit size={20} className="inline-block mr-2" />
            {t('edit')}
          </button>
        )}
      </div>
      {showRemarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('addRemark')}</h2>
            <textarea
              value={currentRemark}
              onChange={(e) => setCurrentRemark(e.target.value)}
              className="w-full h-32 p-2 border rounded mb-4 text-gray-800 bg-white dark:bg-gray-700 dark:text-white"
              placeholder={t('enterRemarkHere')}
            ></textarea>
            <div className="flex justify-end">
              <button onClick={() => setShowRemarkModal(false)} className="mr-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded">
                {t('cancel')}
              </button>
              <button onClick={handleSaveRemark} className="px-4 py-2 bg-blue-500 text-white rounded">
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentFinishingWorks;