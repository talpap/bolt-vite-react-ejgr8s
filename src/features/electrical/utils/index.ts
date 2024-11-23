import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../../firebase';
import { ElectricalData } from '../types';

export const uploadMedia = async (projectId: string, buildingNumber: string, apartmentNumber: string, file: File) => {
  try {
    const storageRef = ref(storage, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/electrical/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};

export const deleteMedia = async (projectId: string, buildingNumber: string, apartmentNumber: string, fileName: string) => {
  try {
    const fileRef = ref(storage, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/electrical/${fileName}`);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
};

export const prepareDataForSave = (data: ElectricalData) => {
  return {
    ...data,
    issues: data.issues.map(issue => ({
      ...issue,
      dateAdded: issue.dateAdded instanceof Date ? issue.dateAdded.toISOString() : issue.dateAdded,
    }))
  };
};