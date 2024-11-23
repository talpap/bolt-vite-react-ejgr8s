import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Project } from '../types';

export const fetchProjects = async (projectType?: string) => {
  try {
    const projectsCollection = collection(db, 'projects');
    const projectQuery = projectType 
      ? query(projectsCollection, where('projectTypes', 'array-contains', projectType))
      : projectsCollection;
    
    const projectSnapshot = await getDocs(projectQuery);
    return projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const updateProject = async (project: Project) => {
  try {
    const projectRef = doc(db, 'projects', project.id);
    await updateDoc(projectRef, project);
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};