import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { ApartmentData } from '../types';

const initialData: ApartmentData = {
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
};

export const useUnitPlumbingData = (
  projectId: string | undefined,
  buildingNumber: string | undefined,
  apartmentNumber: string | undefined
) => {
  const [data, setData] = useState<ApartmentData>(initialData);
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
        const docRef = doc(
          db,
          'projects',
          projectId,
          'buildings',
          buildingNumber,
          'apartments',
          apartmentNumber,
          'plumbing',
          'inspection'
        );
        
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as ApartmentData;
          // Convert Firestore timestamps to Dates for issues
          fetchedData.issues = fetchedData.issues.map(issue => ({
            ...issue,
            dateAdded: issue.dateAdded.toDate(),
          }));
          setData(fetchedData);
        } else {
          // Initialize with default data if document doesn't exist
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

  const updateData = async (newData: ApartmentData) => {
    if (!projectId || !buildingNumber || !apartmentNumber) {
      setError('Missing required parameters');
      return;
    }

    try {
      const docRef = doc(
        db,
        'projects',
        projectId,
        'buildings',
        buildingNumber,
        'apartments',
        apartmentNumber,
        'plumbing',
        'inspection'
      );
      
      await setDoc(docRef, newData);
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