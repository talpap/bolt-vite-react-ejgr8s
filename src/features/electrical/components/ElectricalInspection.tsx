import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../firebase';
import { ChevronLeft, Camera, MessageSquare, Save, Edit, Trash2 } from 'lucide-react';

interface Area {
  name: string;
  status: 'Passed' | 'Not Passed' | null;
  remarks: string[];
  media: string[];
}

interface ElectricalData {
  areas: Area[];
  issues: Array<{
    id: string;
    area: string;
    description: string;
    status: 'Fixed' | 'Pending' | 'Requires Specialist';
    dateAdded: Date;
    remarks: string[];
    media: string[];
  }>;
}

const ElectricalInspection: React.FC = () => {
  const { projectId, buildingNumber, apartmentNumber } = useParams<{ 
    projectId: string; 
    buildingNumber: string; 
    apartmentNumber: string; 
  }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<ElectricalData>({
    areas: [
      { name: 'Main Circuit Breaker', status: null, remarks: [], media: [] },
      { name: 'Distribution Panel', status: null, remarks: [], media: [] },
      { name: 'Living Room Outlets', status: null, remarks: [], media: [] },
      { name: 'Kitchen Outlets', status: null, remarks: [], media: [] },
      { name: 'Bedroom Outlets', status: null, remarks: [], media: [] },
      { name: 'Lighting Fixtures', status: null, remarks: [], media: [] },
      { name: 'Switches', status: null, remarks: [], media: [] },
      { name: 'Grounding System', status: null, remarks: [], media: [] },
      { name: 'Air Conditioning Circuit', status: null, remarks: [], media: [] },
      { name: 'Emergency Lighting', status: null, remarks: [], media: [] },
    ],
    issues: []
  });
  const [isEditing, setIsEditing] = useState(true);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [currentRemarkArea, setCurrentRemarkArea] = useState<string | null>(null);
  const [currentRemark, setCurrentRemark] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !buildingNumber || !apartmentNumber) return;

      try {
        const docRef = doc(db, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/electrical`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data() as ElectricalData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [projectId, buildingNumber, apartmentNumber]);

  const handleStatusChange = async (index: number, status: 'Passed' | 'Not Passed') => {
    const newAreas = [...data.areas];
    newAreas[index].status = status;
    setData({ ...data, areas: newAreas });
  };

  const handleSave = async () => {
    if (!projectId || !buildingNumber || !apartmentNumber) return;

    try {
      const docRef = doc(db, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/electrical`);
      await setDoc(docRef, data);

      const statusRef = doc(db, `projects/${projectId}/apartmentStatuses`, buildingNumber);
      const hasIssues = data.areas.some(area => area.status === 'Not Passed');
      await setDoc(statusRef, {
        apartments: {
          [apartmentNumber]: hasIssues ? 'issues_found' : 'all_clear'
        }
      }, { merge: true });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Add the rest of the handlers (media upload, remarks, etc.) similar to UnitInspection

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ChevronLeft size={20} />
        <span>{t('back')}</span>
      </button>
      
      <h1 className="text-2xl font-bold mb-6">
        {t('electricalInspection')} - {t('apartment')} {apartmentNumber}
      </h1>

      {data.areas.map((area, index) => (
        <div key={area.name} className="mb-4 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-2">{area.name}</h3>
          <div className="flex items-center space-x-2">
            <select
              value={area.status || ''}
              onChange={(e) => handleStatusChange(index, e.target.value as 'Passed' | 'Not Passed')}
              disabled={!isEditing}
              className="border rounded p-2"
            >
              <option value="">{t('selectStatus')}</option>
              <option value="Passed">{t('passed')}</option>
              <option value="Not Passed">{t('notPassed')}</option>
            </select>
            {/* Add media upload and remarks buttons */}
          </div>
          {/* Add remarks and media display sections */}
        </div>
      ))}

      <div className="mt-4">
        {isEditing ? (
          <button 
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <Save className="inline-block mr-2" size={20} />
            {t('save')}
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            <Edit className="inline-block mr-2" size={20} />
            {t('edit')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ElectricalInspection;