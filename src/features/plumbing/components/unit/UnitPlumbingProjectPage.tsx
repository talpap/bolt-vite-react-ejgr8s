import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { ChevronLeft, Loader } from 'lucide-react';

interface Building {
  number: string;
  apartments: number;
}

interface Project {
  id: string;
  siteName: string;
  siteAddress: string;
  buildings: Building[];
}

interface ApartmentStatus {
  [key: string]: 'not_checked' | 'issues_found' | 'all_clear';
}

interface BuildingStatus {
  [buildingNumber: string]: {
    apartments: ApartmentStatus;
  };
}

const UnitPlumbingProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();
  const [project, setProject] = useState<Project | null>(null);
  const [statuses, setStatuses] = useState<BuildingStatus>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;

      try {
        // Fetch project details
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          setProject({
            id: projectSnap.id,
            ...projectSnap.data()
          } as Project);

          // Fetch apartment statuses
          const statusesRef = doc(db, `projects/${projectId}/apartmentStatuses`, 'plumbing');
          const statusesSnap = await getDoc(statusesRef);
          
          if (statusesSnap.exists()) {
            setStatuses(statusesSnap.data() as BuildingStatus);
          }
        } else {
          setError('Project not found');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'all_clear':
        return 'bg-green-500 text-white';
      case 'issues_found':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin" size={24} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/unit-plumbing" className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ChevronLeft size={20} />
        <span>{t('backToProjects')}</span>
      </Link>

      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {project.siteName}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          {t('projectDetails')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">{project.siteAddress}</p>
      </div>

      <div className="space-y-6">
        {project.buildings.map((building) => (
          <div key={building.number} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {t('building')} {building.number}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {Array.from({ length: building.apartments }, (_, i) => {
                const apartmentNumber = (i + 1).toString().padStart(2, '0');
                const status = statuses[building.number]?.apartments[apartmentNumber];
                
                return (
                  <Link
                    key={apartmentNumber}
                    to={`/unit-plumbing/${projectId}/building/${building.number}/apartment/${apartmentNumber}`}
                    className={`flex items-center justify-center p-2 rounded transition-colors ${getStatusColor(status)}`}
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

export default UnitPlumbingProjectPage;