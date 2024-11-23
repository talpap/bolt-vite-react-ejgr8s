import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { ElectricalData } from '../types';
import { prepareDataForSave } from '../utils';

const initialData: ElectricalData = {
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
};

export const useElectricalData = (
  projectId: string | undefined,
  buildingNumber: string | undefined,
  apartmentNumber: string | undefined
) => {
  const [data, setData] = useState<ElectricalData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !buildingNumber || !apartmentNumber) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/electrical`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data() as ElectricalData);
        } else {
          await setDoc(docRef, initialData);
          setData(initialData);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load inspection data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, buildingNumber, apartmentNumber]);

  const updateData = async (newData: ElectricalData) => {
    if (!projectId || !buildingNumber || !apartmentNumber) {
      setError('Missing required parameters');
      return;
    }

    try {
      const docRef = doc(db, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/electrical`);
      const dataToSave = prepareDataForSave(newData);
      await setDoc(docRef, dataToSave);
      setData(newData);
      setError(null);
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Failed to save inspection data');
    }
  };

  return {
    data,
    loading,
    error,
    updateData,
    isEditing,
    setIsEditing,
  };
};