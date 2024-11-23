import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase';

export const uploadPhoto = async (projectId: string, file: File) => {
  try {
    const storageRef = ref(storage, `projects/${projectId}/communication/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const formatTimestamp = (timestamp: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp);
};