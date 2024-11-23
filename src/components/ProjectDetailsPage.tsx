import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader, ChevronLeft } from 'lucide-react';

interface Building {
  number: string;
  apartments: number;
}

interface Project {
  id: string;
  siteName: string;
  siteAddress: string;
  projectManager: string;
  projectManagerPhone: string;
  projectManagerEmail: string;
  buildings: Building[];
}

interface ApartmentStatus {
  [apartmentNumber: string]: 'not_checked' | 'issues_found' | 'all_clear';
}

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();
  const [project, setProject] = useState<Project | null>(null);
  const [apartmentStatuses, setApartmentStatuses] = useState<Record<string, ApartmentStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const projectType = location.pathname.split('/')[1];

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;

      setLoading(true);
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);

          // Fetch apartment statuses
          const statusesSnapshot = await getDocs(collection(db, `projects/${projectId}/apartmentStatuses`));
          const statusesData: Record<string, ApartmentStatus> = {};
          statusesSnapshot.forEach((doc) => {
            statusesData[doc.id] = doc.data().apartments;
          });
          setApartmentStatuses(statusesData);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_checked':
        return 'bg-gray-200 text-gray-800';
      case 'issues_found':
        return 'bg-red-500 text-white';
      case 'all_clear':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin mr-2" />
        <span>{t('loading')}</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">{t('error')}: </strong>
          <span className="block sm:inline">{error || t('projectNotFound')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to={`/${projectType}`} className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ChevronLeft size={20} />
        <span>{t('backToProjects')}</span>
      </Link>
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">{project.siteName}</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('projectDetails')}</h2>
        <p><strong>{t('address')}:</strong> {project.siteAddress}</p>
        <p><strong>{t('projectManager')}:</strong> {project.projectManager}</p>
        <p><strong>{t('phone')}:</strong> {project.projectManagerPhone}</p>
        <p><strong>{t('email')}:</strong> {project.projectManagerEmail}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{t('buildings')}</h2>
        {project.buildings.map((building) => (
          <div key={building.number} className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{t('buildingNumber', { number: building.number })}</h3>
            <div className="grid grid-cols-5 gap-2">
              {[...Array(building.apartments)].map((_, index) => {
                const apartmentNumber = (index + 1).toString().padStart(2, '0');
                const status = apartmentStatuses[building.number]?.[apartmentNumber] || 'not_checked';
                return (
                  <Link
                    key={apartmentNumber}
                    to={`/${projectType}/${projectId}/building/${building.number}/apartment/${apartmentNumber}`}
                    className={`flex items-center justify-center p-2 rounded ${getStatusColor(status)} font-semibold`}
                  >
                    {apartmentNumber}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;