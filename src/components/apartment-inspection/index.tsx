import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { ChevronLeft, Save, Edit } from 'lucide-react';
import { ApartmentData, Issue } from './types';
import DetectionTab from './DetectionTab';
import FixingTab from './FixingTab';
import RemarkModal from './RemarkModal';

const ApartmentInspection: React.FC = () => {
  const { projectId, buildingNumber, apartmentNumber } = useParams<{
    projectId: string;
    buildingNumber: string;
    apartmentNumber: string;
  }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Detection' | 'Fixing'>('Detection');
  const [apartmentData, setApartmentData] = useState<ApartmentData>({
    areas: [
      { name: 'Main Bathroom', status: null, remarks: [], media: [] },
      { name: 'Kitchen', status: null, remarks: [], media: [] },
      { name: "Parents' Bathroom", status: null, remarks: [], media: [] },
      { name: 'Guests Bathroom', status: null, remarks: [], media: [] },
      { name: 'Service Balcony', status: null, remarks: [], media: [] },
      { name: 'Sun Terrace', status: null, remarks: [], media: [] },
      { name: 'Air Conditioner Drain', status: null, remarks: [], media: [] },
      { name: 'Laundry Area', status: null, remarks: [], media: [] },
      { name: 'Cold Water Circuit', status: null, remarks: [], media: [] },
      { name: 'Hot Water Circuit', status: null, remarks: [], media: [] },
    ],
    issues: [],
  });
  const [isEditing, setIsEditing] = useState(true);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [currentRemarkArea, setCurrentRemarkArea] = useState<string | null>(null);
  const [currentRemark, setCurrentRemark] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'area' | 'date'>('area');

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
    
    if (status === 'Not Passed') {
      const newIssue: Issue = {
        id: Date.now().toString(),
        area: newAreas[index].name,
        description: `Issue in ${newAreas[index].name}`,
        status: 'Custom',
        dateAdded: new Date(),
        remarks: newAreas[index].remarks,
        media: newAreas[index].media,
      };
      setApartmentData(prevData => ({
        ...prevData,
        areas: newAreas,
        issues: [...prevData.issues, newIssue],
      }));
    } else {
      setApartmentData(prevData => ({
        ...prevData,
        areas: newAreas,
        issues: prevData.issues.filter(issue => issue.area !== newAreas[index].name),
      }));
    }
  };

  const handleAddRemark = (areaName: string) => {
    setCurrentRemarkArea(areaName);
    setShowRemarkModal(true);
  };

  const handleSaveRemark = () => {
    if (currentRemarkArea && currentRemark) {
      setApartmentData(prevData => {
        const newData = { ...prevData };
        const areaIndex = newData.areas.findIndex(area => area.name === currentRemarkArea);
        
        if (areaIndex !== -1 && !newData.areas[areaIndex].remarks.includes(currentRemark)) {
          newData.areas[areaIndex].remarks.push(currentRemark);
        }
        
        const issueIndex = newData.issues.findIndex(issue => issue.area === currentRemarkArea);
        if (issueIndex !== -1 && !newData.issues[issueIndex].remarks.includes(currentRemark)) {
          newData.issues[issueIndex].remarks.push(currentRemark);
        }
        
        return newData;
      });
      setShowRemarkModal(false);
      setCurrentRemarkArea(null);
      setCurrentRemark('');
    }
  };

  const handleDeleteRemark = (areaName: string, remark: string) => {
    setApartmentData(prevData => {
      const newData = { ...prevData };
      const areaIndex = newData.areas.findIndex(area => area.name === areaName);
      
      if (areaIndex !== -1) {
        newData.areas[areaIndex].remarks = newData.areas[areaIndex].remarks.filter(r => r !== remark);
      }
      
      const issueIndex = newData.issues.findIndex(issue => issue.area === areaName);
      if (issueIndex !== -1) {
        newData.issues[issueIndex].remarks = newData.issues[issueIndex].remarks.filter(r => r !== remark);
      }
      
      return newData;
    });
  };

  const handleMediaUpload = async (file: File, areaName: string) => {
    if (!projectId || !buildingNumber || !apartmentNumber) return;

    try {
      const fileRef = ref(storage, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      setApartmentData(prevData => {
        const newData = { ...prevData };
        const areaIndex = newData.areas.findIndex(area => area.name === areaName);
        
        if (areaIndex !== -1 && !newData.areas[areaIndex].media.includes(downloadURL)) {
          newData.areas[areaIndex].media.push(downloadURL);
        }
        
        const issueIndex = newData.issues.findIndex(issue => issue.area === areaName);
        if (issueIndex !== -1 && !newData.issues[issueIndex].media.includes(downloadURL)) {
          newData.issues[issueIndex].media.push(downloadURL);
        }
        
        return newData;
      });

      console.log('Media uploaded successfully');
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };

  const handleDeleteMedia = async (areaName: string, mediaUrl: string) => {
    try {
      const fileName = mediaUrl.split('/').pop();
      if (!fileName || !projectId || !buildingNumber || !apartmentNumber) return;

      const fileRef = ref(storage, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/${fileName}`);
      await deleteObject(fileRef);

      setApartmentData(prevData => {
        const newData = { ...prevData };
        const areaIndex = newData.areas.findIndex(area => area.name === areaName);
        
        if (areaIndex !== -1) {
          newData.areas[areaIndex].media = newData.areas[areaIndex].media.filter(url => url !== mediaUrl);
        }
        
        const issueIndex = newData.issues.findIndex(issue => issue.area === areaName);
        if (issueIndex !== -1) {
          newData.issues[issueIndex].media = newData.issues[issueIndex].media.filter(url => url !== mediaUrl);
        }
        
        return newData;
      });

      console.log('Media deleted successfully');
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleSave = async () => {
    if (!projectId || !buildingNumber || !apartmentNumber) return;

    try {
      const apartmentRef = doc(db, `projects/${projectId}/buildings/${buildingNumber}/apartments`, apartmentNumber);
      await setDoc(apartmentRef, apartmentData, { merge: true });

      const hasUnresolvedIssues = apartmentData.issues.some(issue => issue.status !== 'Fixed');
      const statusRef = doc(db, `projects/${projectId}/apartmentStatuses`, buildingNumber);
      await setDoc(statusRef, {
        apartments: {
          [apartmentNumber]: hasUnresolvedIssues ? 'issues_found' : 'all_clear'
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
        {t('apartment')} {apartmentNumber} - {t('building')} {buildingNumber}
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

      {activeTab === 'Detection' ? (
        <DetectionTab
          areas={apartmentData.areas}
          isEditing={isEditing}
          onStatusChange={handleStatusChange}
          onAddRemark={handleAddRemark}
          onDeleteRemark={handleDeleteRemark}
          onMediaUpload={handleMediaUpload}
          onDeleteMedia={handleDeleteMedia}
        />
      ) : (
        <FixingTab
          issues={apartmentData.issues}
          isEditing={isEditing}
          filterStatus={filterStatus}
          sortBy={sortBy}
          onFilterChange={setFilterStatus}
          onSortChange={setSortBy}
          onStatusChange={(issueId, status) => {
            const updatedIssues = apartmentData.issues.map(i =>
              i.id === issueId ? { ...i, status } : i
            );
            setApartmentData({ ...apartmentData, issues: updatedIssues });
          }}
          onAddRemark={handleAddRemark}
          onDeleteRemark={handleDeleteRemark}
          onMediaUpload={handleMediaUpload}
          onDeleteMedia={handleDeleteMedia}
        />
      )}

      <div className="mt-4">
        {isEditing ? (
          <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            <Save size={20} className="inline-block mr-2" />
            {t('save')}
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            <Edit size={20} className="inline-block mr-2" />
            {t('edit')}
          </button>
        )}
      </div>

      <RemarkModal
        isOpen={showRemarkModal}
        remark={currentRemark}
        onClose={() => {
          setShowRemarkModal(false);
          setCurrentRemarkArea(null);
          setCurrentRemark('');
        }}
        onChange={setCurrentRemark}
        onSave={handleSaveRemark}
      />
    </div>
  );
};

export default ApartmentInspection;